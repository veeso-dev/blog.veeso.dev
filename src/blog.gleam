//// Main entry point: configures blogatto and builds the static site.

import blog/config
import blogatto
import blogatto/error as blogatto_error
import gleam/io
import tailwind

/// Build the blog: install Tailwind, configure blogatto, and generate output.
pub fn main() {
  case tailwind.install() {
    Ok(_) -> io.println("Tailwindcss installed successfully!")
    Error(e) -> panic as { "Failed to install Tailwind: " <> e }
  }

  let cfg = config.config()

  case blogatto.build(cfg) {
    Ok(_) -> io.println("Blog built successfully!")
    Error(e) ->
      panic as { "Failed to build blog: " <> blogatto_error.describe_error(e) }
  }

  case tailwind.run(["--input=assets/blog.css", "--output=dist/blog.css"]) {
    Ok(out) -> io.println("Tailwindcss built successfully: " <> out)
    Error(e) -> panic as { "Failed to run Tailwind: " <> e }
  }

  io.println("Blog built successfully!")
}
