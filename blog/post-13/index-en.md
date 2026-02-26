---
date: '2024-07-06 15:00:00'
slug: 'how-to-configure-cpu-cores-to-be-used-on-a-tokio-with-core--affinity'
title: 'How to configure CPU cores to be used in a Tokio application with core_affinity'
description: "Let's see how to setup the tokio runtime to use only the configured cores"
author: 'veeso'
featured_image: featured.jpeg
category: rust-tutorials
reading_time: '4'
---

There are several cases where applications are developed for extreme performance and choosing the cores to be used for an application is required. For instance we may want to reserve certain cores for some specific process, or we may want to chunk the server's cores based on the service.

To do so in Tokio, we'll be using the [core_affinity](https://docs.rs/core_affinity/latest/core_affinity/) Rust crate.

## Dependencies

To setup our project to configure the cores to use, we first need to configure the project dependencies in Cargo.toml

```toml
core_affinity = "0.8"
tokio = { version = "1", features = [ "full" ] }
```

## Get Cores

Now we may want to implement a function to get the cores we want to use. Usually in the applications I've implemented where I've used core-affinity I let the user to pass as CLI argument the cores he wants to use in the range syntax `x,y,z` or `n-m`.

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

> ❗ Usually CPU cores are sorted and identified by the numeric index from 0 to number of cores.

## Configure the Tokio Runtime

At this point we eventually just need to configure the **Tokio runtime**.

Usually we have a main like this with tokio:

```rust
#[tokio::main]
async fn main() -> anyhow::Result<()> {
  // ...

  Ok(())
}
```

In this case though, we need to configure the runtime, so we need to build it ourselves.

### The magic behind the tokio::main macro

Let me just quickly show something you may not know about the `tokio::main` macro. What it does is exactly setting up the runtime for us with the default configuration, like this:

```rust
fn main() -> anyhow::Result<()> {
  let rt = tokio::runtime::Runtime::new().unwrap();

  rt.block_on(async {
    // ... code inside of async fn main ...
  })
}
```

### Let's setup the Tokio runtime with core affinity

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

So let's see step by step how we managed to configure the cores to be used by tokio.

Actually, all the magic happens inside of `on_thread_start`, which will be executed after each `tokio::task::spawn`.

Here we decide to choose a random core between those we have configured for our application:

```rust
// enable use of `choose`
use rand::seq::SliceRandom;
let mut rng = rand::thread_rng();
let core = cpu_cores.choose(&mut rng).unwrap(); // can't be empty, so we can unwrap safely
```

At this point, once we have selected the core for this worker, we use `core_affinity::set_for_current` to assign to the worker a certain CPU core.

```rust
if core_affinity::set_for_current(*core) {
    debug!("pinning worker thread to core {}", core.id);
} else {
    error!("failed to pin worker thread to core {}", core.id);
}
```

> ❗The callback set in `on_thread_start` is run everytime we call `tokio::task::spawn`

## Conclusions

So this was how to configure the core to be used by a tokio task with Rust using **core_affinity**.

Clearly, this code can be expanded to choose the core with several other criteria, such as the task type etc, using some contexts. Also you can opt to use core_affinity in a sync environment application, just by calling `core_affinity::set_for_current` after spawning a thread and eventually in the `main()` function.
