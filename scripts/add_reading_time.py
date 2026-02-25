#!/usr/bin/env python3
"""Add reading_time frontmatter field to all blog posts.

Calculates reading time based on 225 words per minute (matching the legacy
TypeScript implementation) and inserts a `reading_time` field into the YAML
frontmatter of each markdown file.
"""

import math
import pathlib
import re
import sys

WPM = 225
BLOG_DIR = pathlib.Path(__file__).resolve().parent.parent / "blog"
FRONTMATTER_RE = re.compile(r"^---\n(.*?\n)---\n", re.DOTALL)


def calculate_reading_time(body: str) -> int:
    words = len(body.split())
    return max(1, math.ceil(words / WPM))


def process_file(path: pathlib.Path) -> None:
    text = path.read_text(encoding="utf-8")

    match = FRONTMATTER_RE.match(text)
    if not match:
        print(f"  SKIP (no frontmatter): {path}")
        return

    frontmatter = match.group(1)
    body = text[match.end() :]
    minutes = calculate_reading_time(body)

    # Remove existing reading_time line if present
    frontmatter = re.sub(r"reading_time:.*\n", "", frontmatter)

    # Append reading_time before the closing ---
    new_frontmatter = frontmatter.rstrip("\n") + f"\nreading_time: '{minutes}'\n"
    new_text = f"---\n{new_frontmatter}---\n{body}"

    path.write_text(new_text, encoding="utf-8")
    print(f"  {path.name}: {minutes} min")


def main() -> None:
    if not BLOG_DIR.is_dir():
        print(f"Blog directory not found: {BLOG_DIR}", file=sys.stderr)
        sys.exit(1)

    for post_dir in sorted(BLOG_DIR.iterdir()):
        if not post_dir.is_dir():
            continue
        print(post_dir.name)
        for md_file in sorted(post_dir.glob("*.md")):
            process_file(md_file)


if __name__ == "__main__":
    main()
