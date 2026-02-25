---
date: '2025-11-13 12:00:00'
slug: 'cooking-ic-dbms-canister-the-journey-begins'
title: 'Cooking ic-dbms-canister: The journey begins'
description: 'A tale of building a framework for building DBMS on Internet Computer - Chapter 1'
author: 'veeso'
featured_image: featured.jpeg
tag: rust
reading_time: '11'
---

## Premise

Even if the project is made to run on Internet Computer, which is related to web3 and cryptos, this article is not about investments, tokens or NFTs. It is not even about Internet Computer itself, but rather bringing with Rust on a no-std environment a framework to build DBMS (Database Management Systems).

## Why building a DBMS on Internet Computer?

IC allows people to build decentralized distributed applications, which are installed in containers called `canisters` and are wasm modules. Usually these are built with Rust.

At the moment one of the biggest limitations of IC and lack of adoption is the lack of proper database solutions.

At the moment if you want to store data on IC you have to use collections with maps and vectors, which are not optimized for large datasets and complex queries.

That's why I started this project: to build a framework that allows people to build DBMS on IC, with features like indexing, querying, transactions and more.

## About this blog post series

This is the first blog post of a series where I will document the journey of building this framework. I will share the challenges I face, the solutions I find and the progress I make.

Basically for three reasons:

1. This project is huge and extremely complex and I both need to organize my thoughts and have a place where I can document everything.
2. I want to create a diary of the development process, which can be useful for other developers who want to build similar projects.
3. I want to share my experience with the community. Also eventually I would like to bring this story to conferences and meetups, so having a blog post series can be a good starting point.

## What I want to achieve

My goal is to provide a framework which allows people, by just providing the database schema, to build, with the **power of proc macros** a canister which implements a DBMS with all the features needed to build complex applications.

### Concept

The concept I have in mind is to have this kind of flow:

1. The user defines the database schema using Rust structs and annotations.

   ```rust
   #[derive(Table)]
   struct User {
       #[primary_key]
       id: Integer,
       name: Text,
       email: Text,
       age: Integer,
   }

   #[derive(Table)]
   struct Post {
       #[primary_key]
       id: Integer,
       title: Text,
       content: Text,
       #[foreign_key(table = "User", column = "id")]
       author_id: Integer,
   }
   ```

2. This macro generates all the necessary code we'll see later to define the tables, columns and relationships and memory management.
3. The user sets up the database with a macro call.

   ```rust
   ic_dbms_canister! {
       tables: [User, Post],
   }
   ```

4. The macro generates all the canister code with the canister methods to perform CRUD operations, queries, transactions and more.
5. The user can then deploy the canister on IC with the init method which takes the account id which can access the database.

### Requirements

Of course since we are building a DBMS on IC we have tons of requirements to take into account:

1. The user must be able to store entities with common attributes inside tables which must be stored on the stable memory of the canister.
2. The user must be able to perform CRUD operations on the entities.
3. The user must be able to perform complex queries with filtering, sorting and pagination.
4. The user must be able to define relationships between tables with foreign keys.
5. The user must be able to perform transactions with commit and rollback.
6. The user must be able to create indexes on columns to optimize queries.
7. The user must be able to handle errors and exceptions gracefully.
8. The user must be able to create a database canister with simple macros. Basically it must be almost no-code.
9. The database must provide Access Control Lists (ACL) to restrict access to the database.
10. The database must be optimized for performance and memory usage.
11. The user must be able to make migrations to update the database schema without losing data on canister upgrade.

Of course not all of these requirements will be implemented from the start, but this is the goal. So my framework must be designed to be extensible and modular.

In particular in the first version what I want to achieve is:

1. Basic CRUD operations.
2. Basic querying with filtering.
3. Relationships with foreign keys.
4. Canister generation with macros.
5. Transactions with commit and rollback.
6. Access Control Lists (ACL).

## Memory management

One of the biggest issues when building a DBMS on IC is memory management.

Canisters just provide two ways to handle the stable memory:

1. Using the `ic-stable-structures` crate, which provides collections like `StableBTreeMap`, `StableVec` and more.
2. Using raw pointers and managing the memory manually.

The first approach is the easiest one, but it's not a viable option, since it would not allow to build an efficient DBMS, since the collections provided are not optimized for large datasets and complex queries.

