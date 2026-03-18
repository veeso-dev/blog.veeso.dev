//// Syntax highlighting components for blogatto (smalto).
//// Uses Prism One Light for light theme and VS Code Dark Plus for dark theme,
//// with Tailwind CSS arbitrary color classes and the dark: variant.

import blogatto/config/markdown/code
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

/// Returns the syntax highlighting configuration for the blog.
pub fn config() -> code.SyntaxHighlightingConfig(msg) {
  code.default()
  |> code.keyword(keyword)
  |> code.string(string)
  |> code.number(number)
  |> code.comment(comment)
  |> code.function(function)
  |> code.operator(operator)
  |> code.punctuation(punctuation)
  |> code.type_(type_)
  |> code.module(module)
  |> code.variable(variable)
  |> code.constant(constant)
  |> code.builtin(builtin)
  |> code.tag(tag)
  |> code.attribute(attribute)
  |> code.selector(selector)
  |> code.property(property)
  |> code.regex(regex)
  |> code.custom(custom)
}

// --- One Light (light) / VS Code Dark Plus (dark) token renderers ---

fn keyword(value: String) -> Element(msg) {
  // One Light: #a626a4 (purple) | Dark Plus: #569cd6 (blue)
  themed_span("text-[#a626a4]", "dark:text-[#569cd6]", value)
}

fn string(value: String) -> Element(msg) {
  // One Light: #50a14f (green) | Dark Plus: #ce9178 (salmon)
  themed_span("text-[#50a14f]", "dark:text-[#ce9178]", value)
}

fn number(value: String) -> Element(msg) {
  // One Light: #986801 (brown) | Dark Plus: #b5cea8 (light green)
  themed_span("text-[#986801]", "dark:text-[#b5cea8]", value)
}

fn comment(value: String) -> Element(msg) {
  // One Light: #a0a1a7 (gray) | Dark Plus: #6a9955 (green)
  html.span(
    [
      attribute.class("text-[#a0a1a7] dark:text-[#6a9955] italic"),
    ],
    [element.text(value)],
  )
}

fn function(value: String) -> Element(msg) {
  // One Light: #4078f2 (blue) | Dark Plus: #dcdcaa (yellow)
  themed_span("text-[#4078f2]", "dark:text-[#dcdcaa]", value)
}

fn operator(value: String) -> Element(msg) {
  // One Light: #0184bc (teal) | Dark Plus: #d4d4d4 (light gray)
  themed_span("text-[#0184bc]", "dark:text-[#d4d4d4]", value)
}

fn punctuation(value: String) -> Element(msg) {
  // One Light: #383a42 (dark gray) | Dark Plus: #d4d4d4 (light gray)
  themed_span("text-[#383a42]", "dark:text-[#d4d4d4]", value)
}

fn type_(value: String) -> Element(msg) {
  // One Light: #c18401 (golden) | Dark Plus: #4ec9b0 (teal)
  themed_span("text-[#c18401]", "dark:text-[#4ec9b0]", value)
}

fn module(value: String) -> Element(msg) {
  // One Light: #c18401 (golden) | Dark Plus: #4ec9b0 (teal)
  themed_span("text-[#c18401]", "dark:text-[#4ec9b0]", value)
}

fn variable(value: String) -> Element(msg) {
  // One Light: #e45649 (red) | Dark Plus: #9cdcfe (light blue)
  themed_span("text-[#e45649]", "dark:text-[#9cdcfe]", value)
}

fn constant(value: String) -> Element(msg) {
  // One Light: #986801 (brown) | Dark Plus: #4fc1ff (cyan)
  themed_span("text-[#986801]", "dark:text-[#4fc1ff]", value)
}

fn builtin(value: String) -> Element(msg) {
  // One Light: #c18401 (golden) | Dark Plus: #4ec9b0 (teal)
  themed_span("text-[#c18401]", "dark:text-[#4ec9b0]", value)
}

fn tag(value: String) -> Element(msg) {
  // One Light: #e45649 (red) | Dark Plus: #569cd6 (blue)
  themed_span("text-[#e45649]", "dark:text-[#569cd6]", value)
}

fn attribute(value: String) -> Element(msg) {
  // One Light: #986801 (brown) | Dark Plus: #9cdcfe (light blue)
  themed_span("text-[#986801]", "dark:text-[#9cdcfe]", value)
}

fn selector(value: String) -> Element(msg) {
  // One Light: #e45649 (red) | Dark Plus: #d7ba7d (gold)
  themed_span("text-[#e45649]", "dark:text-[#d7ba7d]", value)
}

fn property(value: String) -> Element(msg) {
  // One Light: #986801 (brown) | Dark Plus: #9cdcfe (light blue)
  themed_span("text-[#986801]", "dark:text-[#9cdcfe]", value)
}

fn regex(value: String) -> Element(msg) {
  // One Light: #50a14f (green) | Dark Plus: #d16969 (red)
  themed_span("text-[#50a14f]", "dark:text-[#d16969]", value)
}

fn custom(name: String, value: String) -> Element(msg) {
  case name {
    "important" ->
      html.span(
        [
          attribute.class("font-bold text-[#a626a4] dark:text-[#569cd6]"),
        ],
        [element.text(value)],
      )
    "bold" -> html.span([attribute.class("font-bold")], [element.text(value)])
    "italic" -> html.span([attribute.class("italic")], [element.text(value)])
    "strike" ->
      html.span([attribute.class("line-through")], [element.text(value)])
    "code" -> themed_span("text-[#50a14f]", "dark:text-[#ce9178]", value)
    "url" ->
      html.span(
        [
          attribute.class("underline text-[#0184bc] dark:text-[#4ec9b0]"),
        ],
        [element.text(value)],
      )
    _ -> element.text(value)
  }
}

fn themed_span(
  light_class: String,
  dark_class: String,
  value: String,
) -> Element(msg) {
  html.span([attribute.class(light_class <> " " <> dark_class)], [
    element.text(value),
  ])
}
