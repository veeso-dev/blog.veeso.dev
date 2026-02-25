//// Full HTML page template with SEO meta tags, theme support, and layout.

import blog/components
import blog/components/container
import blog/template/footer
import blog/template/topbar
import gleam/option.{type Option}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

const site_name = "veeso.dev"

const twitter_handle = "@veeso_dev"

const fediverse_creator = "@veeso_dev@hachyderm.io"

const umami_website_id = "35191136-8fde-4daf-9973-d645371de67d"

/// Configuration for rendering a page.
pub type PageConfig {
  PageConfig(
    /// Page title shown in the browser tab and meta tags.
    title: String,
    /// Page description for SEO meta tags.
    description: String,
    /// Canonical URL for this page.
    url: String,
    /// Optional featured image URL for OG/Twitter card tags.
    featured_image: Option(String),
  )
}

/// Render a full HTML page with the given configuration and body children.
pub fn page(config: PageConfig, children: List(Element(msg))) -> Element(msg) {
  html.html([attribute.lang("en")], [head(config), body(children)])
}

fn head(config: PageConfig) -> Element(msg) {
  html.head([], [
    // Charset and viewport
    html.meta([attribute.charset("UTF-8")]),
    html.meta([
      attribute.name("viewport"),
      attribute.content("width=device-width, initial-scale=1.0"),
    ]),
    // Title and description
    html.title([], config.title),
    html.meta([
      attribute.name("description"),
      attribute.content(config.description),
    ]),
    // Canonical URL
    html.link([
      attribute.rel("canonical"),
      attribute.href(config.url),
    ]),
    // Open Graph
    og_meta("og:title", config.title),
    og_meta("og:description", config.description),
    og_meta("og:type", "article"),
    og_meta("og:url", config.url),
    og_meta("og:site_name", site_name),
    og_meta("og:locale", "en_US"),
    // Twitter card
    html.meta([
      attribute.name("twitter:creator"),
      attribute.content(twitter_handle),
    ]),
    html.meta([
      attribute.name("twitter:title"),
      attribute.content(config.title),
    ]),
    html.meta([
      attribute.name("twitter:description"),
      attribute.content(config.description),
    ]),
    // Fediverse
    html.meta([
      attribute.name("fediverse:creator"),
      attribute.content(fediverse_creator),
    ]),
    // Featured image (OG image + twitter large card + preload)
    featured_image_meta(config.featured_image),
    // Favicons
    html.link([
      attribute.rel("icon"),
      attribute.type_("image/x-icon"),
      attribute.href("/favicon.ico"),
    ]),
    html.link([
      attribute.rel("icon"),
      attribute.type_("image/png"),
      attribute.attribute("sizes", "16x16"),
      attribute.href("/favicon-16x16.png"),
    ]),
    html.link([
      attribute.rel("icon"),
      attribute.type_("image/png"),
      attribute.attribute("sizes", "32x32"),
      attribute.href("/favicon-32x32.png"),
    ]),
    html.link([
      attribute.rel("icon"),
      attribute.type_("image/png"),
      attribute.attribute("sizes", "96x96"),
      attribute.href("/favicon-96x96.png"),
    ]),
    // Google Fonts (Sora)
    html.link([
      attribute.rel("preconnect"),
      attribute.href("https://fonts.googleapis.com"),
    ]),
    html.link([
      attribute.rel("preconnect"),
      attribute.href("https://fonts.gstatic.com"),
      attribute.attribute("crossorigin", ""),
    ]),
    html.link([
      attribute.rel("stylesheet"),
      attribute.href(
        "https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap",
      ),
    ]),
    // Tailwind CSS
    html.link([
      attribute.rel("stylesheet"),
      attribute.href("/blog.css"),
    ]),
    // Prism.js themes (light: One Light, dark: VS Code Dark Plus)
    html.link([
      attribute.id("prism-light"),
      attribute.rel("stylesheet"),
      attribute.href(
        "https://cdn.jsdelivr.net/npm/prism-themes/themes/prism-one-light.css",
      ),
    ]),
    html.link([
      attribute.id("prism-dark"),
      attribute.rel("stylesheet"),
      attribute.href(
        "https://cdn.jsdelivr.net/npm/prism-themes/themes/prism-vsc-dark-plus.css",
      ),
      attribute.disabled(True),
    ]),
    // Umami analytics
    html.script(
      [
        attribute.attribute("defer", ""),
        attribute.src("https://cloud.umami.is/script.js"),
        attribute.attribute("data-website-id", umami_website_id),
        attribute.attribute("data-do-not-track", "true"),
        attribute.attribute("data-auto-track", "true"),
      ],
      "",
    ),
    // Dark mode detection (inline, runs before render to prevent FOUC)
    html.script([], dark_mode_js),
  ])
}

fn body(children: List(Element(msg))) -> Element(msg) {
  html.body([], [
    html.div([], [
      container.col(
        [
          "bg-page",
          "dark:bg-zinc-900",
          "items-center",
          "justify-center",
          "pt-4",
          "pb-12",
          "sm:pt-0",
        ],
        [
          container.col(
            [
              "items-center",
              "bg-white",
              "dark:bg-brand",
              "text-brand",
              "dark:text-white",
              "rounded",
              "shadow-xl",
              "dark:shadow-none",
              "justify-center",
              "w-fit",
              "sm:w-full",
              "sm:rounded-none",
            ],
            [
              html.div(
                [
                  components.classes([
                    "m-4",
                    "max-w-screen-md",
                    "w-auto",
                    "sm:max-w-full",
                    "p-2",
                  ]),
                ],
                [topbar.topbar(), html.main([], children)],
              ),
            ],
          ),
        ],
      ),
    ]),
    body_scripts(),
    footer.footer(),
  ])
}

fn featured_image_meta(image: Option(String)) -> Element(msg) {
  case image {
    option.Some(url) ->
      element.fragment([
        og_meta("og:image", url),
        html.meta([
          attribute.name("twitter:card"),
          attribute.content("summary_large_image"),
        ]),
        html.link([
          attribute.rel("preload"),
          attribute.as_("image"),
          attribute.href(url),
        ]),
      ])
    option.None ->
      html.meta([
        attribute.name("twitter:card"),
        attribute.content("summary"),
      ])
  }
}

fn body_scripts() -> Element(msg) {
  element.fragment([
    // Feather icons
    html.script(
      [
        attribute.src(
          "https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js",
        ),
      ],
      "",
    ),
    // Prism.js core
    html.script(
      [
        attribute.src("https://cdn.jsdelivr.net/npm/prismjs@1/prism.min.js"),
      ],
      "",
    ),
    // Prism.js autoloader (loads language grammars on demand)
    html.script(
      [
        attribute.src(
          "https://cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js",
        ),
      ],
      "",
    ),
    // Initialize feather icons after scripts load
    html.script([], "feather.replace()"),
  ])
}

fn og_meta(property: String, content: String) -> Element(msg) {
  html.meta([
    attribute.attribute("property", property),
    attribute.content(content),
  ])
}

const dark_mode_js = "(function(){var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d){document.documentElement.classList.add('dark');var l=document.getElementById('prism-light');var k=document.getElementById('prism-dark');if(l)l.disabled=true;if(k)k.disabled=false}})()"
