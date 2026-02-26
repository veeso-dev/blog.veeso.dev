//// Blog post page template with article layout and share buttons.

import blog/components
import blog/components/container
import blog/components/heading
import blog/components/post_meta
import blog/components/svg
import blog/template/page
import blogatto/post
import gleam/dict
import gleam/list
import gleam/option
import gleam/uri
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

/// Render a full blog post page with featured image, metadata, and share buttons.
pub fn template(
  post: post.Post(msg),
  all_posts: List(post.Post(msg)),
) -> Element(msg) {
  let config =
    page.PageConfig(
      title: post.title,
      description: post.description,
      url: post.url,
      featured_image: post.featured_image,
    )

  page.page(config, [layout(post)], related_posts(post, all_posts))
}

fn layout(post: post.Post(msg)) -> Element(msg) {
  let featured_image =
    post.featured_image
    |> option.map(attribute.src)
    |> option.unwrap(or: attribute.none())

  html.div(
    [components.classes(["m-4", "max-w-3xl", "w-auto", "sm:max-w-full", "p-2"])],
    [
      html.img([
        featured_image,
        attribute.alt("Featured image"),
        components.classes(["rounded", "inset-0"]),
      ]),
      html.div([], [
        heading.h1("", [element.text(post.title)]),
      ]),
      html.div([], [heading.h2("", [element.text(post.description)])]),
      html.div([components.classes(["mx-auto"])], [article(post)]),
    ],
  )
}

fn article(post: post.Post(msg)) -> Element(msg) {
  html.article([components.classes(["px-4"])], [
    container.responsive_row(
      [
        "items-center",
        "justify-between",
      ],
      [
        html.div([], [
          post_meta.formatted_date(post.date),
          span("—"),
          post_meta.reading_time(post),
        ]),
        share_buttons(post.url, post.title),
      ],
    ),
    html.div([components.classes(["py-4"])], post.contents),
    article_footer(post),
  ])
}

fn article_footer(post: post.Post(msg)) -> Element(msg) {
  container.col([], [
    container.responsive_row(
      [
        "justify-between",
        "items-center",
        "my-10",
        "sm:gap-8",
      ],
      [
        container.responsive_row(
          [
            "items-center",
            "justify-center",
            "gap-8",
          ],
          [
            html.a(
              [
                attribute.href("/blog/"),
                components.classes([
                  "font-medium",
                  "text-lg",
                  "text-brand",
                  "dark:text-gray-300",
                  "underline",
                  "hover:no-underline",
                ]),
              ],
              [element.text("Discover more")],
            ),
            html.a(
              [
                attribute.href("https://hachyderm.io/@veeso_dev"),
                components.classes([
                  "font-medium",
                  "text-brand",
                  "dark:text-gray-200",
                  "underline",
                  "hover:no-underline",
                ]),
              ],
              [
                svg.mastodon(20),
                element.text("Follow me on Mastodon"),
              ],
            ),
            share_buttons(post.url, post.title),
          ],
        ),
      ],
    ),
  ])
}

fn span(text: String) -> Element(msg) {
  html.span(
    [components.classes(["text-gray-400", "dark:text-gray-300", "pr-2"])],
    [element.text(text)],
  )
}

fn share_buttons(url: String, title: String) -> Element(msg) {
  container.row(["text-brand", "dark:text-gray-200", "gap-8", "justify-end"], [
    share_link(facebook_share_url(url), svg.feather_icon("facebook")),
    share_link(x_share_url(url, title), svg.x(20)),
    share_link(linkedin_share_url(url, title), svg.feather_icon("linkedin")),
    share_link(telegram_share_url(url, title), svg.telegram(20)),
    share_link(whatsapp_share_url(url, title), svg.whatsapp(20)),
  ])
}

