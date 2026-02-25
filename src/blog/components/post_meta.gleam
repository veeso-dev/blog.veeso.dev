//// Shared post metadata components used by post previews and blog templates.

import blogatto/post
import gleam/dict
import gleam/int
import gleam/result
import gleam/time/calendar
import gleam/time/duration
import gleam/time/timestamp
import lustre/element.{type Element}

/// Render a post's date as a formatted text element (e.g. "January 05, 2025").
pub fn formatted_date(date: timestamp.Timestamp) -> Element(msg) {
  let #(date, _time) = timestamp.to_calendar(date, duration.hours(1))

  let month = calendar.month_to_string(date.month)
  let day = case date.day {
    day if day < 10 -> "0" <> int.to_string(day)
    day -> int.to_string(day)
  }
  let year = int.to_string(date.year)

  { month <> " " <> day <> ", " <> year }
  |> element.text
}

/// Render a post's estimated reading time as a text element (e.g. "5 min read").
pub fn reading_time(post: post.Post(msg)) -> Element(msg) {
  let minutes =
    post.extras
    |> dict.get("reading_time")
    |> result.try(int.parse)
    |> result.unwrap(or: 1)

  { int.to_string(minutes) <> " min read" }
  |> element.text
}
