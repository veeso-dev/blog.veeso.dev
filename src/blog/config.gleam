import blog/components/md_components
import blog/pages/blog
import blog/pages/home
import blog/template/blog as blog_template
import blogatto/config
import blogatto/config/feed
import blogatto/config/markdown
import blogatto/config/robots
import blogatto/config/sitemap
import gleam/dict
import gleam/list
import gleam/option
import gleam/string
import marceau

pub fn config() -> config.Config(Nil) {
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

  "https://blog.veeso.dev"
  |> config.new()
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
    |> dict.get("category")
    |> option.from_result
    |> option.map(fn(x) { [x] })
    |> option.unwrap(or: [])

  feed.FeedItem(
    title: metadata.post.title,
    description: metadata.post.excerpt,
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

  marceau.extension_to_mime_type(extension)
}
