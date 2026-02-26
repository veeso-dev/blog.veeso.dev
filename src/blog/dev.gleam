//// Runner for dev server with live reloading and file watching.

import blog/config
import blogatto/dev

pub fn main() {
  config.config()
  |> dev.new()
  |> dev.port(3000)
  |> dev.start()
}
