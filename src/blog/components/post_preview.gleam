//// Post preview card component for blog listing pages.

import blog/components
import blog/components/heading
import blog/components/post_meta
import blogatto/post
import gleam/option
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

/// Post preview component
pub fn post_preview(post: post.Post(msg)) -> Element(msg) {
  html.div(
    [components.classes(["p-2", "border-b", "border-gray-200", "h-full"])],
    [
      image_preview(post),
      heading.h2("", [
        html.a(
          [
            attribute.href(post_uri(post)),
            components.classes([
              "text-brand",
              "dark:text-gray-200",
              "hover:underline",
            ]),
          ],
          [element.text(post.title)],
        ),
      ]),
      heading.h3("", [element.text(post.description)]),
      html.p(
        [
          components.classes([
            "w-full",
            "mb-3",
            "text-justify",
            "text-gray-400",
            "dark:text-gray-400",
          ]),
        ],
        [
          element.text("Published on "),
          post_meta.formatted_date(post.date),
          element.text(" - "),
          post_meta.reading_time(post),
        ],
      ),
    ],
  )
}

fn image_preview(post: post.Post(msg)) -> Element(msg) {
  case post.featured_image {
    option.None -> element.none()
    option.Some(featured_image) -> {
      let featured_image = case featured_image {
        "http" <> _ -> featured_image
        path -> "/blog/en/" <> post.slug <> "/" <> path
      }

      html.div(
        [
          components.classes([
            "py-2",
            "transition-discrete",
            "hover:scale-105",
            "cursor-pointer",
          ]),
        ],
        [
          html.a(
            [
              attribute.href(post_uri(post)),
            ],
            [
              html.img([
                attribute.src(featured_image),
                attribute.alt(post.description),
                attribute.loading("eager"),
              ]),
            ],
          ),
        ],
      )
    }
  }
}

/// relative url to post
fn post_uri(post: post.Post(msg)) -> String {
  "/blog/en/" <> post.slug <> "/"
}
