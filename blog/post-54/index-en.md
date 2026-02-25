---
date: '2026-02-25 18:00:00'
slug: 'this-blog-was-made-with-gleam'
title: 'This Blog was made with Gleam'
description: 'Goodbye Gatsby, Hello Gleam! This blog is now powered by Gleam, Lustre, and Blogatto'
author: 'veeso'
featured_image: featured.jpeg
tag: gleam
reading_time: '7'
---

If you are reading this, you are looking at a blog that runs **zero React, zero GraphQL, and zero Node.js**. This blog is now entirely powered by Gleam, Lustre, and a little static site generator I built called Blogatto.

Let me tell you why.

## Why Gleam?

Recently, I decided to approach the Gleam language, and I just fell in love with it.

I already had some experience with BEAM functional languages. I played with Elixir a few years ago, and while I appreciated the power of the BEAM, I never felt the same confidence I feel when writing Rust. Elixir has a lot of magic behind the scenes — implicit behaviours, macro-heavy libraries, and a type system that doesn’t really stop you from doing dumb things. I’ve always loved Rust because it lets me write code **knowing it works**; Elixir never gave me that feeling.

Gleam is different. It took the best parts of the BEAM ecosystem and combined them with design choices borrowed from Rust: a strong static type system, exhaustive pattern matching, no exceptions, no `nil`, and compiler errors that actually help you fix the problem. It even has a built-in formatter and a `gleam.toml` manifest that feels right at home if you’re used to `Cargo.toml`.

So you get everything I love about Rust — confidence, explicitness, great tooling — plus everything I love about functional languages. Nothing beats piping data through a chain of pure functions, and Gleam makes that the default way to write code.

## What does Gleam have to do with frontend development?

You may ask yourself: how can Gleam, a language that compiles to Erlang, be used for frontend development? Well, Gleam has a dual compilation target: it can compile to **Erlang** (for the BEAM) or to **JavaScript** (for the browser and Node.js). This is what makes it interesting for the web.

