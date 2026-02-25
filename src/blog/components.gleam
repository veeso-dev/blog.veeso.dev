//// Shared utility functions for building HTML attributes.

import gleam/list
import lustre/attribute

/// A utility which converts a list of strings into a `class` attribute.
pub fn classes(classes: List(String)) -> attribute.Attribute(msg) {
  classes
  |> list.map(fn(class) { #(class, True) })
  |> attribute.classes
}
