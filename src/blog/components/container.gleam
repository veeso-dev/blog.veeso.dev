//// Flexbox layout container components (row, column, responsive row).

import blog/components
import gleam/list
import lustre/element.{type Element}
import lustre/element/html

/// A flex row
pub fn row(classes: List(String), children: List(Element(msg))) -> Element(msg) {
  let classes = list.append(["flex", "flex-row"], classes)
  html.div(
    [
      components.classes(classes),
    ],
    children,
  )
}

/// A flex column
pub fn col(classes: List(String), children: List(Element(msg))) -> Element(msg) {
  let classes = list.append(["flex", "flex-col"], classes)
  html.div(
    [
      components.classes(classes),
    ],
    children,
  )
}

/// A flex row that becomes a column on smaller screens
pub fn responsive_row(
  classes: List(String),
  children: List(Element(msg)),
) -> Element(msg) {
  let classes = list.append(["flex", "flex-row", "sm:flex-col"], classes)
  html.div(
    [
      components.classes(classes),
    ],
    children,
  )
}
