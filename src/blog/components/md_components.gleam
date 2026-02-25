//// Custom markdown rendering components for blogatto's markdown pipeline.

import blog/components
import blog/components/container
import blog/components/heading
import blogatto/config/markdown
import gleam/int
import gleam/option.{type Option}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

/// Markdown components for markdown rendering.
pub fn components() -> markdown.Components(msg) {
  markdown.Components(
    ..markdown.default_components(),
    a: a,
    blockquote: blockquote,
    code: code,
    h1: heading.h1,
    h2: heading.h2,
    h3: heading.h3,
    h4: heading.h4,
    h5: heading.h5,
    hr: hr,
    img: img,
    li: li,
    ol: ol,
    p: p,
    pre: pre,
    ul: ul,
  )
}

fn a(
  href: String,
  title: Option(String),
  children: List(Element(msg)),
) -> Element(msg) {
  html.a(
    [
      attribute.href(href),
      title_attr(title),
      attribute.target("_blank"),
      components.classes([
        "font-medium", "text-brand", "dark:text-gray-200", "underline",
        "hover:no-underline",
      ]),
    ],
    children,
  )
}

fn blockquote(children: List(Element(msg))) -> Element(msg) {
  html.blockquote(
    [
      components.classes([
        "border-l-4",
        "border-brand",
        "dark:border-gray-400",
        "bg-gray-50",
        "dark:bg-zinc-800",
        "italic",
        "pl-4",
        "py-2",
        "my-4",
        "text-gray-700",
        "dark:text-gray-200",
      ]),
    ],
    children,
  )
}

fn code(language: Option(String), children: List(Element(msg))) -> Element(msg) {
  let class =
    language
    |> option.map(fn(lang) { attribute.class("language-" <> lang) })
    |> option.unwrap(
      or: components.classes([
        "bg-gray-100",
        "dark:bg-gray-800",
        "px-1.5",
        "py-0.5",
        "rounded",
        "text-sm",
        "font-mono",
      ]),
    )

  html.code([class], children)
}

fn img(src: String, alt: String, title: Option(String)) -> Element(msg) {
  html.div(
    [
      components.classes([
        "flex",
        "justify-center",
        "items-center",
        "py-4",
        "md-img-container",
      ]),
    ],
    [
      html.img([
        attribute.src(src),
        attribute.alt(alt),
        title_attr(title),
        components.classes(["md-img"]),
      ]),
    ],
  )
}

fn li(children: List(Element(msg))) -> Element(msg) {
  html.li(
    [
      components.classes([
        "text-lg",
        "py-2",
        "text-gray-600",
        "dark:text-gray-200",
      ]),
    ],
    children,
  )
}

fn hr() -> Element(msg) {
  html.hr([
    components.classes(["my-8", "border-gray-300", "dark:border-gray-600"]),
  ])
}

fn ol(start: Option(Int), children: List(Element(msg))) -> Element(msg) {
  let start =
    start
    |> option.map(int.to_string)
    |> option.map(attribute.attribute("start", _))
    |> option.unwrap(or: attribute.none())

  html.ol(
    [
      start,
      components.classes(["px-8", "list-decimal", "sm:px-0"]),
    ],
    children,
  )
}

fn p(children: List(Element(msg))) -> Element(msg) {
  html.p(
    [
      components.classes([
        "w-full",
        "mb-4",
        "text-justify",
        "text-lg",
        "text-gray-700",
        "dark:text-gray-100",
      ]),
    ],
    children,
  )
}

fn pre(children: List(Element(msg))) -> Element(msg) {
  container.row(["w-full", "relative"], [
    html.div([components.classes(["overflow-auto", "flex-1"])], [
      html.pre(
        [
          components.classes(["overflow-auto", "w-fit", "mb-4", "p-5"]),
        ],
        children,
      ),
    ]),
    pre_copy_button(),
  ])
}

fn pre_copy_button() -> Element(msg) {
  html.div([components.classes(["absolute", "top-2", "right-2"])], [
    html.button(
      [
        components.classes([
          "bg-inherit",
          "rounded",
          "p-1",
          "hover:bg-gray-200",
          "active:bg-gray-300",
        ]),
        attribute.attribute(
          "onclick",
          "navigator.clipboard.writeText(this.closest('.flex').querySelector('pre').textContent)",
        ),
      ],
      [
        html.i([attribute.attribute("data-feather", "copy")], []),
      ],
    ),
  ])
}

fn ul(children: List(Element(msg))) -> Element(msg) {
  html.ul(
    [
      components.classes(["px-8", "list-disc", "sm:px-0"]),
    ],
    children,
  )
}

fn title_attr(title: Option(String)) -> attribute.Attribute(msg) {
  title
  |> option.map(attribute.title)
  |> option.unwrap(or: attribute.none())
}
