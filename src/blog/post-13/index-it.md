---
date: '2024-07-06 15:00:00'
slug: 'come-configurare-i-core-da-utilizzare-in-tokio-con-core--affinity'
title: "Come configurare i core da utilizzare in un'applicazione Tokio con core_affinity"
subtitle: 'Vediamo insieme come configurare i core della cpu da utilizzare in un ambiente Tokio in Rust'
author: 'veeso'
featuredImage: ./featured.jpeg
lang: it
tag: rust
---

Ci sono diversi casi in cui applicazioni che necessitano di performance estreme e si rende quindi necessario configurare esattamente come distribuire il carico di lavoro della CPU sui vari core per i vari processi.

Farlo in Rust con Tokio è molto semplice e per riuscirci useremo la libreria [core_affinity](https://docs.rs/core_affinity/latest/core_affinity/).

## Dipendenze

Prima di tutto configuriamo le dipendenze nel nostro Cargo.toml per questo progetto:

```toml
core_affinity = "0.8"
tokio = { version = "1", features = [ "full" ] }
```

## Otteniamo i Core della CPU

Adesso per questo esempio vogliamo ottenere gli ID dei core che andremo ad utilizzare.

Di solito nelle applicazioni in cui uso core-affinity, lascio impostare le CPU core come argomento da linea di comando con sintassi range `x,y,z` o `n-m`.

````rust
/// Get the CPU cores to use for the application;
/// if the range is not specified, it will use all the available cores
pub fn get_cpu_cores(range: Option<&str>) -> anyhow::Result<Vec<CoreId>> {
    let available_cores =
        core_affinity::get_core_ids().ok_or(anyhow::anyhow!("Failed to get available cores"))?;

    // log available cores
    for core in &available_cores {
        tracing::info!("Available core: {}", core.id);
    }

    match range.map(parse_range_usize) {
        None => Ok(available_cores),
        Some(Err(err)) => Err(err),
        Some(Ok(range)) => {
            let cores = available_cores
                .into_iter()
                .filter(|core| range.contains(&core.id))
                .collect::<Vec<CoreId>>();
            Ok(cores)
        }
    }
}

/// Parse a range string to a vector of usize
///
/// # Arguments
/// - range_str: &str - the range string to parse
///
/// # Returns
/// - Result<Vec<usize>, anyhow::Error> - the parsed range
///
/// # Example
/// ```
/// use notpu::utils::parse_range_usize;
///
/// let range = parse_range_usize("0-3").unwrap();
/// assert_eq!(range, vec![0, 1, 2]);
///
/// let range = parse_range_usize("0,1,2,3").unwrap();
/// assert_eq!(range, vec![0, 1, 2, 3]);
/// ```
pub fn parse_range_usize(range_str: &str) -> anyhow::Result<Vec<usize>> {
    // parse both format: 0-3 or 0,1,2,3
    if range_str.contains('-') {
        let mut range = range_str.split('-');
        let start = range
            .next()
            .ok_or_else(|| anyhow::anyhow!("Invalid range"))?;
        let end = range
            .next()
            .ok_or_else(|| anyhow::anyhow!("Invalid range"))?;
        let start = start
            .parse::<usize>()
            .map_err(|_| anyhow::anyhow!("Invalid range"))?;
        let end = end
            .parse::<usize>()
            .map_err(|_| anyhow::anyhow!("Invalid range"))?;

        Ok((start..end).collect::<Vec<usize>>())
    } else {
        let range = range_str
            .split(',')
            .map(|s| {
                s.parse::<usize>()
                    .map_err(|_| anyhow::anyhow!("Invalid range"))
            })
            .collect::<Result<Vec<usize>, _>>()?;
        Ok(range)
    }
}
````

> ❗ Di solito i core della CPU sono identificati numericamente dall'indice che va da 0 al numero di core (tipo 0-15)

## Configuriamo il Runtime Tokio

A questo punto non ci resta che configurare il runtime **Tokio** per la nostra applicazione.

Di solito un'applicazione Tokio comincia con questo codice:

```rust
#[tokio::main]
async fn main() -> anyhow::Result<()> {
  // ...

  Ok(())
}
```

Ma in questo caso dobbiamo costruirci il runtime da soli, quindi dovremo scriverci il main base di Rust da soli.

### La magia dietro alla macro tokio::main

Apro una breve parentesi su come funziona la macro `tokio::main`.
Quando noi scriviamo la macro, in realtà il codice viene così espano:

```rust
fn main() -> anyhow::Result<()> {
  let rt = tokio::runtime::Runtime::new().unwrap();

  rt.block_on(async {
    // ... code inside of async fn main ...
  })
}
```

### Configuriamo il runtime con core_affinity

```rust
fn main() -> anyhow::Result<()> {
  // get the cpu cores to use
  let args: CliConfig = argh::from_env();
  let cpu_cores: Vec<CoreId> = utils::get_cpu_cores(args.cpu_cores.as_deref())?;

  // let's build the tokio runtime
  let tokio_runtime = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(cpu_cores.len().max(32))
        .on_thread_start(move || { // here we make use of core affinity to randomly choose a core for the worker
            use rand::seq::SliceRandom;
            // choose a cpu core to run the worker thread
            let mut rng = rand::thread_rng();
            let core = cpu_cores.choose(&mut rng).unwrap();
            if core_affinity::set_for_current(*core) {
                debug!("pinning worker thread to core {}", core.id);
            } else {
                error!("failed to pin worker thread to core {}", core.id);
            }
        })
        .enable_all()
        .build()?;

  // enter runtime
  let _guard = tokio_runtime.enter();

  // run
  tokio_runtime.block_on(async_main(args))
}

async fn async_main(args: CliConfig) -> anyhow::Result<()> {
  // ...
}

```

Vediamo passo a passo come abbiamo configurato tokio per utilizzare core specifici.

In realtà la magia avviene dentro a `on_thread_start`, che verrà chiamato ogni volta che faremo `tokio::task::spawn`.

Qui decidiamo di assegnare al task un core a caso tra quelli configurati:

```rust
// enable use of `choose`
use rand::seq::SliceRandom;
let mut rng = rand::thread_rng();
let core = cpu_cores.choose(&mut rng).unwrap(); // can't be empty, so we can unwrap safely
```

A questo punto, una volta scelto il core, utilizziamo `core_affinity::set_for_current` per assegnare a quel task un core specifico:

```rust
if core_affinity::set_for_current(*core) {
    debug!("pinning worker thread to core {}", core.id);
} else {
    error!("failed to pin worker thread to core {}", core.id);
}
```

> ❗La callback `on_thread_start` viene chiamata ogni volta che chiamiamo `tokio::task::spawn`

## Conclusioni

Quindi questo era come configurare il core della CPU da usare con **core_affinity**.

Chiaramente la scelta del core può essere estesa a criteri diversi e disparati tramite l'utilizzo di un context esterno per la scelta del core.

Inoltre lo stesso approccio può anche venire utilizzato in applicazioni sync tramite `core_affinity::set_for_current` dopo aver fatto spawn di un thread, e anche nel thread principale all'interno della funzione `main()`.
