//// Site topbar with logo, navigation links, theme toggle, and social icons.

import blog/components
import blog/components/container
import blog/components/svg
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

const github_url = "https://github.com/veeso"

const mastodon_url = "https://hachyderm.io/@veeso_dev"

const linkedin_url = "https://www.linkedin.com/in/christian-visintin/"

const rss_url = "/rss/en.xml"

const about_url = "https://www.veeso.me/"

/// Render the site topbar with logo, navigation, and social links.
pub fn topbar() -> Element(msg) {
  html.header([], [topbar_body()])
}

fn topbar_body() -> Element(msg) {
  container.col(["items-start", "justify-between", "w-full", "top-0"], [
    logo_section(),
    nav_section(),
  ])
}

/// Logo, site title, and subtitle.
fn logo_section() -> Element(msg) {
  html.div([components.classes(["flex", "gap-4", "items-center", "pb-4"])], [
    html.div([], [
      html.a(
        [
          attribute.href("/"),
          components.classes(["text-brand", "no-underline"]),
        ],
        [
          html.img([
            attribute.src("/logo.webp"),
            attribute.alt("logo"),
            attribute.width(64),
            attribute.height(64),
            attribute.attribute("loading", "eager"),
          ]),
        ],
      ),
    ]),
    container.col([], [
      html.a(
        [
          attribute.href("/"),
          components.classes([
            "text-xl", "text-brand", "dark:text-gray-200", "no-underline",
            "text-left", "sm:text-xl",
          ]),
        ],
        [element.text("veeso_dev")],
      ),
      html.span(
        [
          components.classes([
            "block", "text-sm", "text-gray-500", "dark:text-gray-300",
          ]),
        ],
        [element.text("Christian Visintin")],
      ),
    ]),
  ])
}

/// Navigation links and controls row.
fn nav_section() -> Element(msg) {
  container.responsive_row(
    ["items-center", "justify-between", "w-full", "sm:items-start", "sm:gap-4"],
    [nav_links(), controls()],
  )
}

/// Blog and About navigation links.
fn nav_links() -> Element(msg) {
  html.nav([components.classes(["flex", "gap-4"])], [
    html.a([attribute.href("/blog/"), nav_link_classes()], [
      element.text("Blog"),
    ]),
    html.a(
      [
        attribute.href(about_url),
        attribute.target("_blank"),
        nav_link_classes(),
      ],
      [element.text("About")],
    ),
  ])
}

/// Theme toggle and social links.
fn controls() -> Element(msg) {
  html.div(
    [
      components.classes([
        "flex", "justify-self-end", "items-end", "justify-between",
      ]),
    ],
    [
      html.div(
        [
          components.classes([
            "flex", "items-center", "justify-between", "gap-8",
          ]),
        ],
        [theme_toggle(), socials()],
      ),
    ],
  )
}

/// Theme toggle button that switches between light and dark mode.
fn theme_toggle() -> Element(msg) {
  html.button(
    [
      attribute.id("theme-toggle"),
      attribute.attribute("onclick", theme_toggle_js),
      attribute.attribute("aria-label", "Toggle dark mode"),
      icon_link_classes(),
    ],
    [
      // Sun icon (visible in light mode, hidden in dark mode)
      html.span(
        [attribute.id("theme-icon-sun"), components.classes(["dark:hidden"])],
        [svg.feather_icon("sun")],
      ),
      // Moon icon (hidden in light mode, visible in dark mode)
      html.span(
        [
          attribute.id("theme-icon-moon"),
          components.classes(["hidden", "dark:inline"]),
        ],
        [svg.feather_icon("moon")],
      ),
    ],
  )
}

/// Social media icon links.
fn socials() -> Element(msg) {
  element.fragment([
    icon_link(github_url, svg.feather_icon("github")),
    icon_link(mastodon_url, svg.mastodon(24)),
    icon_link(linkedin_url, svg.feather_icon("linkedin")),
    icon_link(rss_url, svg.feather_icon("rss")),
  ])
}

/// A link styled for icon display.
fn icon_link(href: String, icon: Element(msg)) -> Element(msg) {
  html.a(
    [attribute.href(href), attribute.target("_blank"), icon_link_classes()],
    [icon],
  )
}

fn nav_link_classes() -> attribute.Attribute(msg) {
  components.classes([
    "text-gray-500", "dark:text-gray-200", "no-underline", "text-xl",
    "transition-colors", "duration-500", "hover:text-brand", "hover:underline",
    "cursor-pointer",
  ])
}

fn icon_link_classes() -> attribute.Attribute(msg) {
  components.classes([
    "inline-flex", "items-center", "cursor-pointer", "text-brand",
    "dark:text-white",
  ])
}

const theme_toggle_js = "(function(){var d=document.documentElement;var isDark=d.classList.contains('dark');if(isDark){d.classList.remove('dark');localStorage.setItem('theme','light');var l=document.getElementById('prism-light');var k=document.getElementById('prism-dark');if(l)l.disabled=false;if(k)k.disabled=true}else{d.classList.add('dark');localStorage.setItem('theme','dark');var l=document.getElementById('prism-light');var k=document.getElementById('prism-dark');if(l)l.disabled=true;if(k)k.disabled=false}feather.replace()})()"
