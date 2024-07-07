---
date: '2024-07-12 16:00:00'
slug: 'implementare-un-range-parser-con-generic-in-rust'
title: "Implementare un range parser con generic in Rust"
subtitle: "Sembra facile, ma non lo è"
author: 'Christian Visintin'
featuredImage: ./featured.jpeg
lang: it
---

## Problemi semplici che richiedono soluzioni complesse

Un paio di giorni fa avevo bisogno di implementare un range parser, cioè una funzione che data la **rappresentazione in stringa** di un **range**, mi ritornasse un **Vec** con tutti gli elementi da includere per quel range.

La volevo generica per qualsiasi tipo primitivo intero numerico, quindi ho cominciato a scrivere una funzione con questa firma:

```rust
/// Parse a range string to a vector of usize
///
/// # Arguments
/// - range_str: &str - the range string to parse
///
/// # Returns
/// - Result<Vec<T>, anyhow::Error> - the parsed range
///
/// # Example
///
/// ```rust
/// let range: Vec<u64> = parse_range::<u64>("0-3").unwrap();
/// assert_eq!(range, vec![0, 1, 2, 3]);
///
/// let range: Vec<u64> = parse_range::<u64>("0,1,2,3").unwrap();
/// assert_eq!(range, vec![0, 1, 2, 3]);
/// ```
fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
```

e ho poi implementato il corpo così:

```rust
fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>> {
    // parse both format: 0-3 or 0,1,2,3
    if range_str.contains('-') {
        let mut range = range_str.split('-');
        let start = range.next().ok_or_else(|| "invalid range: start token not found")?;
        let end = range.next().ok_or_else(|| "invalid range: end token not found")?;
        let start = start
            .parse::<T>()
            .map_err(|_| "invalid range: start is not a number")?;
        let end = end
            .parse::<T>()
            .map_err(|_| "invalid range: end is not a number")?;

        Ok((start..=end).collect::<Vec<T>>())
    } else {
        let range = range_str
            .split(',')
            .map(|s| {
                s.parse::<T>()
                    .map_err(|_| "invalid range values: not a number")
            })
            .collect::<Result<Vec<T>, _>>()?;
        Ok(range)
    }
}
```

Quindi prima cerca un range come `start-end`, altrimenti prova come `a,b,...,y,z`.

Se il range contiene un `-` splitta la stringa e fa il parse di `start` e `end` come `T`. Se ci riesce fa un collect di tutti gli item compresi tra di essi.

> ❗ Chiaramente questo è un caso più semplice e volendo si sarebbe potuto fare la versione complessa che permette entrambi i formati contemporaneamente. Tra l'altro con i numeri negativi non funziona.

Attualmente questo codice non funziona, perché dobbiamo impostare `T` come un tipo che può essere parserizzato da una `str`:

```rust
fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
where
    T: FromStr,
{
  // ...
}
```

![looks-great-so-far](./looks-great-chris-evans.gif)

Ma a quanto pare il compilatore non è ancora contento...

```txt
error[E0599]: the method `collect` exists for struct `RangeInclusive<T>`, but its trait bounds were not satisfied
   --> src/main.rs:44:26
    |
44  |         Ok((start..=end).collect::<Vec<T>>())
    |                          ^^^^^^^ method cannot be called on `RangeInclusive<T>` due to unsatisfied trait bounds
    |
   ::: /home/veeso/.rustup/toolchains/stable-x86_64-unknown-linux-gnu/lib/rustlib/src/rust/library/core/src/ops/range.rs:345:1
    |
