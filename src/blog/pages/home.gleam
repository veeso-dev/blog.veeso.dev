//// Homepage with author bio and latest posts.

import blog/components
import blog/components/container
import blog/components/heading
import blog/components/post_preview
import blog/template/page
import blogatto/post
import gleam/list
import gleam/option
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

/// Render the homepage with author bio and the four latest posts.
pub fn home(posts: List(post.Post(Nil))) -> Element(Nil) {
  let config =
    page.PageConfig(
      title: "blog.veeso.dev - A blog about Rust, Gleam, and open source software development",
      description: "Rust tech blogger, Gleam blogger, software engineer, and open-source enthusiast. I write about Rust, Gleam, and open source software development. Seen on this week in Rust",
      url: "https://blog.veeso.dev/",
      featured_image: option.Some("https://blog.veeso.dev/og_preview.jpeg"),
    )

  page.page(config, [page_content(posts)])
}

fn page_content(posts: List(post.Post(Nil))) -> Element(Nil) {
  element.fragment([
    bio(),
    latest_posts(posts),
  ])
}

fn bio() -> Element(Nil) {
  container.responsive_row(
    ["items-center", "justify-between", "gap-8", "p-10"],
    [
      html.div([], [
        html.img([
          attribute.src("/avatar.webp"),
          attribute.alt("A picture of me"),
          attribute.loading("eager"),
          components.classes(["rounded-full", "h-auto", "w-[128px]"]),
        ]),
      ]),
      html.div([attribute.class("flex-1")], [
        html.p(
          [
            components.classes([
              "text-brand",
              "w-full",
              "mb-3",
              "text-justify",
              "dark:text-gray-200",
            ]),
          ],
          [
            element.text(
              "I'm Christian Visintin. I live in Udine, Italy. I'm a freelance software engineer. I'm also an open-source developer. On this blog I write about my dev misadventures and give unneeded opinions on many topics involving technology and development",
            ),
          ],
        ),
      ]),
    ],
  )
}

fn latest_posts(posts: List(post.Post(Nil))) -> Element(Nil) {
  let latest_posts = list.take(posts, 4)

  html.div([], [
    heading.h1("", [element.text("Latest Posts")]),
    html.div(
      [components.classes(["grid", "grid-cols-2", "gap-x-4", "sm:grid-cols-1"])],
      list.map(latest_posts, post_preview.post_preview),
    ),
  ])
}
