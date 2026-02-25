//// Styled heading components (h1 through h5) with consistent typography.

import blog/components
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

/// Render an h1 heading with optional anchor id.
pub fn h1(id: String, children: List(Element(msg))) -> Element(msg) {
  html.h1(
    [
      h_id(id),
      components.classes([
        "py-4",
        "text-2xl",
        "text-brand",
        "dark:text-white",
        "tracking-wide",
        "font-normal",
        "mt-0",
        "mb-2",
      ]),
    ],
    children,
  )
}

/// Render an h2 heading with optional anchor id.
pub fn h2(id: String, children: List(Element(msg))) -> Element(msg) {
  html.h2(
    [
      h_id(id),
      components.classes([
        "py-3",
        "text-xl",
        "text-brand",
        "dark:text-white",
        "tracking-wide",
        "font-normal",
        "mt-0",
        "mb-2",
      ]),
    ],
    children,
  )
}

/// Render an h3 heading with optional anchor id.
pub fn h3(id: String, children: List(Element(msg))) -> Element(msg) {
  html.h3(
    [
      h_id(id),
      components.classes([
        "py-2",
        "text-lg",
        "text-brand",
        "dark:text-white",
        "font-normal",
        "mt-0",
        "mb-2",
      ]),
    ],
    children,
  )
}

/// Render an h4 heading with optional anchor id.
pub fn h4(id: String, children: List(Element(msg))) -> Element(msg) {
  html.h4(
    [
      h_id(id),
      components.classes([
        "text-base",
        "text-brand",
        "dark:text-white",
        "font-normal",
        "mt-0",
        "mb-2",
      ]),
    ],
    children,
  )
}

/// Render an h5 heading with optional anchor id.
pub fn h5(id: String, children: List(Element(msg))) -> Element(msg) {
  html.h5(
    [
      h_id(id),
      components.classes([
        "text-base",
        "text-brand",
        "dark:text-white",
        "font-normal",
        "mt-0",
        "mb-2",
      ]),
    ],
    children,
  )
}

fn h_id(id: String) -> attribute.Attribute(msg) {
  case id {
    "" -> attribute.none()
    id -> attribute.id(id)
  }
}
