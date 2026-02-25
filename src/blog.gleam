//// Main entry point: configures blogatto and builds the static site.

import blog/components/md_components
import blog/pages/blog
import blog/pages/home
import blog/template/blog as blog_template
import blogatto
import blogatto/config
import blogatto/config/feed
import blogatto/config/markdown
import blogatto/config/robots
import blogatto/config/sitemap
import blogatto/error as blogatto_error
import gleam/dict
import gleam/io
import gleam/list
import gleam/option
import gleam/string
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
    |> feed.serialize(serialize_feed_item)

  let cfg =
    config.new("https://blog.veeso.dev")
    |> config.output_dir("./dist")
    |> config.static_dir("./static")
    |> config.markdown(md)
    |> config.feed(rss)
    |> config.sitemap(sitemap.new("/sitemap.xml"))
    |> config.route("/", home.home)
    |> config.route("/blog/", blog.blog)
    |> config.robots(
      robots.RobotsConfig(
        sitemap_url: "https://blog.veeso.dev/sitemap.xml",
        robots: [
          robots.Robot(
            user_agent: "*",
            allowed_routes: ["/"],
            disallowed_routes: [],
          ),
        ],
      ),
    )

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

fn serialize_feed_item(metadata: feed.FeedMetadata(msg)) -> feed.FeedItem {
  let enclosure = case metadata.post.featured_image {
    option.None -> option.None
    option.Some(featured_image) -> {
      let url = case featured_image {
        "http" <> _ -> featured_image
        path ->
          "https://blog.veeso.dev/blog/en/" <> metadata.post.slug <> "/" <> path
      }
      let mime = image_mime_type(featured_image)
      option.Some(feed.Enclosure(url:, length: 0, enclosure_type: mime))
    }
  }

  let categories =
    metadata.post.extras
    |> dict.get("tag")
    |> option.from_result
    |> option.map(fn(x) { [x] })
    |> option.unwrap(or: [])

  feed.FeedItem(
    title: metadata.post.title,
    description: metadata.excerpt,
    link: option.Some(metadata.url),
    author: option.Some("Christian Visintin"),
    comments: option.None,
    source: option.None,
    pub_date: option.Some(metadata.post.date),
    categories:,
    enclosure:,
    guid: option.Some(metadata.url),
  )
}

fn image_mime_type(filename: String) -> String {
  let name = string.lowercase(filename)
  let extension =
    name
    |> string.split(".")
    |> list.last()
    |> option.from_result()
    |> option.unwrap("")

  case extension {
    "png" -> "image/png"
    "gif" -> "image/gif"
    "webp" -> "image/webp"
    "svg" -> "image/svg+xml"
    _ -> "image/jpeg"
  }
}
