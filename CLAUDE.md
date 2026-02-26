# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal blog (blog.veeso.dev) built with **Gleam**, **Lustre**, and **Blogatto**. It's a static site generator that compiles to Erlang/OTP and deploys to Vercel. Previously built with Gatsby.

## Commands

```sh
gleam run                # Build the static site into ./dist
gleam test               # Run tests (gleeunit)
gleam format             # Format code
gleam format --check src test  # Check formatting (used in CI)
gleam deps download      # Install dependencies
just dev                 # Start dev server on port 3000 with live reload (runs gleam run -m blog/dev)
```

## Architecture

**Build pipeline** (`src/blog.gleam`): Installs Tailwind CSS -> builds site via Blogatto -> compiles Tailwind CSS. Output goes to `./dist`.

**Configuration** (`src/blog/config.gleam`): Defines Blogatto config - markdown source dir (`./blog`), output dir (`./dist`), static files (`./static`), RSS feed, sitemap, robots.txt, and route definitions.

**Template hierarchy**:
- `template/page.gleam` - Root HTML wrapper with `<head>` (SEO meta tags, dark mode script, CDN resources) and `<body>` (topbar + content + footer)
- `template/blog.gleam` - Blog post template: featured image, title, metadata, article body, share buttons, related posts (filtered by `category` extra field, takes first 2 matches)
- `template/topbar.gleam` / `template/footer.gleam` - Site chrome

**Pages** (`pages/`):
- `home.gleam` - Homepage with author bio and latest 4 posts, mounted at `/`
- `blog.gleam` - Blog listing with all posts in a 2-column grid, mounted at `/blog/`

**Components** (`components/`):
- `container.gleam` - Flexbox layout primitives (`row`, `col`, `responsive_row`)
- `md_components.gleam` - Custom markdown renderers (links open in new tab, Prism.js code blocks, styled blockquotes)
- `post_preview.gleam` / `post_meta.gleam` - Post card and metadata display
- `svg.gleam` - Social media and feather icon components
- `components.gleam` - `classes()` helper for Lustre class attribute composition

**Dev server** (`dev.gleam`): Uses Blogatto's dev module with live reload on port 3000.

## Content

Blog posts live in `blog/<post-name>/index-en.md` with YAML frontmatter:

```yaml
---
date: '2024-01-31 12:40:00'
slug: 'post-slug-name'
title: 'Post Title'
description: 'Short tagline'
author: 'veeso'
featured_image: featured.jpeg   # Optional, relative to post dir or absolute URL
category: category-name          # Used for related posts
reading_time: '13'               # Minutes
---
```

Featured images resolve to `/blog/en/{slug}/{path}` for relative paths. Posts are routed under `/blog/en/{slug}/`.

## Styling

- **Tailwind CSS 4.2.1** configured via `assets/blog.css` with CSS custom properties
- **Dark mode**: System preference detection + localStorage toggle, class-based (`dark:` prefix)
- **Responsive**: Custom `sm` breakpoint (max 640px) - uses `sm:` prefix for mobile styles (note: this is inverted from default Tailwind - `sm:` means small screens, not "small and up")
- **Font**: Sora (Google Fonts)
- **Code highlighting**: Prism.js with autoloader, One Light (light) / VS Code Dark Plus (dark) themes

## Tech Stack Versions

- Gleam >= 1.14.0, Erlang/OTP >= 28
- Key deps: blogatto >= 2.0.0, lustre >= 5.6.0, glailglind >= 2.2.0 (Tailwind installer)

## Deployment

GitHub Actions CI: `test.yml` runs tests + format check; `deploy.yml` builds and deploys to Vercel (production on main push, preview on PRs).
