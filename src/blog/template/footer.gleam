//// Site footer with copyright notice.

import blog/components
import blog/components/container
import gleam/int
import gleam/time/duration
import gleam/time/timestamp
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

/// Render the site footer with copyright and the current year.
pub fn footer() -> Element(msg) {
  html.footer([], [
    container.col(
      [
        "bg-brand",
        "text-white",
        "py-10",
        "items-center",
        "justify-center",
        "gap-4",
      ],
      [built_with_blogatto(), copyright_line()],
    ),
  ])
}

fn built_with_blogatto() -> Element(msg) {
  html.div(
    [
      components.classes([
        "text-center",
        "text-sm",
        "text-gray-300",
      ]),
    ],
    [
      element.text("Built with ❤️ with "),
      html.a(
        [
          components.classes(["underline"]),
          attribute.href("https://blogat.to"),
        ],
        [
          element.text("Blogatto"),
          html.img([
            attribute.src("/blogatto.svg"),
            attribute.alt("Blogatto logo"),
            components.classes(["inline", "h-8", "ml-1"]),
          ]),
          element.text("."),
        ],
      ),
    ],
  )
}

fn copyright_line() -> Element(msg) {
  text("Christian Visintin © " <> current_year() <> ". All rights reserved.")
}

fn current_year() -> String {
  let #(date, _time) =
    timestamp.system_time()
    |> timestamp.to_calendar(duration.seconds(0))
  int.to_string(date.year)
}

fn text(text: String) -> Element(msg) {
  html.div([components.classes(["text-center", "text-sm", "text-gray-300"])], [
    element.text(text),
  ])
}
