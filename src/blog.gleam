//// Main entry point: configures blogatto and builds the static site.

import blog/components/md_components
import blog/pages/blog
import blog/pages/home
import blog/template/blog as blog_template
import blogatto
import blogatto/config
import blogatto/config/feed
import blogatto/config/markdown
import blogatto/config/sitemap
import blogatto/error as blogatto_error
import gleam/io
import tailwind

/// Build the blog: install Tailwind, configure blogatto, and generate output.
pub fn main() {
  case tailwind.install() {
    Ok(_) -> io.println("Tailwindcss installed successfully!")
    Error(e) -> panic as { "Failed to install Tailwind: " <> e }
  }

  let md =
    markdown.default()
    |> markdown.markdown_path("./blog")
    |> markdown.route_prefix("blog")
    |> markdown.template(blog_template.template)
    |> markdown.components(md_components.components())

  let rss =
    feed.new(
      "veeso.dev",
      "https://blog.veeso.dev",
      "A blog about Rust, Gleam, and open source software development",
    )
    |> feed.language("en-us")
    |> feed.output("/rss/en.xml")

  let cfg =
    config.new("https://blog.veeso.dev")
    |> config.output_dir("./dist")
    |> config.static_dir("./static")
    |> config.markdown(md)
    |> config.feed(rss)
    |> config.sitemap(sitemap.new("/sitemap.xml"))
    |> config.route("/", home.home)
    |> config.route("/blog/", blog.blog)

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
