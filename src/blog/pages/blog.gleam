//// Blog listing page showing all published posts.

import blog/components
import blog/components/heading
import blog/components/post_preview
import blog/template/page
import blogatto/post
import gleam/list
import gleam/option
import lustre/element.{type Element}
import lustre/element/html

/// Render the blog listing page with all posts in a responsive grid.
pub fn blog(posts: List(post.Post(Nil))) -> Element(Nil) {
  let config =
    page.PageConfig(
      title: "blog.veeso.dev - A blog about Rust, Gleam, and open source software development",
      description: "Rust tech blogger, Gleam blogger, software engineer, and open-source enthusiast. I write about Rust, Gleam, and open source software development. Seen on this week in Rust",
      url: "https://blog.veeso.dev/blog/",
      featured_image: option.Some("https://blog.veeso.dev/og_preview.jpeg"),
    )

  page.page(config, [page_content(posts)], element.none())
}

fn page_content(posts: List(post.Post(Nil))) -> Element(Nil) {
  element.fragment([
    heading.h1("", [element.text("Blog Posts")]),
    html.div(
      [
        components.classes([
          "grid",
          "grid-cols-2",
          "gap-4",
          "sm:grid-cols-1",
          "items-start",
          "justify-start",
        ]),
      ],
      list.map(posts, post_preview.post_preview),
    ),
  ])
}