345 | pub struct RangeInclusive<Idx> {
    | ------------------------------ doesn't satisfy `RangeInclusive<T>: Iterator`
    |
    = note: the following trait bounds were not satisfied:
            `T: Step`
            which is required by `RangeInclusive<T>: Iterator`
            `RangeInclusive<T>: Iterator`
            which is required by `&mut RangeInclusive<T>: Iterator`
help: consider restricting the type parameter to satisfy the trait bound
    |
26  |     T: FromStr, T: Step
    |               ~~~~~~~~~
```

**Step** trait? Cos'è? Beh, lo step è quel trait che definisce come quel tipo si comporta in un iteratore in un range. Infatti per noi è ovvio che `2` viene dopo `1` e prima di `3`, ma per il compilatore non lo è. Infatti `T` qui potrebbe essere qualsiasi cosa, anche una stringa o una struct, purché implementi `FromStr`.

Per esempio se passo questa struct:

```rust
struct MyType {
  a: String,
  b: String,
}

impl FromStr for MyType {
  // ...
}
```

Potrei richiedere di avere un range di `MyType`. Ma cosa abbiamo tra `MyType A` e `MyType N`? Il trait **Step** serve proprio a dare una risposta a questo problema!

Quindi aggiungiamo lo Step trait e abbiamo finito!

```rust
use std::iter::Step;

fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
where
    T: FromStr + Step,
{
  // ...
}
```

![nope](./nope.gif)

Ops, no, non va...

```txt
error[E0658]: use of unstable library feature 'step_trait'
 --> src/main.rs:1:25
  |
1 | use std::{error::Error, iter::Step, str::FromStr};
  |                         ^^^^^^^^^^
  |
  = note: see issue #42168 <https://github.com/rust-lang/rust/issues/42168> for more information

error[E0658]: use of unstable library feature 'step_trait'
  --> src/main.rs:26:18
   |
26 |     T: FromStr + Step,
   |                  ^^^^
   |
   = note: see issue #42168 <https://github.com/rust-lang/rust/issues/42168> for more information

For more information about this error, try `rustc --explain E0658`.
```

Quindi per ricapitolare: ci serve un range di `T`, che richiede il trait `Step`, ma `Step` è unstable.
Quindi? Non si può fare mi sa...

## Soluzione 1 - Workaround con Ops

Okay, proviamo a pensre a questa soluzione. Sappiamo che non possiamo usare Step, ma dal momento che a noi interessa lavorare solo con numeri interi, potremmo semplicemente raggirare il problema. Cioè, se noi vogliamo semplicemente tutti gli elementi tra `n` ed `m`, potremmo fare così:

1. Impostiamo `x = n`
2. Mettiamo `x` nel nostro Vec
3. Impostiamo `x = x + 1`
4. Se `x > m` allora usciamo dal ciclo
5. Altrimenti torniamo allo `step 2`

Non ci servirà `Step` per questa logica, ma solo `Add`, `Eq` e `Ord`!

![think-about-it-meme](./think-about-it.gif)

```rust
use std::cmp::{Eq, Ord};
use std::ops::Add;

fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
where
    T: FromStr + Add<Output = T> + Eq + Ord,
{
  // ...

        let mut range = Vec::new();
        let mut x = start;
        while x <= end {
            range.push(x);
            x = x + 1;
        }

        Ok(range)
  
  // ...
}
```

Ci siamo quasi, abbiamo solo un ultimo problema da risolvere: come aggiungiamo `1` a `x`? `1` non è `T`. Dovremmo tipo trovare un modo per sommare una unità `Unit` a `x as T`.

### Il trait Unit

Purtroppo in Rust non c'è niente del genere, ma possiamo pur sempre farcelo da soli!

```rust
/// A trait for types that have a unit value.
///
/// E.g. 1 for integers, 1.0 for floats, etc.
pub trait Unit {
    fn unit() -> Self;
}
```

A questo punto usiamo le `macro_rules!` per implementarlo per tutti i tipi interi

```rust
/// Implement One for common numeric types.
macro_rules! impl_one_for_numeric {
    ($($t:ty)*) => ($(
        impl Unit for $t {
            fn unit() -> Self {
                1
            }
        }
    )*)
}

impl_one_for_numeric!(usize u8 u16 u32 u64 isize i8 i16 i32 i64);
```

Ed infine andiamo ad aggiungerlo ai bounds:

```rust
fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
where
    T: FromStr + Add<Output = T> + Eq + Ord + Unit + Copy,
```

E andiamo quindi a finalizzare la nostra implementazione:

```rust
let mut range = Vec::new();
let mut x = start;
while x <= end {
    range.push(x);
    x = x + T::unit();
}

Ok(range)
```

Tra l'altro qui ho dovuto pure aggiungere `Copy`, perché

```rust
range.push(x);
x = x + T::unit();
```

deve copiare il valore di `x` in `range`.

Quindi possiamo compilare con successo la nostra funzione:

```rust
fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
where
    T: FromStr + Add<Output = T> + Eq + Ord + Unit + Copy,
{
    // parse both format: 0-3 or 0,1,2,3
    if range_str.contains('-') {
        let mut range = range_str.split('-');
        let start = range
            .next()
            .ok_or_else(|| "invalid range: start token not found")?;
        let end = range
            .next()
            .ok_or_else(|| "invalid range: end token not found")?;
        let start = start
            .parse::<T>()
            .map_err(|_| "invalid range: start is not a number")?;
        let end = end
            .parse::<T>()
            .map_err(|_| "invalid range: end is not a number")?;

        let mut range = Vec::new();
        let mut x = start;
        while x <= end {
            range.push(x);
            x = x + T::unit();
        }

        Ok(range)
    } else {
        let range = range_str
            .split(',')
            .map(|s| {
                s.parse::<T>()
                    .map_err(|_| "invalid range values: not a number")
            })
            .collect::<Result<Vec<T>, _>>()?;
        Ok(range)
    }
}
```

## Soluzione brutta - TryInto and TryFrom Isize

Una soluzione alternativa avrebbe potuto essere utilizzare il tipo `isize` con casting. È effettivamente più semplice arrivarci, ma probabilmente non è un granché come soluzione.

In pratica avremmo potuto usare `TryInto` e `TryFrom` per usize:

```rust
fn parse_range<T>(range_str: &str) -> Result<Vec<T>, Box<dyn Error>>
where
    T: FromStr + TryInto<isize> + TryFrom<isize>,
{
    // parse both format: 0-3 or 0,1,2,3
    if range_str.contains('-') {
        let mut range = range_str.split('-');
        let start = range
            .next()
            .ok_or_else(|| "invalid range: start token not found")?;
        let end = range
            .next()
            .ok_or_else(|| "invalid range: end token not found")?;
        let start = start
            .parse::<isize>()
            .map_err(|_| "invalid range: start is not a number")?;
        let end = end
            .parse::<isize>()
            .map_err(|_| "invalid range: end is not a number")?;

        let range = (start..=end).collect::<Vec<isize>>();
        let mut t_range = Vec::with_capacity(range.len());
        for x in range {
            if let Ok(x) = x.try_into() {
                t_range.push(x);
            } else {
                return Err("invalid range values: conversion error".into());
            }
        }
        Ok(t_range)
    } else {
        let range = range_str
            .split(',')
            .map(|s| {
                s.parse::<T>()
                    .map_err(|_| "invalid range values: not a number")
            })
            .collect::<Result<Vec<T>, _>>()?;
        Ok(range)
    }
}

```

Ed effettivamente funziona: provare per credere. L'unico problema è che ci sono casi in cui fallirà, per esempio con degli `u64` particolarmente grandi. Certo, essendo pensata per l'utente che inserisce dei range a mano, non ci sono grandi controindicazioni, però è comunque problematica.

## Conclusioni

Spero tu abbia trovato questo articolo interessante, o se era esattamente quello che stavi cercando di implementare, spero sia stato utile. Magari nel mentre controlla se Step è stato messo come stable :sweat_smile:.
