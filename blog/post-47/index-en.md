---
date: '2025-11-22 12:10:00'
slug: 'cooking-ic-dbms-canister-memory-management'
title: 'Cooking ic-dbms-canister: Memory Management'
subtitle: 'A tale of building a framework for building DBMS on Internet Computer - Chapter 2'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: rust
---

## Introduction

This article is part of a series where I document the development of `ic-dbms-canister`, a framework for building database management systems (DBMS) on the Internet Computer (IC). In the [previous article](https://blog.veeso.dev/blog/en/cooking-ic-dbms-canister-the-journey-begins/), I introduced the project and its goals. In this article, I will focus on the memory management component of the framework.

## Memory Provider

In order to be able to test the Memory manager when we don't run on the Internet Computer, I have implemented a `MemoryProvider` trait to abstract away the memory io operations:

```rust
/// Memory Provider trait defines the interface for interacting with the underlying memory.
///
/// It is mainly required because in tests we cannot use the actual stable memory of the IC,
/// so we need to provide a heap-based implementation for testing purposes.
pub trait MemoryProvider {
    /// The size of a memory page in bytes.
    const PAGE_SIZE: u64;

    /// Gets the current size of the memory in bytes.
    fn size(&self) -> u64;

    /// Attempts to grow the memory by `new_pages` (added pages).
    ///
    /// Returns an error if it wasn't possible. Otherwise, returns the previous size that was reserved.
    ///
    /// Actual reserved size after the growth will be `previous_size + (new_pages * PAGE_SIZE)`.
    fn grow(&mut self, new_pages: u64) -> MemoryResult<u64>;

    /// Reads data from memory starting at `offset` into the provided buffer `buf`.
    ///
    /// Returns an error if `offset + buf.len()` exceeds the current memory size.
    fn read(&self, offset: u64, buf: &mut [u8]) -> MemoryResult<()>;

    /// Writes data from the provided buffer `buf` into memory starting at `offset`.
    ///
    /// Returns an error if `offset + buf.len()` exceeds the current memory size.
    fn write(&mut self, offset: u64, buf: &[u8]) -> MemoryResult<()>;
}
```

And I implemented two providers:

```rust

/// An implementation of [`MemoryProvider`] that uses the Internet Computer's stable memory.
#[cfg(target_family = "wasm")]
#[derive(Default)]
pub struct IcMemoryProvider;

#[cfg(target_family = "wasm")]
impl MemoryProvider for IcMemoryProvider {
    const PAGE_SIZE: u64 = ic_cdk::stable::WASM_PAGE_SIZE_IN_BYTES;

    fn grow(&mut self, new_pages: u64) -> MemoryResult<u64> {
        ic_cdk::stable::stable_grow(new_pages).map_err(MemoryError::StableMemoryError)
    }

    fn size(&self) -> u64 {
        ic_cdk::stable::stable_size() * Self::PAGE_SIZE
    }

    fn read(&self, offset: u64, buf: &mut [u8]) -> MemoryResult<()> {
        // check if the read is within bounds
        if offset + buf.len() as u64 > self.size() {
            return Err(MemoryError::OutOfBounds);
        }

        ic_cdk::stable::stable_read(offset, buf);
        Ok(())
    }

    fn write(&mut self, offset: u64, buf: &[u8]) -> MemoryResult<()> {
        // check if the write is within bounds
        if offset + buf.len() as u64 > self.size() {
            return Err(MemoryError::OutOfBounds);
        }

        ic_cdk::stable::stable_write(offset, buf);
        Ok(())
    }
}
```

And one which uses heap memory for testing:

```rust
/// An implementation of [`MemoryProvider`] that uses heap memory for testing purposes.
#[derive(Debug, Default)]
pub struct HeapMemoryProvider {
    memory: Vec<u8>,
}

impl MemoryProvider for HeapMemoryProvider {
    const PAGE_SIZE: u64 = ic_cdk::stable::WASM_PAGE_SIZE_IN_BYTES; // 64 KiB

    fn grow(&mut self, new_pages: u64) -> MemoryResult<u64> {
        let previous_size = self.size();
        let additional_size = (new_pages * Self::PAGE_SIZE) as usize;
        self.memory
            .resize(previous_size as usize + additional_size, 0);
        Ok(previous_size)
    }

    fn size(&self) -> u64 {
        self.memory.len() as u64
    }

    fn read(&self, offset: u64, buf: &mut [u8]) -> MemoryResult<()> {
        // check if the read is within bounds
        if offset + buf.len() as u64 > self.size() {
            return Err(MemoryError::OutOfBounds);
        }

        buf.copy_from_slice(&self.memory[offset as usize..(offset as usize + buf.len())]);
        Ok(())
    }

    fn write(&mut self, offset: u64, buf: &[u8]) -> MemoryResult<()> {
        // check if the write is within bounds
        if offset + buf.len() as u64 > self.size() {
            return Err(MemoryError::OutOfBounds);
        }

        self.memory[offset as usize..(offset as usize + buf.len())].copy_from_slice(buf);
        Ok(())
    }
}
```

At this point our `MemoryManager` can be generic over the `MemoryProvider` trait, allowing us to use either the IC stable memory or the heap memory for testing:

```rust
/// The memory manager is the main struct responsible for handling the stable memory operations.
///
/// It takes advantage of [`MemoryDelegate`]s to know how to allocate and write memory for different kind of data.
pub struct MemoryManager<P: MemoryProvider> {
    provider: P,
}
```

## Memory Manager

The `MemoryManager` API has actually changed a bit to make it easier to use with data types. Also it is not responsible for writing schema page anymore.

Also the header page has been renamed to schema page.

```rust
impl<P> MemoryManager<P>
where
    P: MemoryProvider,
{
    /// Initializes the memory manager and allocates the header and reserved pages.
    ///
    /// Panics if the memory provider fails to initialize.
    fn init(provider: P) -> Self {
        let mut manager = MemoryManager { provider };

        // check whether two pages are already allocated
        if manager.provider.pages() >= 2 {
            return manager;
        }

        // request at least 2 pages for header and ACL
        if let Err(err) = manager.provider.grow(2) {
            crate::trap!("Failed to grow stable memory during initialization: {err}");
        }

        manager
    }

    /// Returns the ACL page number.
    pub const fn acl_page(&self) -> Page {
        ACL_PAGE
    }

    /// Returns the schema page and offset
    pub const fn schema_page(&self) -> Page {
        SCHEMA_PAGE
    }

    /// Allocates an additional page in memory.
    ///
    /// In case of success returns the [`Page`] number.
    pub fn allocate_page(&mut self) -> MemoryResult<Page> {
        self.provider.grow(1)?;

        match self.last_page() {
            Some(page) => Ok(page),
            None => Err(MemoryError::FailedToAllocatePage),
        }
    }

    /// Read data as a [`Encode`] impl at the specified page and offset.
    pub fn read_at<D>(&self, page: Page, offset: PageOffset) -> MemoryResult<D>
    where
        D: Encode,
    {
        // page must be allocated
        if self.last_page().map_or(true, |last_page| page > last_page) {
            return Err(MemoryError::SegmentationFault);
        }

        // read until end of the page (or fixed size)
        let mut buf = vec![
            0u8;
            match D::SIZE {
                DataSize::Fixed(size) => size,
                DataSize::Variable => (P::PAGE_SIZE as usize) - (offset as usize),
            }
        ];

        // if page exists, the read must be within bounds
        if offset as u64 + buf.len() as u64 > P::PAGE_SIZE {
            return Err(MemoryError::SegmentationFault);
        }

        // get absolute offset
        let absolute_offset = self.absolute_offset(page, offset);
        self.provider.read(absolute_offset, &mut buf)?;

        Ok(D::decode(std::borrow::Cow::Owned(buf)))
    }

    /// Write data as a [`Encode`] impl at the specified page and offset.
    pub fn write_at<E>(&mut self, page: Page, offset: PageOffset, data: &E) -> MemoryResult<()>
    where
        E: Encode,
    {
        // page must be allocated
        if self.last_page().map_or(true, |last_page| page > last_page) {
            return Err(MemoryError::SegmentationFault);
        }

        let encoded = data.encode();

        // if page exists, the write must be within bounds
        if offset as u64 + encoded.len() as u64 > P::PAGE_SIZE {
            return Err(MemoryError::SegmentationFault);
        }

        // get absolute offset
        let absolute_offset = self.absolute_offset(page, offset);
        self.provider.write(absolute_offset, encoded.as_ref())
    }

    /// Gets the last allocated page number.
    fn last_page(&self) -> Option<Page> {
        match self.provider.pages() {
            0 => None,
            n => Some(n as Page - 1),
        }
    }

    /// Calculates the absolute offset in stable memory given a page number and an offset within that page.
    fn absolute_offset(&self, page: Page, offset: PageOffset) -> u64 {
        (page as u64)
            .checked_mul(P::PAGE_SIZE)
            .and_then(|page_offset| page_offset.checked_add(offset as u64))
            .expect("Overflow when calculating absolute offset")
    }
}
```

## Schema Registry Table

A very important part of the memory management is the schema table, where we store the pointers to each table registry page.

```rust
/// Data regarding the table registry page.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct TableRegistryPage {
    pub pages_list_page: Page,
    pub free_segments_page: Page,
}

/// The schema registry takes care of storing and retrieving table schemas from memory.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SchemaRegistry {
    tables: HashMap<TableFingerprint, TableRegistryPage>,
}
```

I have defined the `SchemaRegistry` struct which holds a map of table fingerprints to their corresponding registry pages. The `TableRegistryPage` struct contains information about the pages used for storing the list of pages and free segments for each table.

The `SchemaRegistry` index the tables by a `TableFingerprint`, which is a unique identifier for each table schema.

I still need to figure out how to calculate the fingerprint for each table schema.

## ACL

The Access Control List (ACL) is responsible for managing the principals that are allowed to access the database.

```rust
thread_local! {
    /// The global ACL.
    ///
    /// We allow failing because on first initialization the ACL might not be present yet.
    pub static ACL: RefCell<AccessControlList> = RefCell::new(AccessControlList::load().unwrap_or_default());
}

/// Access control list module.
///
/// Takes care of storing and retrieving the list of principals that have access to the database.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct AccessControlList {
    allowed: Vec<Principal>,
}
```

And the ACL API allows to add, remove and check principals:

```rust
impl AccessControlList {
    /// Load [`AccessControlList`] from memory.
    pub fn load() -> MemoryResult<Self> {
        // read memory location from MEMORY_MANAGER
        MEMORY_MANAGER.with_borrow(|m| m.read_at(m.acl_page(), 0))
    }

    /// Get the list of allowed principals.
    pub fn allowed_principals(&self) -> &[Principal];

    /// Get whether a principal is allowed.
    pub fn is_allowed(&self, principal: &Principal) -> bool;

    /// Add a principal to the allowed list.
    ///
    /// If the principal is already present, do nothing.
    /// Otherwise, add the principal and write the updated ACL to memory.
    pub fn add_principal(&mut self, principal: Principal) -> MemoryResult<()>;

    /// Remove a principal from the allowed list.
    ///
    /// If the principal is not present, do nothing.
    /// Otherwise, remove the principal and write the updated ACL to memory.
    pub fn remove_principal(&mut self, principal: &Principal) -> MemoryResult<()>;

    /// Write [`AccessControlList`] to memory.
    fn write(&self) -> MemoryResult<()> {
        // write to memory location from MEMORY_MANAGER
        MEMORY_MANAGER.with_borrow_mut(|m| m.write_at(m.acl_page(), 0, self))
    }
}
```

## Tables

Finally we can start implementing the table management API.

There are mainly these components:

- **Table Registry**: Takes care of storing the records for each table, using the two ledgers to derive exactly where to read/write
  - **Table Page Ledger**: Takes care of storing the list of pages for each table
  - **Free Segments Ledger**: Takes care of storing the list of free segments for each table

The table registry takes a `Encode` implementation for the table schema, and uses it to read and write records based on the kind of data.

### Table Registry

The table registry is responsible for managing the records of each table, utilizing the `FreeSegmentsLedger` and `PageLedger` to determine where to read and write data.

```rust
/// The table registry takes care of storing the records for each table,
/// using the [`FreeSegmentsLedger`] and [`PageLedger`] to derive exactly where to read/write
pub struct TableRegistry<E>
where
    E: Encode,
{
    _marker: PhantomData<E>,
    free_segments_ledger: FreeSegmentsLedger,
    page_ledger: PageLedger,
}
```

#### Page Ledger

The page ledger is defined as follows:

```rust
/// Takes care of storing the pages for each table
#[derive(Debug)]
pub struct PageLedger {
    /// The page where the ledger is stored in memory.
    ledger_page: Page,
    /// The pages table.
    pages: PageTable,
}

impl PageLedger {
    /// Load the page ledger from memory at the given [`Page`].
    pub fn load(page: Page) -> MemoryResult<Self> {
        Ok(Self {
            pages: MEMORY_MANAGER.with_borrow(|mm| mm.read_at(page, 0))?,
            ledger_page: page,
        })
    }
}
```

And there are two functions to get the page for writing the provided record, and to commit the allocation after writing:

```rust
/// Get the page number to store the next record.
///
/// It usually returns the first page with enough free space.
/// If the provided record is larger than any page's free space,
/// it allocates a new page and returns it.
pub fn get_page_for_record<R>(&mut self, record: &R) -> MemoryResult<Page>
    where
        R: Encode;

/// Commits the allocation of a record in the given page.
///
/// This will commit the eventual allocated page
/// and decrease the free space available in the page and write the updated ledger to memory.
pub fn commit<R>(&mut self, page: Page, record: &R) -> MemoryResult<()>
where
    R: Encode;
```

#### Free Segments Ledger

And finally we have the Free Segments Ledger:

```rust
/// The free segments ledger keeps track of free segments in the [`FreeSegmentsTable`] registry.
///
/// Free segments can occur either when a record is deleted or
/// when a record is moved to a different location due to resizing after an update.
///
/// Each record tracks:
///
/// - The page number where the record was located
/// - The offset within that page
/// - The size of the free segment
///
/// The responsibilities of this ledger include:
///
/// - Storing metadata about free segments whenever a record is deleted or moved
/// - Find a suitable location for new records by reusing space from free segments
pub struct FreeSegmentsLedger {
    /// The page where the free segments ledger is stored in memory.
    free_segments_page: Page,
    /// Free segments table that holds metadata about free segments.
    table: FreeSegmentsTable,
}

impl FreeSegmentsTable {
    /// Inserts a new [`FreeSegment`] into the table.
    pub fn insert_free_segment(&mut self, page: Page, offset: usize, size: usize);

    /// Finds a free segment that matches the given predicate.
    pub fn find<F>(&self, predicate: F) -> Option<FreeSegment>
    where
        F: Fn(&&FreeSegment) -> bool;

    /// Removes a free segment that matches the given parameters.
    ///
    /// If `used_size` is less than `size`, the old record is removed, but a new record is added
    /// for the remaining free space.
    pub fn remove(&mut self, page: Page, offset: PageOffset, size: MSize, used_size: MSize);
}
```

The `FreeSegmentsTable` must both allow to insert new free segments to reuse space, but it must also optimize space reuse when removing segments.

This means that whenever we remove a free segment because we want to reuse its space, if the used size is less than the total size of the free segment, we must add a new free segment for the remaining free space.

```rust
impl FreeSegmentsTable {
    /// Removes a free segment that matches the given parameters.
    ///
    /// If `used_size` is less than `size`, the old record is removed, but a new record is added
    /// for the remaining free space.
    pub fn remove(&mut self, page: Page, offset: PageOffset, size: MSize, used_size: MSize) {
        if let Some(pos) = self
            .records
            .iter()
            .position(|r| r.page == page && r.offset == offset && r.size == size)
        {
            self.records.swap_remove(pos);

            // If there is remaining space, add a new record for it.
            if used_size < size {
                let remaining_size = size.saturating_sub(used_size);
                let new_offset = offset.saturating_add(used_size);
                let new_record = DeletedRecord {
                    page,
                    offset: new_offset,
                    size: remaining_size,
                };
                self.records.push(new_record);
            }
        }
    }
}
```

#### Table CRUD

Finally the `TableRegistry` exposes the main API to read and write records:

```rust
impl<E> TableRegistry<E> {
    /// Inserts a new record into the table registry.
    ///
    /// NOTE: this function does NOT make any logical checks on the record being inserted.
    pub fn insert(&mut self, record: E) -> MemoryResult<()>;

    /// Creates a [`TableReader`] to read records from the table registry.
    ///
    /// Use [`TableReader::try_next`] to read records one by one.
    pub fn read(&self) -> TableReader<'_, E>;

    /// Deletes a record at the given page and offset.
    ///
    /// The space occupied by the record is marked as free and zeroed.
    pub fn delete(&mut self, record: E, page: Page, offset: PageOffset) -> MemoryResult<()>;

    /// Updates a record at the given page and offset.
    ///
    /// The logic is the following:
    ///
    /// 1. If the new record has exactly the same size of the old record, overwrite it in place.
    /// 2. If the new record does not fit, delete the old record and insert the new record.
    pub fn update(
        &mut self,
        new_record: E,
        old_record: E,
        old_page: Page,
        old_offset: PageOffset,
    ) -> MemoryResult<()>;
}
```

So while the `TableRegistry` provides CRUD operations, beware that it does not perform any logical checks on the records being inserted, but it's just an interface to read and write records in memory.

All the logical checks must be performed at a higher level by the DBMS layer.

#### Raw Record

All the records in the table registry are stored as `RawRecord<E>`, which contains the encoded data along with metadata about its size:

```rust
pub const RAW_RECORD_HEADER_MAGIC_NUMBER: u8 = 0xFF;

/// A raw record stored in memory, consisting of its length and data.
pub struct RawRecord<E>
where
    E: Encode,
{
    length: MSize,
    pub data: E,
}

impl<E> RawRecord<E>
where
    E: Encode,
{
    /// Creates a new raw record from the given data.
    pub fn new(data: E) -> Self {
        let length = data.size();
        Self { length, data }
    }
}

impl<E> Encode for RawRecord<E>
where
    E: Encode,
{
    const SIZE: crate::memory::DataSize = crate::memory::DataSize::Variable;

    fn size(&self) -> MSize {
        super::RAW_RECORD_HEADER_SIZE + self.length // 1 (start) + 2 bytes for length + data size
    }

    fn encode(&'_ self) -> std::borrow::Cow<'_, [u8]> {
        let mut encoded = Vec::with_capacity(self.size() as usize);
        encoded.push(RAW_RECORD_HEADER_MAGIC_NUMBER); // start byte
        encoded.extend_from_slice(&self.length.to_le_bytes());
        encoded.extend_from_slice(&self.data.encode());
        std::borrow::Cow::Owned(encoded)
    }

    fn decode(data: std::borrow::Cow<[u8]>) -> crate::memory::MemoryResult<Self>
    where
        Self: Sized,
    {
        if data.len() < 3 {
            return Err(MemoryError::DecodeError(DecodeError::TooShort));
        }
        if data[0] != RAW_RECORD_HEADER_MAGIC_NUMBER {
            return Err(MemoryError::DecodeError(DecodeError::BadRawRecordHeader));
        }
        let length = u16::from_le_bytes([data[1], data[2]]) as MSize;
        if data.len() < (RAW_RECORD_HEADER_SIZE as usize) + length as usize {
            return Err(MemoryError::DecodeError(DecodeError::TooShort));
        }
        let data_slice = &data[(RAW_RECORD_HEADER_SIZE as usize)
            ..(RAW_RECORD_HEADER_SIZE as usize) + length as usize];
        let data_cow = std::borrow::Cow::Borrowed(data_slice);
        let data_decoded = E::decode(data_cow)?;
        Ok(Self {
            length,
            data: data_decoded,
        })
    }
}
```

We use a `0xff` byte as a magic number to identify the start of a raw record, followed by a 2-byte length field and then the actual encoded data.

The `0xff` magic number helps to quickly identify valid records in memory. Just using the size would be problematic for reading, because the first byte could be zero for certain lengths, making it hard to distinguish whether it is the first byte or the second byte of the length field.

#### Table Reader

The read operation returns a `TableReader`, which allows to read records one by one:

```rust
/// Represents the next record read by the [`TableReader`].
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct NextRecord<E>
where
    E: Encode,
{
    pub record: E,
    pub page: Page,
    pub offset: PageOffset,
}

/// A reader for the table registry that allows reading records from memory.
///
/// The table reader provides methods to read records from the table registry one by one,
/// using the underlying [`PageLedger`] to locate the records in memory.
pub struct TableReader<'a, E>
where
    E: Encode,
{
    /// Buffer used to read records from memory.
    buffer: Vec<u8>,
    page_ledger: &'a PageLedger,
    page_size: usize,
    phantom: PhantomData<E>,
    /// Current position in the table registry.
    /// If `None`, the reader has reached the end of the table.
    position: Option<Position>,
}

impl<'a, E> TableReader<'a, E>
where
    E: Encode,
{

    /// Reads the next record from the table registry.
    pub fn try_next(&mut self) -> MemoryResult<Option<NextRecord<E>>> {
        let Some(Position { page, offset, size }) = self.position else {
            return Ok(None);
        };

        // find next record segment
        let Some(next_record) = self.find_next_record(page, offset, size)? else {
            // no more records
            self.position = None;
            return Ok(None);
        };

        // read raw record
        let record: RawRecord<E> =
            MEMORY_MANAGER.with_borrow(|mm| mm.read_at(next_record.page, next_record.offset))?;

        // update position
        self.position = next_record.new_position;

        Ok(Some(NextRecord {
            record: record.data,
            page: next_record.page,
            offset: next_record.offset,
        }))
    }
}
```

The DBMS layer will use the table reader to read records one by one, without needing to know the details of how records are stored in memory.