The only option is to manage the memory manually, which is a complex task, but gives full control over how data is stored and accessed.

### IC-CDK Stable Memory API

The `ic-cdk` crate (the sdk for ic canisters) provides in the `ic_cdk::stable` module the functions to handle the stable memory.

In particular we have:

- `stable_grow`: increase the size of the stable memory by `n` pages. A page is 65536 bytes.
- `stable_read(offset, buf)`: read data from stable memory into a buffer at the given offset.
- `stable_write(offset, buf)`: write data from a buffer into stable memory at the given offset.
- `stable_size()`: get the current size of the stable memory in pages.

For reference: [ic-cdk stable api](https://docs.rs/ic-cdk/latest/ic_cdk/stable/index.html).

So we have to build on top of these functions a memory manager which allows us to allocate, deallocate and manage memory blocks.

But I want to have the memory manager which is generic and agnostic on what we want to write. At the same time though, we need to have a way to write and read records of different types.

So my idea is to have the following structure:

- `DataTypes`: Types that can be stored inside the database, like Integer, Text, Boolean and more.
- `Encode`: A trait which must be implemented by the `DataTypes` to provide the methods to encode and decode the data to and from bytes.
- `Table`: The entities which represent the tables in the database. These are defined by the user with structs and annotations. Tables must only contain `Encode` types.
- `MemoryDelegate`: A struct which is instantiated by every table (automatically with macros) which provides the methods to allocate, deallocate and manage memory blocks for the table records.
- `MemoryManager`: A struct which provides the methods to allocate, deallocate and manage memory blocks for all the tables in the database. It uses the `MemoryDelegate` struct to delegate the memory management to the tables.

### Memory Structure

We can't just rely on delegates though, we need to have a proper memory structure to store the data.

In particular we need to have:

- A **header** (4 pages) which contains the schema of the database, with the tables and their pages to their registry.
- A **reserved page for the ACL** (Access Control List) which contains the account ids which can access the database.
- A **registry** (2 pages) for each table which contains the pages where the records of the table are stored.
- The **records of the tables**, stored in pages.

So the idea is something like this

```txt
|+------------------+------------------+------------------------+------------------------+------+
| Header 65k * 4.   | Reserved ACL 65k. | Table1 Registry 128k. | Table2 Registry 128k. | ...   |
|+------------------+------------------+------------------------+------------------------+------+
| Table1 Records...                                                                             |
| Table2 Records...                                                                             |
| ...                                                                                           |
| Table1 Records (2)...                                                                         |
| ...                                                                                           |
| Table1 Records (3)...                                                                         |
|+-----------------------------------------------------------------------------------------------+
```

Also each table registry contains the list of pages where the records of the table are stored.

The biggest challenge will be to manage the memory efficiently, since we have to deal with fragmentation, allocation and deallocation of memory blocks.

### Dealing with deletions and Table registry

Also how do we deal with deletion of records? Do we **mark them as deleted** or **do we actually free the memory**? And how do we handle reallocation of memory?

An idea could be to have for each record a fixed alignment, so when we delete a record we can just mark it as deleted and when we allocate a new record we can reuse the deleted records.

But this could lead to very long time when inserting new records, since we have to scan the whole table to find deleted records.

For this reason we could save in the registry also the offset of the deleted records offsets, so when we want to insert a new record we can just check if there are deleted records and reuse them.

After these thoughts probably the best way to approach the table registry is to use the first page for the list of pages where the records are stored, and the second page for the list of **deleted records offsets**.
Also for compliance reasons **we zero out the deleted records** in stable memory.

So for the table registry we have something like this:

```txt
|+------------------------+-----------------------------------------+
| Pages List 65k          | Deleted Records Offsets 65k             |
|+------------------------+-----------------------------------------+
| Page 1: page num (u32). | Page num (u32);Offset (u16);Count (u16) |
| Page 2: page num (u32). | ...                                     |
| ...                     | ...                                     |
|+------------------------+-----------------------------------------+
```

So the pages list just contains the pages; 4 bytes each;
while the deleted records offsets contains for each deleted record the page number, the offset inside the page and the count of consecutive deleted records.

### Memory Delegate

Given that structure we can finally define our `MemoryDelegate` struct:

```rust
struct MemoryDelegate<Entity>
where Entity: Encode
{
    /// The table assigned to this delegate
    entity_marker: PhantomData<Entity>,
    /// The page number assigned to the table registry from the memory manager. It must be deterministic but unique
    registry_page: u32,
    /// First available record for writing
    first_available_record: Option<(u32, u16, u16)>,
}

impl<Entity> MemoryDelegate<Entity>
where Entity: Encode
{
    /// Initializes the memory delegate for the table.
    ///
    /// It gets the first available record from the registry and the registry page.
    pub fn init() -> MemoryResult<Self>;

    /// Inserts a record into the stable memory.
    ///
    /// The `write_fn` is used to write the record data.
    pub fn insert_record(&mut self, record: &Entity) -> MemoryResult<()>;

    /// Deletes a record from the stable memory.
    pub fn delete_record(&mut self, record: &Entity) -> MemoryResult<()>;

    /// Updates a record in the stable memory.
    pub fn update_record(&self, record: &Entity) -> MemoryResult<()>;

    /// Queries records from the stable memory.
    pub fn query_records(&self, filter: Filter) -> MemoryResult<Vec<Entity>>;

    /// Get pages list from the registry.
    fn get_pages_list(&self) -> MemoryResult<Vec<u32>>;

    /// Get first available record offset from deleted records.
    ///
    /// If returns [`None`], a new page must be allocated.
    fn get_first_available_record(&self) -> MemoryResult<Option<(u32, u16, u16)>>;
}
```

### Memory Manager

And at this point we can also define the methods for the `MemoryManager` struct which uses the delegates:

```rust
/// The magic number to identify the header
/// 1CDBMS is fixed; 01 is the version
const HEADER_MAGIC: u32 = 0x1CDBMS01;

struct MemoryManager;

impl MemoryManager {
    /// Initializes the memory manager and allocates the header and reserved pages.
    ///
    /// The header is initialized if contains the magic number `0x1CDBMS01`.
    /// If the memory is already initialized, it also loads the ACL from the reserved page.
    pub fn init() -> MemoryResult<Self>;

    /// Registers a table and allocates its registry page.
    pub fn register_table(&self, schema: &TableSchema) -> MemoryResult<u32>;

    /// Gets the registry page for a table.
    pub fn table_registry_page(&self, schema: &TableSchema) -> MemoryResult<u32>;

    /// Gets the ACL page number.
    pub fn acl_page() -> u32;

    /// Write data to memory
    pub fn write_data(&self, page: u32, offset: u16, data: &[u8]) -> MemoryResult<()>;

    /// Read data from memory
    pub fn read_data(&self, page: u32, offset: u16, buf: &mut [u8]) -> MemoryResult<()>;
}
```

When a table is generated with the proc macro, it will both automatically implement the `MemoryDelegate` and the `TableSchema` struct which contains the schema of the table, used to register the table in the memory manager.

### ACL Table

The ACL (Access Control List) is stored in a reserved page (page 4) and contains the list of principals which can access the database.

It provides methods to read and write the ACL from/to stable memory.

```rust
struct AclTable {
    /// Keep ACL in heap to speed up ACL.
    acl: Vec<Principal>,
}

impl AclTable {
    /// Initializes the ACL table by reading the ACL from stable memory.
    pub fn init() -> MemoryResult<Self>;

    /// Adds a principal to the ACL.
    pub fn add_principal(&mut self, principal: Principal) -> MemoryResult<()>;

    /// Removes a principal from the ACL.
    pub fn remove_principal(&mut self, principal: &Principal) -> MemoryResult<()>;

    /// Checks if a principal is in the ACL.
    pub fn contains_principal(&self, principal: &Principal) -> bool;

    /// Writes the ACL to stable memory.
    fn write_acl(&self) -> MemoryResult<()>;

    /// Reads the ACL from stable memory.
    fn read_acl(&mut self) -> MemoryResult<()>;
}
```

## Conclusion

I would say we're done for the first time which describes the general architecture and the memory management system for the DBMS canister.

Once I've finished with the memory management implementation, in the next blog post I will describe how to implement the query engine of the DBMS canister.

Note that this is more a draft of the architecture, so things may change during the implementation phase.

You can stay tuned by following the [GitHub repository](https://github.com/veeso/ic-dbms-canister) where I will push the code as soon as possible.

Chapter 2 is now available: [Cooking ic-dbms-canister: Memory Management](https://blog.veeso.dev/cooking-ic-dbms-canister-memory-management/).
