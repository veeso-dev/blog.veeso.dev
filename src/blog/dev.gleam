//// Runner for dev server with live reloading and file watching.

import blog/config
import blogatto/dev
import gleam/io
import tailwind

pub fn main() {
  case tailwind.install() {
    Ok(_) -> io.println("Tailwindcss installed successfully!")
    Error(e) -> panic as { "Failed to install Tailwind: " <> e }
  }

  config.config()
  |> dev.new()
  |> dev.after_build(build_tailwind_css)
  |> dev.port(3000)
  |> dev.start()
}

fn build_tailwind_css() -> Result(Nil, String) {
  case tailwind.run(["--input=assets/blog.css", "--output=dist/blog.css"]) {
    Ok(out) -> {
      io.println("Tailwindcss built successfully: " <> out)
      Ok(Nil)
    }
    Error(e) -> Error("Failed to run Tailwind: " <> e)
  }
}