There is a framework called [Lustre](https://github.com/lustre-labs/lustre) that takes full advantage of this. Lustre is a UI framework for Gleam inspired by [Elm](https://elm-lang.org/) — same unidirectional data flow, same single source of truth, same "if it compiles, it works" philosophy. But unlike Elm, Lustre can also render static HTML server-side on the BEAM, which is perfect for a static site generator.

And honestly, I prefer Gleam to Elm. Gleam has a more familiar syntax (especially if you come from Rust), a healthier ecosystem, and — let’s be real — [Elm is not really maintained anymore](https://isiselmdeadyetdeadyet.com). Lustre fills that gap beautifully.

## But Lustre was not enough for me

Building a blog is not just about rendering HTML. You need to parse Markdown with frontmatter, generate an RSS feed, build a sitemap, manage routing, copy static assets, and handle all the boring stuff nobody wants to think about. Lustre doesn’t do any of that — it’s a UI framework, not a site generator.

So I built one: [Blogatto](https://blogat.to).

Blogatto is a static site generator built on top of Lustre. You give it a configuration — where to find your Markdown files, how to render your pages, your RSS feed metadata, your sitemap and robots settings — and it takes care of the rest. Parse the markdown, render the HTML, build the feed, generate the sitemap, copy your assets to the output folder. Done.

Here’s what the actual configuration for this blog looks like:

```gleam
pub fn main() {
  let md =
    markdown.default()
    |> markdown.markdown_path("./blog")
    |> markdown.route_prefix("blog")
    |> markdown.template(blog_template.template)
    |> markdown.components(md_components.components())

  let rss =
    feed.new(
      "veeso.dev",
      "https://blog.veeso.dev",
      "A blog about Rust, Gleam, and open source software development",
    )
    |> feed.language("en-us")
    |> feed.output("/rss/en.xml")

  let cfg =
    config.new("https://blog.veeso.dev")
    |> config.output_dir("./dist")
    |> config.static_dir("./static")
    |> config.markdown(md)
    |> config.feed(rss)
    |> config.sitemap(sitemap.new("/sitemap.xml"))
    |> config.route("/", home.home)
    |> config.route("/blog/", blog.blog)
    |> config.robots(robots.RobotsConfig(
      sitemap_url: "https://blog.veeso.dev/sitemap.xml",
      robots: [
        robots.Robot(
          user_agent: "*",
          allowed_routes: ["/"],
          disallowed_routes: [],
        ),
      ],
    ))

  case blogatto.build(cfg) {
    Ok(_) -> io.println("Blog built successfully!")
    Error(e) ->
      panic as { "Failed to build blog: " <> blogatto_error.describe_error(e) }
  }
}
```

That’s it. No GraphQL queries, no plugin chains, no `gatsby-node.ts` sorcery. Just a Gleam function that pipes configuration through builders, and you have a blog.

In implementing Blogatto, I really had Gatsby in mind. I wanted the same capabilities — Markdown rendering, RSS, sitemap, custom components — **without the complexity of setting it up**. Because while I think Gatsby is powerful, it’s just a nightmare to configure, and having to understand its GraphQL data layer, the plugin system, and the implicit page creation is way more friction than building a simple blog should require.

I’m not saying Blogatto has all the features of Gatsby, but it has the ones 95% of people need to build a blog, and the entire configuration fits in a single, readable file.

## Custom markdown components

One thing I really wanted to keep from my Gatsby setup was custom rendering for Markdown elements. In Gatsby, I used MDX components. In Blogatto, I built a similar system (exposed by [Maud](https://github.com/veeso/maud)) where you can override how any Markdown element is rendered.

For example, here’s how I customize links to open in new tabs and code blocks to have a copy button:

```gleam
pub fn components() -> markdown.Components(msg) {
  markdown.Components(
    ..markdown.default_components(),
    a: a,
    blockquote: blockquote,
    code: code,
    h1: heading.h1,
    h2: heading.h2,
    pre: pre,
    // ... and so on
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
      attribute.target("_blank"),
      components.classes([
        "font-medium", "text-brand", "underline", "hover:no-underline",
      ]),
    ],
    children,
  )
}
```

The `..markdown.default_components()` spread syntax is Gleam’s way of saying "start with the defaults and override just the ones I care about". Clean, explicit, and no magic.

## Migrating from Gatsby to Blogatto

The actual migration was surprisingly smooth. Here’s what it took:

1. **Markdown files**: left almost unchanged. I only had to rename some frontmatter fields (`subtitle` became `description`, `featuredImage` became `featured_image`). The actual content? Untouched.

2. **React components to Lustre**: I reimplemented the few components I had — headings, post previews, share buttons, the blog template — from React/JSX to Lustre’s `html` module. Since Lustre’s API is just function calls that return elements, it felt more natural than JSX ever did.

3. **Pages and routing**: In Gatsby, pages are created through a mix of file conventions and `createPage` calls in `gatsby-node.ts`. In Blogatto, you just register routes with `config.route("/", home.home)`. That’s it.

4. **Styling**: I kept Tailwind CSS, but moved from the old Tailwind v3 setup with PostCSS to a simpler setup using the `gleam_tailwind` package that downloads and runs the standalone Tailwind CLI.

The whole blog — 14 Gleam files, around 1,500 lines total — replaced a Gatsby setup that had 138+ files including React components, TypeScript utilities, GraphQL queries, and a `yarn.lock` that was 13,000 lines long.

**Have you ever seen a `yarn.lock` that is 13,000 lines long for a blog?** That should tell you everything about why I switched.

## What I gained

- **Build confidence**: if it compiles, the blog renders. Gleam’s type system catches broken links, missing fields, wrong component signatures — at compile time.
- **Simplicity**: `gleam run` builds the entire site. No webpack, no Babel, no plugin compatibility nightmares.
- **Speed**: the build runs on the BEAM, which handles the Markdown parsing and HTML generation efficiently. Tailwind runs as a single binary post-build step.
- **Control**: I know exactly what every line of code does. There are no implicit plugins, no data layers, no framework magic.

## What I lost

I want to be honest here: the migration wasn’t all roses.

- **Ecosystem maturity**: Gleam’s web ecosystem is still young. Don’t expect the same breadth of plugins and integrations you get with Gatsby or Next.js. If you need something, you’ll likely build it yourself. That is also nice though, since you really can become part of the ecosystem by contributing your own tools.
- **Image optimization**: Gatsby has excellent image processing built-in (gatsby-image is genuinely great). Blogatto doesn’t do that yet, so I handle images manually.
- **Hot reload**: Gatsby’s dev server with hot module replacement is very convenient. With Blogatto, I rebuild and refresh. Not a dealbreaker, but worth mentioning. I'm going to implement a dev server soon though, so stay tuned!

Would I recommend this path to someone who just wants a blog up and running quickly? If you enjoy Gleam, absolutely!

## Final thoughts

This migration was really a love letter to Gleam. I took a framework I was frustrated with (Gatsby) and replaced it with something I built myself in a language that makes me genuinely happy to write code.

The blog you’re reading right now is the result: **53 posts, zero JavaScript frameworks, one `gleam run` command**.

If you want to check out Blogatto, you can find it at [blogat.to](https://blogat.to). And if you want to see the source code of this blog, it’s on [GitHub](https://github.com/veeso/blog.veeso.dev).
