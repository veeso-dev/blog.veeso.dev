---
date: '2025-12-13 18:07:00'
slug: 'announcing-ic-dbms-0-1-0'
title: 'Announcing ic-dbms 0.1.0'
subtitle: 'A Rust framework to easily implement a database canister on the Internet Computer'
author: 'veeso'
featuredImage: ./featured.jpeg
tag: rust
---

What if I told you that this code:

```rust
use candid::CandidType;
use ic_dbms_api::prelude::{Text, Uint32};
use ic_dbms_canister::prelude::{DbmsCanister, Table};
use serde::Deserialize;

#[derive(Debug, Table, CandidType, Deserialize, Clone, PartialEq, Eq)]
#[table = "users"]
pub struct User {
    #[primary_key]
    id: Uint64,
    name: Text,
    email: Text,
    age: Nullable<Uint32>,
}

#[derive(Debug, Table, CandidType, Deserialize, Clone, PartialEq, Eq)]
#[table = "posts"]
pub struct Post {
    #[primary_key]
    id: Uint32,
    title: Text,
    content: Text,
    #[foreign_key(entity = "User", table = "users", column = "id")]
    author: Uint32,
}

#[derive(DbmsCanister)]
#[tables(User = "users", Post = "posts")]
pub struct IcDbmsCanisterGenerator;
```

is all you need to generate a **fully functional, transaction-safe, type-safe relational database canister on the Internet Computer** — complete with primary keys, foreign keys, CRUD operations, queries, and ACLs?

Just this code gives you a fully functional API with this interface:

```candid
service : (IcDbmsCanisterArgs) -> {
  acl_add_principal : (principal) -> (Result);
  acl_allowed_principals : () -> (vec principal) query;
  acl_remove_principal : (principal) -> (Result);
  begin_transaction : () -> (nat);
  commit : (nat) -> (Result);
  delete_posts : (DeleteBehavior, opt Filter_1, opt nat) -> (Result_1);
  delete_users : (DeleteBehavior, opt Filter_1, opt nat) -> (Result_1);
  insert_posts : (PostInsertRequest, opt nat) -> (Result);
  insert_users : (UserInsertRequest, opt nat) -> (Result);
  rollback : (nat) -> (Result);
  select_posts : (Query, opt nat) -> (Result_2) query;
  select_users : (Query_1, opt nat) -> (Result_3) query;
  update_posts : (PostUpdateRequest, opt nat) -> (Result_1);
  update_users : (UserUpdateRequest, opt nat) -> (Result_1);
}
```

## What is ic-dbms?

ic-dbms is a framework for the Internet Computer that lets you build a fully functional database canister simply by defining your schema.
From a set of Rust structs annotated with `#[derive(Table)]`, the framework generates a complete storage layer and a strongly typed API.

With it, you can define tables, primary keys, and foreign keys — and ic-dbms automatically produces a canister exposing CRUD operations and query capabilities for each table.

It currently provides the following features:

- Table definitions with primary and foreign keys
- Automatically generated CRUD operations
- Complex queries with filtering and pagination
- Relationship handling via foreign keys
- Transactions (begin, commit, rollback)
- Access Control Lists (ACL) to restrict database access

Coming next:

- JOIN operations between tables
- Indexes for faster queries
- Custom data types
- Migrations to update the database schema on canister upgrades
- SQL query support
- Validation and constraints for table columns

## A Game Changer for IC Development

For years, the lack of a proper database layer has been one of the biggest barriers to building complex applications on the Internet Computer.

Everyone needs structured data, yet developers have been forced to juggle stable structures, manual indexing, double maps, and ad-hoc storage patterns just to model something as simple as a table.

**ic-dbms changes that.**

It lifts one of the heaviest constraints of IC development by providing a real, high-level database framework: tables, relationships, queries, transactions, and access control — all automatically generated from your schema.
No more reinventing storage logic, no more hand-rolled indexing.

With ic-dbms, teams finally have the building blocks to create real-world, data-driven applications on the IC without fighting the underlying infrastructure.

## Ready to Get Started?

Do you want to try it out? Check the [GitHub repository](https://github.com/veeso/ic-dbms) for documentation and examples to get started.

The [get started guide](https://veeso.github.io/ic-dbms/docs/get-started.html) will walk you through the process of defining your database schema and deploying your first DBMS canister on the Internet Computer.