fn share_link(href: String, icon: Element(msg)) -> Element(msg) {
  html.a(
    [
      attribute.href(href),
      attribute.target("_blank"),
      attribute.attribute("rel", "noopener noreferrer"),
      components.classes([
        "transition-transform", "transform", "scale-100", "hover:scale-125",
        "inline-flex", "items-center",
      ]),
    ],
    [icon],
  )
}

fn facebook_share_url(url: String) -> String {
  "https://www.facebook.com/sharer/sharer.php?u=" <> uri.percent_encode(url)
}

fn x_share_url(url: String, title: String) -> String {
  "https://twitter.com/intent/tweet?url="
  <> uri.percent_encode(url)
  <> "&text="
  <> uri.percent_encode(title)
}

fn linkedin_share_url(url: String, title: String) -> String {
  "https://www.linkedin.com/shareArticle?mini=true&url="
  <> uri.percent_encode(url)
  <> "&title="
  <> uri.percent_encode(title)
}

fn telegram_share_url(url: String, title: String) -> String {
  "https://t.me/share/url?url="
  <> uri.percent_encode(url)
  <> "&text="
  <> uri.percent_encode(title)
}

fn whatsapp_share_url(url: String, title: String) -> String {
  "https://wa.me/?text=" <> uri.percent_encode(title <> " " <> url)
}

fn related_posts(
  post: post.Post(msg),
  all_posts: List(post.Post(msg)),
) -> Element(msg) {
  case dict.get(post.extras, "category") {
    Error(_) -> element.none()
    Ok(category) -> {
      let siblings =
        all_posts
        |> list.filter(fn(post) {
          case dict.get(post.extras, "category") {
            Error(_) -> False
            Ok(post_category) -> post_category == category
          }
        })
        |> list.take(2)
      case siblings {
        [] -> element.none()
        siblings -> related_posts_view(siblings)
      }
    }
  }
}

fn related_posts_view(posts: List(post.Post(msg))) -> Element(msg) {
  html.div([], [
    html.div(
      [
        components.classes(["pt-4", "pb-2"]),
      ],
      [
        html.span(
          [
            components.classes([
              "text-xl",
              "block",
              "text-brand",
              "dark:text-white",
              "font-normal",
            ]),
          ],
          [element.text("You might also like")],
        ),
      ],
    ),
    html.div(
      [
        components.classes([
          "grid",
          "grid-cols-2",
          "sm:grid-cols-1",
          "gap-4",
          "items-start",
          "justify-start",
        ]),
      ],
      list.map(posts, related_post_card),
    ),
  ])
}

fn related_post_card(post: post.Post(msg)) -> Element(msg) {
  let featured_image = case post.featured_image {
    option.None -> element.none()
    option.Some(url) -> {
      let featured_image = post_uri(post) <> url
      html.img([
        attribute.src(featured_image),
        attribute.alt("Featured image"),
        attribute.class("rounded-t-lg"),
      ])
    }
  }

  html.a(
    [
      attribute.href(post_uri(post)),
      components.classes([
        "block",
        "rounded",
        "shadow-lg",
        "dark:shadow-none",
        "bg-white",
        "dark:bg-zinc-800",
        "text-brand",
        "h-full",
        "dark:text-gray-200",
        "transition-transform",
        "transform",
        "hover:scale-105",
      ]),
    ],
    [
      html.div([components.classes(["rounded-t-lg", "inset-0"])], [
        featured_image,
      ]),
      html.div([components.classes(["pt-4", "pb-6", "px-6"])], [
        html.div([], [
          html.span(
            [
              components.classes([
                "text-md",
                "sm:text-lg",
                "py-2",
                "dark:text-white",
                "text-brand",
                "font-normal",
              ]),
            ],
            [element.text(post.title)],
          ),
        ]),
        html.p(
          [
            components.classes(["text-justify", "text-brand", "dark:text-white"]),
          ],
          [element.text(post.excerpt)],
        ),
      ]),
    ],
  )
}

/// relative url to post
fn post_uri(post: post.Post(msg)) -> String {
  "/blog/en/" <> post.slug <> "/"
}
