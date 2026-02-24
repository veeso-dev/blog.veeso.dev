---
date: '2025-12-05 23:00:00'
slug: 'cooking-ic-dbms-canister-dbms-layer'
title: 'Cooking ic-dbms-canister: DBMS Layer'
subtitle: 'A tale of building a framework for building DBMS on Internet Computer - Chapter 3'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: rust
---

## Introduction

This article is part of a series where I document the development of `ic-dbms-canister`, a framework for building database management systems (DBMS) on the Internet Computer (IC). In the [previous article](https://blog.veeso.dev/blog/en/cooking-ic-dbms-canister-the-journey-begins/), I introduced the project and its goals. In this article, I will focus on the dbms layer.

## DBMS Layer

The DBMS (Database Management System) layer is responsible for managing the storage, retrieval, and manipulation of data.

It provides also the necessary types such as the data types for columns.

## Data Types

The following data types are supported in the DBMS layer:

- `Blob`
- `Boolean`
- `Date`
- `DateTime`
- `Decimal`
- `Int32`
- `Int64`
- `Nullable<DataType>`
- `Principal`
- `Text`
- `Uint32`
- `Uint64`
- `Uuid`

Each data type must implement the `DataType` trait, which defines the necessary traits each type must have to be used in the DBMS layer.

```rust
/// A trait representing a data type that can be stored in the DBMS.
///
/// This is an umbrella trait that combines several other traits to ensure that
/// any type implementing [`DataType`] can be cloned, compared, hashed, encoded,
/// and serialized/deserialized using both Candid and Serde.
///
/// Also it is used by the DBMS to compare and sort values of different data types.
pub trait DataType:
    Clone
    + std::fmt::Debug
    + PartialEq
    + Eq
    + PartialOrd
    + Ord
    + std::hash::Hash
    + Encode
    + CandidType
    + Serialize
    + for<'de> Deserialize<'de>
{
}
```

## How will our DBMS work?

Given that we want to eventually have tables defined like this:

```rust
#[derive(Table)]
struct Post {
    #[primary_key]
    id: Int64,
    title: Text,
    content: Text,
    #[foreign_key(table = "User", column = "id")]
    author_id: Int64,
}
```

The idea is to have a DBMS capable of consuming a structured `Query` type and resolving it through a multi-layered architecture.

The DBMS is not responsible for the physical storage details - these are delegated to the MemoryManager and the table-level registries - but it handles:

- interpreting the query
- resolving schemas and metadata
- evaluating filters
- reconstructing logical records
- optionally resolving relations (foreign keys)
- returning results to the application layer

To achieve this, I introduced several abstractions that separate schema, record values, query planning, and execution.

### Values

We first have to define a generic value wrapper around our data types:

```rust
/// A generic wrapper enum to hold any DBMS value.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Value {
    Blob(types::Blob),
    Boolean(types::Boolean),
    Date(types::Date),
    DateTime(types::DateTime),
    Decimal(types::Decimal),
    Int32(types::Int32),
    Int64(types::Int64),
    Null,
    Principal(types::Principal),
    Text(types::Text),
    Uint32(types::Uint32),
    Uint64(types::Uint64),
    Uuid(types::Uuid),
}
```

### Query Abstraction

Queries will be represented through a `Query` and `QueryBuilder` type, allowing the DBMS to express:

- the table to operate on
- the filters to apply
- any relational expansions (e.g., eager loading)
- the expected return type

A minimal `Query` shape looks like this:

```rust
pub struct Query<T: TableSchema> {
    filters: Vec<Filter>,
    eager_relations: Vec<&'static str>,
    _marker: PhantomData<T>,
}
```

and relations are exposed through columns with:

```rust
/// Defines a foreign key relationship for a column.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ForeignKeyDef {
    /// Name of the local column that holds the foreign key (es: "user_id")
    pub local_column: &'static str,
    /// Name of the foreign table (e.g., "users")
    pub foreign_table: &'static str,
    /// Name of the foreign column that the FK points to (e.g., "id")
    pub foreign_column: &'static str,
}
```

### Table Schemas and Records

Each table will have a corresponding `TableSchema` type that describes its structure, columns, and relationships.

```rust
pub trait TableSchema {

    /// The [`TableRecord`] type associated with this table schema;
    /// which is the data returned by a query.
    type Record: TableRecord<Schema = Self>;
    /// The [`InsertRecord`] type associated with this table schema.
    type Insert: InsertRecord<Schema = Self>;
    /// The [`UpdateRecord`] type associated with this table schema.
    type Update: UpdateRecord<Schema = Self>;

    /// Returns the name of the table.
    fn table_name() -> &'static str;

    /// Returns the column definitions of the table.
    fn columns() -> &'static [ColumnDef];

    /// Returns the name of the primary key column.
    fn primary_key() -> &'static str;

    /// Returns the foreign key definitions of the table.
    fn foreign_keys() -> &'static [ForeignKeyDef];

    /// Returns the fingerprint of the table schema.
    fn fingerprint() -> TableFingerprint {
        let mut hasher = std::hash::DefaultHasher::new();
        std::any::TypeId::of::<Self>().hash(&mut hasher);
        hasher.finish()
    }

}
```

while we have different traits for records depending on the operation:

- `TableRecord` for records returned by queries
- `InsertRecord` for records to be inserted
- `UpdateRecord` for records to be updated

```rust
/// This trait represents a record returned by a [`crate::dbms::query::Query`] for a table.
pub trait TableRecord {
    /// The table schema associated with this record.
    type Schema: TableSchema<Record = Self>;

    /// Constructs [`TableRecord`] from a list of column values.
    fn from_values(values: &[(ColumnDef, Value)]) -> Self;

    /// Converts the record into a list of column [`Value`]s.
    fn to_values(&self) -> Vec<Value>;
}

/// This trait represents a record for inserting into a table.
pub trait InsertRecord {
    /// The [`TableRecord`] type associated with this table schema.
    type Record: TableRecord;
    /// The table schema associated with this record.
    type Schema: TableSchema<Record = Self::Record>;

    /// Converts the record into a list of column [`Value`]s for insertion.
    fn into_values(self) -> Vec<Value>;
}

/// This trait represents a record for updating a table.
pub trait UpdateRecord {
    /// The [`TableRecord`] type associated with this table schema.
    type Record: TableRecord;
    /// The table schema associated with this record.
    type Schema: TableSchema<Record = Self::Record>;

    /// Get the list of column [`Value`]s to be updated.
    fn update_values(&self) -> Vec<(ColumnDef, Value)>;

    /// Get the [`Filter`] condition for the update operation.
    fn where_clause(&self) -> Option<Filter>;
}
```

## Transaction Management

We also have to handle transactions to ensure data integrity during multiple operations.

So we need to have a `TransactionSession` which must handle all the transactions for the different users.

We will have a mapping between the `TransactionId` and the `Transaction` instance and another between the `TransactionId` and the `Principal` that owns it.

```rust
thread_local! {
    pub static TRANSACTION_SESSION: RefCell<TransactionSession> = RefCell::new(TransactionSession::default());
}

/// The [`Transaction`] session storage
#[derive(Default, Debug)]
pub struct TransactionSession {
    /// Map between transaction IDs and Transactions
    transactions: HashMap<TransactionId, Transaction>,
    /// Map between transaction IDs and their owner ([`Principal`]).
    owners: HashMap<TransactionId, Principal>,
    /// Next transaction ID
    next_transaction_id: TransactionId,
}

impl TransactionSession {
    /// Begins a new transaction for the given owner ([`Principal`]) and returns its [`TransactionId`].
    pub fn begin_transaction(&mut self, owner: Principal) -> TransactionId;

    /// Checks if a transaction with the given [`TransactionId`] exists and is owned by the given [`Principal`].
    pub fn has_transaction(&self, transaction_id: &TransactionId, caller: Principal) -> bool;

    /// Retrieves a mutable reference to the [`Transaction`] associated with the given [`TransactionId`].
    pub fn get_transaction_mut(
        &mut self,
        transaction_id: &TransactionId,
    ) -> Option<&mut Transaction>;

    /// Closes the transaction associated with the given [`TransactionId`].
    pub fn close_transaction(&mut self, transaction_id: &TransactionId);
}
```

And finally we define the `Transaction` struct itself:

```rust
/// A transaction represents a sequence of operations performed as a single logical unit of work.
#[derive(Debug, Default, Clone)]
pub struct Transaction {
    pub operations: Vec<Operation>,
}

/// An operation within a [`Transaction`].
#[derive(Debug, Clone)]
pub enum Operation {
    /// An insert operation. The first element is the table name, and the second is the record to be inserted.
    Insert(&'static str, UntypedInsertRecord),
    /// An update operation. The first element is the table name, and the second is the record to be updated.
    Update(&'static str, UntypedUpdateRecord),
    /// A delete operation. The first element is the table name, and the second is an optional filter to specify which records to delete.
    Delete(&'static str, Option<Filter>),
}
```

Since we cannot store generic types in the `Operation` enum, we use `UntypedInsertRecord` and `UntypedUpdateRecord` as type-erased wrappers around the actual records; then we add to our `InsertRecord` and `UpdateRecord` traits methods to convert to/from these untyped versions.

```rust
/// Untyped insert record for dynamic operations.
#[derive(Debug, Clone)]
pub struct UntypedInsertRecord {
    pub fields: Vec<(String, Value)>,
}

/// Untyped update record for dynamic operations.
#[derive(Debug, Clone)]
pub struct UntypedUpdateRecord {
    pub update_fields: Vec<(String, Value)>,
    pub where_clause: Option<Filter>,
}

pub trait UpdateRecord: Sized {
    // ...

    /// Constructs the [`UpdateRecord`] from an untyped [`UntypedUpdateRecord`] representation.
    fn from_untyped(untyped: UntypedUpdateRecord) -> QueryResult<Self>;

    /// Converts the record into an untyped [`UntypedUpdateRecord`] representation.
    fn into_untyped(self) -> UntypedUpdateRecord {
        UntypedUpdateRecord {
            update_fields: self
                .update_values()
                .into_iter()
                .map(|(col_def, value)| (col_def.name.to_string(), value))
                .collect(),
            where_clause: self.where_clause(),
        }
    }
}
```

## Query Execution

### The Query type

The query type encapsulates all the information needed to perform a database operation.

```rust
/// A struct representing a query in the DBMS.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Query<T>
where
    T: TableSchema,
{
    /// Fields to select in the query.
    columns: Select,
    /// Relations to eagerly load with the main records.
    pub(crate) eager_relations: Vec<&'static str>,
    /// [`Filter`] to apply to the query.
    pub(crate) filter: Option<Filter>,
    /// Order by clauses for sorting the results.
    pub(crate) order_by: Vec<(&'static str, OrderDirection)>,
    /// Limit on the number of records to return.
    pub(crate) limit: Option<usize>,
    /// Offset for pagination.
    pub(crate) offset: Option<usize>,
    /// Marker for the table schema type.
    _marker: PhantomData<T>,
}

/// An enum representing the fields to select in a query.
#[derive(Debug, Default, Clone, PartialEq, Eq)]
pub enum Select {
    #[default]
    All,
    Columns(Vec<&'static str>),
}
```

and the `Filter` is used to build where clauses:

```rust
/// [`super::Query`] filters.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Filter {
    Eq(&'static str, Value),
    Ne(&'static str, Value),
    Gt(&'static str, Value),
    Lt(&'static str, Value),
    Ge(&'static str, Value),
    Le(&'static str, Value),
    Like(&'static str, Value),
    NotNull(&'static str),
    IsNull(&'static str),
    And(Box<Filter>, Box<Filter>),
    Or(Box<Filter>, Box<Filter>),
    Not(Box<Filter>),
}
```

### Execution steps

1. Lookup the schema

   The DBMS accesses the `SchemaRegistry` to find the metadata associated with the table:
   - table fingerprint
   - page ledger page
   - free segments page

2. Load the table registry

   Using the registry information, the DBMS loads the `PageLedger` and `FreeSegmentsLedger`.

   This layer knows how to:
   - list all the pages belonging to the table
   - find the physical location of each record and provide a reader interface for them
   - decode raw bytes into `Value` instances

3. Scan raw records

   The `QueryExecutor` iterates over all records in the table.

4. Apply filters

   Filters are applied logically, not physically removing records from storage.

5. Construct logical records

   For each record that passes the filters, the DBMS reconstructs a `TableRecord` instance.

6. Resolve relations

   If the query requests eager loading of relations, the DBMS will recursively fetch related records based on foreign keys.

7. Return results

   Finally, the DBMS returns the results to the application layer in the expected format.

### The Database

Now I've finally implemented the last step of this journey: the `Database` interface:

```rust
/// The main DBMS struct.
///
/// This struct serves as the entry point for interacting with the DBMS engine.
///
/// It provides methods for executing queries.
///
/// - [`Database::select`] - Execute a SELECT query.
/// - [`Database::insert`] - Execute an INSERT query.
/// - [`Database::update`] - Execute an UPDATE query.
/// - [`Database::delete`] - Execute a DELETE query.
/// - [`Database::commit`] - Commit the current transaction.
/// - [`Database::rollback`] - Rollback the current transaction.
///
/// The `transaction` field indicates whether the instance is operating within a transaction context.
/// The [`Database`] can be instantiated for one-shot, with [`Database::oneshot`] operations (no transaction),
/// or within a transaction context with [`Database::from_transaction`].
///
/// If a transaction is active, all operations will be part of that transaction until it is committed or rolled back.
pub struct Database {
    /// Id of the loaded transaction, if any.
    transaction: Option<TransactionId>,
}

impl Database {
    /// Executes a SELECT query and returns the results.
    ///
    /// # Arguments
    ///
    /// - `query` - The SELECT [`Query`] to be executed.
    ///
    /// # Returns
    ///
    /// The returned results are a vector of [`table::TableRecord`] matching the query.
    pub fn select<T>(&self, query: Query<T>) -> IcDbmsResult<Vec<T::Record>>
    where
        T: TableSchema;

    /// Executes an INSERT query.
    ///
    /// # Arguments
    ///
    /// - `record` - The INSERT record to be executed.
    ///
    /// # Returns
    ///
    /// The number of rows inserted.
    pub fn insert<T>(&self, record: T::Insert) -> IcDbmsResult<u64>
    where
        T: TableSchema,
        T::Insert: InsertRecord<Schema = T>;

    /// Executes an UPDATE query.
    ///
    /// # Arguments
    ///
    /// - `record` - The UPDATE record to be executed.
    ///
    /// # Returns
    ///
    /// The number of rows updated.
    pub fn update<T>(&self, record: T::Update) -> IcDbmsResult<u64>
    where
        T: TableSchema,
        T::Update: table::UpdateRecord<Schema = T>;

    /// Executes a DELETE query.
    ///
    /// # Arguments
    ///
    /// - `filter` - An optional [`prelude::Filter`] to specify which records to delete.
    ///
    /// # Returns
    ///
    /// The number of rows deleted.
    pub fn delete<T>(&self, filter: Option<Filter>) -> IcDbmsResult<u64>
    where
        T: TableSchema;

    /// Commits the current transaction.
    pub fn commit(&self) -> IcDbmsResult<()>;

    /// Rolls back the current transaction.
    pub fn rollback(&self) -> IcDbmsResult<()>;
}
```

### Loading eager relations

Dealing with eager relations is just a nightmare, I'm not kidding. It's extremely complicated.

In general it would be extremely simple if we just could do this:

```rust
pub trait TableSchema {
    fn foreign_schema(table: &str) -> IcDbmsResult<T>;
}
```

and use that `T` to build a query to fetch the foreign record:

```rust
Database::select::<T>(Query::<T>::builder()
    .all()
    .and_where(Filter::Eq(foreign_column, fk_value))
    .limit(1)
    .build(),
)?;
```

But unfortunately you can't.

So I've come up with a very good workaround actually, which is the `ForeignFetcher` trait:

```rust
/// This trait defines the behavior of a foreign fetcher, which is responsible for
/// fetching data from foreign sources or databases.
///
/// It takes a table name and returns the values associated with that table.
pub trait ForeignFetcher: Default {
    /// Fetches the data for the specified table and primary key values.
    ///
    /// # Arguments
    ///
    /// * `database` - The database from which to fetch the data.
    /// * `table` - The name of the table to fetch data from.
    /// * `pk_values` - The primary key to look for.
    ///
    /// # Returns
    ///
    /// A result containing the fetched table columns or an error.
    fn fetch(
        &self,
        database: &Database,
        table: &str,
        pk_value: Value,
    ) -> IcDbmsResult<TableColumns>;
}
```

For tables which don't have FKs, we can just implement a no-op fetcher:

```rust
/// A no-op foreign fetcher that does not perform any fetching.
#[derive(Default)]
pub struct NoForeignFetcher;

impl ForeignFetcher for NoForeignFetcher {
    fn fetch(
        &self,
        _database: &Database,
        _table: &str,
        _pk_value: Value,
    ) -> IcDbmsResult<TableColumns> {
        unimplemented!("NoForeignFetcher should have a table without foreign keys");
    }
}
```

At this point we add the constructor and the type to `TableSchema`:

```rust
    /// The [`ForeignFetcher`] type associated with this table schema.
    type ForeignFetcher: ForeignFetcher;

    /// Returns an instance of the [`ForeignFetcher`] for this table schema.
    fn foreign_fetcher() -> Self::ForeignFetcher {
        Default::default()
    }
```

And finally, when we filter the record inside of `Database`, we use it to collect the foreign keys:

```rust
// handle eager relations
// FIXME: currently we fetch the FK for each record, which is shit.
// In the future, we should batch fetch foreign keys for all records in the result set.
for relation in &query.eager_relations {
    // get fk value
    let fk_value = record_values
        .iter()
        .find(|(col_def, _)| {
            col_def
                .foreign_key
                .is_some_and(|fk| fk.foreign_table == *relation)
        })
        .map(|(_, value)| value.clone())
        .ok_or(IcDbmsError::Query(QueryError::InvalidQuery(format!(
            "Primary key not found for table {}",
            T::table_name()
        ))))?;

    queried_fields.extend(T::foreign_fetcher().fetch(self, relation, fk_value)?);
}
```

This function returns a list of values keyed by the table name, so our `Record::from_values` can use the table name to construct the record accordingly.

### Handling Transaction values

Another big problem is handling values which are inside of a transaction. When we work inside of a transaction we don't write the changes inside of the database, but we keep in an overlay inside of the `Transaction` struct instead.

This has been implemented through a `DatabaseOverlay` struct:

```rust
/// The database overlay is used to manage uncommitted changes during a transaction.
///
/// Basically it provides an overlay over the existing database state to track uncommitted changes.
#[derive(Debug, Default, Clone)]
pub struct DatabaseOverlay {
    tables: HashMap<TableName, TableOverlay>,
}

impl DatabaseOverlay {
    /// Get a [`DatabaseOverlayReader`] for the specified table.
    pub fn reader<'a, T>(
        &'a mut self,
        table_reader: TableReader<'a, T>,
    ) -> DatabaseOverlayReader<'a, T>
    where
        T: TableSchema,
    {
        let table_name = T::table_name();
        let table_overlay = self.tables.entry(table_name).or_default();
        DatabaseOverlayReader::new(table_overlay, table_reader)
    }

    /// Insert a record into the overlay for the specified table.
    pub fn insert<T>(&mut self, values: Vec<(ColumnDef, Value)>) -> IcDbmsResult<()>
    where
        T: TableSchema,
    {
        let table_name = T::table_name();
        let pk = T::primary_key();
        let pk = Self::primary_key(pk, &values)?;
        let overlay = self.tables.entry(table_name).or_default();
        overlay.insert(pk, values);

        Ok(())
    }

    /// Update a record in the overlay for the specified table.
    pub fn update<T>(&mut self, pk: Value, updates: Vec<(String, Value)>)
    where
        T: TableSchema,
    {
        let table_name = T::table_name();
        let overlay = self.tables.entry(table_name).or_default();
        overlay.update(pk, updates);
    }

    /// Delete a record in the overlay for the specified table.
    pub fn delete<T>(&mut self, pk: Value)
    where
        T: TableSchema,
    {
        let table_name = T::table_name();
        let overlay = self.tables.entry(table_name).or_default();
        overlay.delete(pk);
    }
}
```

So for each table we have a `TableOverlay` which keeps track of the inserted, updated and deleted records inside of the transaction.

When we read records from the database, we use a `DatabaseOverlayReader` which merges the underlying table reader with the overlay changes:

```rust
/// The table overlay tracks uncommitted changes for a specific table.
#[derive(Debug, Default, Clone)]
pub struct TableOverlay {
    /// The stack of operations applied to the table.
    pub(super) operations: Vec<Operation>,
}
```

And we have a `patch` method to apply the overlay changes to a record:

```rust
    /// Patches a row with the overlay changes.
    ///
    /// The return may be [`None`] if the row has been deleted in the overlay.
    ///
    /// NOTE: `clippy::manual_try_fold`
    /// this lint is TOTALLY WRONG HERE. We may have a row which first becomes None (deleted), then an insert again returns Some.
    #[allow(clippy::manual_try_fold)]
    pub fn patch_row(&self, row: Vec<(ColumnDef, Value)>) -> Option<Vec<(ColumnDef, Value)>> {
        // get primary key value
        let pk = row
            .iter()
            .find(|(col_def, _)| col_def.primary_key)
            .map(|(_, value)| value)
            .cloned()?;

        // apply all operations for this primary key to the row
        self.operations
            .iter()
            .filter(|op| op.primary_key_value() == &pk)
            .fold(Some(row), |acc, op| self.apply_operation(acc, op))
    }

    /// Applies a single [`Operation`] to a row.
    fn apply_operation(
        &self,
        row: Option<Vec<(ColumnDef, Value)>>,
        op: &Operation,
    ) -> Option<Vec<(ColumnDef, Value)>> {
        match (row, op) {
            (_, Operation::Insert(_, record)) => Some(record.clone()), // it's definetely weird if we have `Some` row here, but just return the inserted record
            (_, Operation::Delete(_)) => None, // row is deleted; it would be weird to have `None` row here; just return None
            (None, Operation::Update(_, _)) => None, // trying to update a non-existing row; just return None
            (Some(mut existing_row), Operation::Update(_, updates)) => {
                for (col_name, new_value) in updates {
                    if let Some((_, value)) = existing_row
                        .iter_mut()
                        .find(|(col_def, _)| col_def.name == col_name)
                    {
                        *value = new_value.clone();
                    }
                }
                Some(existing_row)
            }
        }
    }
```

Also we need to iterate over inserted records in the overlay, so we have a method for that too:

```rust
    /// Returns an iterator over the inserted records which are still valid after the operation stack.
    pub fn iter_inserted(&self) -> impl Iterator<Item = Vec<(ColumnDef, Value)>> {
        self.operations.iter().filter_map(|op| {
            if let Operation::Insert(_, record) = op {
                self.patch_row(record.clone())
            } else {
                None
            }
        })
    }
```

Eventually instead of using `TableReader` directly we use `DatabaseOverlayReader` which merges the overlay changes with the underlying table reader:

```rust
/// A reader for the database with overlay applied.
pub struct DatabaseOverlayReader<'a, T>
where
    T: TableSchema,
{
    /// Track the position in the new rows.
    new_rows_cursor: usize,
    /// Reference to the table overlay.
    table_overlay: &'a TableOverlay,
    /// The underlying table reader.
    table_reader: TableReader<'a, T>,
    _marker: std::marker::PhantomData<T>,
}

impl<'a, T> DatabaseOverlayReader<'a, T>
where
    T: TableSchema,
{
    /// Creates a new [`DatabaseOverlayReader`].
    ///
    /// # Arguments
    ///
    /// * `table_overlay`: Reference to the table overlay.
    /// * `table_reader`: The underlying table reader.
    pub fn new(table_overlay: &'a TableOverlay, table_reader: TableReader<'a, T>) -> Self {
        Self {
            new_rows_cursor: 0,
            table_overlay,
            table_reader,
            _marker: std::marker::PhantomData,
        }
    }

    /// Attempts to get the next row, applying overlay changes.
    pub fn try_next(&mut self) -> IcDbmsResult<Option<Vec<(ColumnDef, Value)>>> {
        loop {
            // get next from table reader
            let next_base_row = self
                .table_reader
                .try_next()?
                .map(|row| row.record.to_values());

            // if is none, get next from inserted records
            let Some(next_row) = next_base_row.or_else(|| self.next_overlay_row()) else {
                // so there are no more rows in both base and overlay
                return Ok(None);
            };

            // patch row;
            // NOTE: here if it gets None, it means it was deleted not that we finished reading, so we need to continue!
            if let Some(patched) = self.table_overlay.patch_row(next_row) {
                return Ok(Some(patched));
            }
            // keep reading
        }
    }

    /// Get the next row from the overlay's inserted records.
    fn next_overlay_row(&mut self) -> Option<Vec<(ColumnDef, Value)>> {
        let row_to_get = self.new_rows_cursor;
        self.new_rows_cursor += 1;
        self.table_overlay.iter_inserted().nth(row_to_get)
    }
}
```

So inside of our `Database::select` we MUST use the overlay reader instead:

```rust
// load table registry
let table_registry = self.load_table_registry::<T>()?;
// read table
let table_reader = table_registry.read();
// get database overlay
let mut table_overlay = if self.transaction.is_some() {
    self.transaction()?.overlay
} else {
    DatabaseOverlay::default()
};
// overlay table reader
let mut table_reader = table_overlay.reader(table_reader);

// ...

while let Some(values) = table_reader.try_next()? {
    // ...
}

```

## Dealing with Integrity Validation

To ensure data integrity during insert, update and delete operations, we implement an `IntegrityValidator` trait.

The trait is required because as we'll see, when we are inside a transaction we no more have the type `T` to call the validator for.

```rust
/// Trait for integrity validators.
///
/// The integrity validator is responsible for validating the integrity of
/// database operations such as insert, update, and delete based on the table schema.
///
/// It must be globally implemented by the DBMS to ensure consistent integrity checks
/// across all tables and operations.
///
/// It is provided to the [`Database`] to allow it to perform integrity validation before running transactions.
pub trait IntegrityValidator {
    fn validate_insert(
        &self,
        dbms: &Database,
        table_name: &'static str,
        record_values: &[(ColumnDef, Value)],
    ) -> IcDbmsResult<()>;
}

/// Integrity validator for insert operations.
pub struct InsertIntegrityValidator<'a, T>
where
    T: TableSchema,
{
    database: &'a Database,
    _marker: std::marker::PhantomData<T>,
}

impl<'a, T> InsertIntegrityValidator<'a, T>
where
    T: TableSchema,
{
    /// Creates a new insert integrity validator.
    pub fn new(dbms: &'a Database) -> Self {
        Self {
            database: dbms,
            _marker: std::marker::PhantomData,
        }
    }
}

impl<T> InsertIntegrityValidator<'_, T>
where
    T: TableSchema,
{
    /// Verify whether the given insert record is valid.
    ///
    /// An insert is valid when:
    /// - No primary key conflicts with existing records.
    /// - All foreign keys reference existing records.
    /// - All non-nullable columns are provided.
    pub fn validate(&self, record_values: &[(ColumnDef, Value)]) -> IcDbmsResult<()> {
        self.check_primary_key_conflict(record_values)?;
        self.check_foreign_keys(record_values)?;
        self.check_non_nullable_fields(record_values)?;

        Ok(())
    }
}
```

## Dealing with transactions

Remember we made the `DatabaseOverlay` first? Now we need also to store the operation stack inside a transaction:

```rust
/// A transaction represents a sequence of operations performed as a single logical unit of work.
#[derive(Debug, Default)]
pub struct Transaction {
    /// Stack of operations performed in this transaction.
    ops: Vec<TransactionOp>,
    /// Overlay to track uncommitted changes.
    overlay: DatabaseOverlay,
}

/// An enum representing the different types of operations that can be performed within a transaction.
#[derive(Debug)]
pub enum TransactionOp {
    Insert {
        table: &'static str,
        values: Vec<(ColumnDef, Value)>,
    },
}
```

At this point whenever we do an operation and we are inside of a transaction, we first validate whether it's currently valid and then we push it to the transaction ops stack and also apply it to the overlay:

```rust
/// Executes an INSERT query.
    ///
    /// # Arguments
    ///
    /// - `record` - The INSERT record to be executed.
    pub fn insert<T>(&self, record: T::Insert) -> IcDbmsResult<()>
    where
        T: TableSchema,
        T::Insert: InsertRecord<Schema = T>,
    {
        // check whether the insert is valid
        let record_values = record.clone().into_values();
        self.schema
            .validate_insert(self, T::table_name(), &record_values)?;

        if self.transaction.is_some() {
            // insert a new `insert` into the transaction
            self.with_transaction_mut(|tx| tx.insert::<T>(record_values))?;
        } else {
            // insert directly into the database
            let mut table_registry = self.load_table_registry::<T>()?;
            table_registry.insert(record.into_record())?;
        }

        Ok(())
    }
```

This system though, still has a big limitation: we cannot insert when we commit, because again, we don't have the type `T` to call the validator for. You may think we could use a trait object `dyn TableSchema` inside of the `Operation`, but it would not work, because TableSchema has some associated types, and it's not doable with trait objects.

So we update our `IntegrityValidator` to become a trait which can both validate the operation and operate on the database:

```rust
/// This trait provides the schema operation for the current database.
///
/// It must provide the functionalities to validate the operations and perform them using the [`Database`] instance.
///
/// This is required because all of the [`Database`] operations rely on `T`, a [`crate::prelude::TableSchema`], but we can't store them inside
/// of transactions without knowing the concrete type at compile time.
pub trait DatabaseSchema {
    /// Performs an insert operation for the given table name and record values.
    ///
    /// Use [`Database::insert`] internally to perform the operation.
    fn insert(
        &self,
        dbms: &Database,
        table_name: &'static str,
        record_values: &[(ColumnDef, Value)],
    ) -> IcDbmsResult<()>;

    /// Validates an insert operation for the given table name and record values.
    ///
    /// Use a [`crate::prelude::InsertIntegrityValidator`] to perform the validation.
    fn validate_insert(
        &self,
        dbms: &Database,
        table_name: &'static str,
        record_values: &[(ColumnDef, Value)],
    ) -> IcDbmsResult<()>;
}
```

At this point when we commit:

```rust
    /// Commits the current transaction.
    ///
    /// The transaction is consumed.
    ///
    /// Any error during commit will trap the canister to ensure consistency.
    pub fn commit(&mut self) -> IcDbmsResult<()> {
        // take transaction out of self and get the transaction out of the storage
        // this also invalidates the overlay, so we won't have conflicts during validation
        let Some(txid) = self.transaction.take() else {
            return Err(IcDbmsError::Transaction(
                TransactionError::NoActiveTransaction,
            ));
        };
        let transaction = TRANSACTION_SESSION.with_borrow_mut(|ts| ts.take_transaction(&txid))?;

        // iterate over operations and apply them;
        // for each operation, first validate, then apply
        // using `self.atomic` when applying to ensure consistency
        for op in transaction.operations() {
            match op {
                TransactionOp::Insert { table, values } => {
                    // validate
                    self.schema.validate_insert(self, table, values)?;
                    // insert
                    self.atomic(|db| db.schema.insert(db, table, values));
                }
            }
        }

        Ok(())
    }
}
```

And this is then done the same way for update and delete operations as well.

The `DatabaseSchema` is then implemented by the macro we'll see in the next chapter, with all the tables defined in the user schema.

Eventually I've implemented the final API as follows:

```rust
    /// Executes a DELETE query.
    ///
    /// # Arguments
    ///
    /// - `behaviour` - The [`DeleteBehavior`] to apply for foreign key constraints.
    /// - `filter` - An optional [`Filter`] to specify which records to delete.
    ///
    /// # Returns
    ///
    /// The number of rows deleted.
    pub fn delete<T>(&self, behaviour: DeleteBehavior, filter: Option<Filter>) -> IcDbmsResult<u64>
    where
        T: TableSchema;

    /// Executes an UPDATE query.
    ///
    /// # Arguments
    ///
    /// - `patch` - The UPDATE patch to be applied.
    /// - `filter` - An optional [`Filter`] to specify which records to update.
    ///
    /// # Returns
    ///
    /// The number of rows updated.
    pub fn update<T>(&self, patch: T::Update) -> IcDbmsResult<u64>
    where
        T: TableSchema,
        T::Update: table::UpdateRecord<Schema = T>;
```

## Conclusion

And this is it! We've built a complete DBMS engine in Rust, with support for:

- Table schemas and records
- Query execution with filtering, ordering, and pagination
- Transaction management with commit and rollback
- Integrity validation for inserts, updates, and deletes

And yes, it's extremely complicated, but also extremely powerful.

You can't even imagine how I was excited when I finally see a transaction being committed successfully with all the integrity checks passing.

In the next - and final - chapter of this series, I'll show you how to define your own database schema using macros, and how I implemented the macro system to generate all the boilerplate code for you.
