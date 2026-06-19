//// GDPR-compliant privacy policy page.

import blog/components
import blog/components/heading
import blog/template/page
import blogatto/post
import gleam/dict
import gleam/option
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

/// VAT number of the data controller.
const author_vat = "IT03104140300"

/// Contact email for privacy-related requests.
const contact_email = "christian.visintin@veeso.dev"

/// Render the privacy policy page. The post list is unused but required to
/// match the route handler signature.
pub fn privacy(_posts: List(post.Post(Nil))) -> Element(Nil) {
  let config =
    page.PageConfig(
      title: "Privacy Policy - blog.veeso.dev",
      description: "How blog.veeso.dev handles your data: cookieless, privacy-first analytics with Umami, EU-hosted, and no tracking cookies.",
      url: "https://blog.veeso.dev/privacy/",
      featured_image: option.Some("https://blog.veeso.dev/og_preview.jpeg"),
    )

  page.page(config, [page_content()], element.none())
}

fn page_content() -> Element(Nil) {
  html.div([components.classes(["flex", "flex-col", "gap-2"])], [
    heading.h1(dict.new(), "", [element.text("Privacy Policy")]),
    last_updated(),
    overview(),
    data_controller(),
    cookies(),
    hosting(),
    analytics(),
    third_party_resources(),
    international_transfers(),
    your_rights(),
    external_links(),
    changes(),
  ])
}

fn last_updated() -> Element(msg) {
  html.p(
    [
      components.classes([
        "text-sm",
        "text-gray-500",
        "dark:text-gray-400",
        "mb-4",
      ]),
    ],
    [element.text("Last updated: 19 June 2026")],
  )
}

fn overview() -> Element(msg) {
  section("Overview", [
    paragraph([
      element.text(
        "This website is the personal blog blog.veeso.dev. I keep data collection to an absolute minimum: no tracking cookies, no advertising networks, and I never sell or share personal data. I do, however, process a limited amount of data that is technically unavoidable when you visit any website, such as your IP address and server logs handled by the hosting provider, together with anonymous, aggregated usage analytics. This policy explains what is processed, why, on what legal basis, and the rights you have under the EU General Data Protection Regulation (GDPR) and Italian data protection law (D.Lgs. 196/2003 as amended by D.Lgs. 101/2018).",
      ),
    ]),
  ])
}

fn data_controller() -> Element(msg) {
  section("Data controller and contact", [
    paragraph([
      element.text("The data controller is "),
      html.strong([], [element.text("veeso.dev di Christian Visintin")]),
      element.text(
        ", VAT no. "
        <> author_vat
        <> ". For any privacy-related question or to exercise your rights, you can reach out at ",
      ),
      mail_link(contact_email),
      element.text("."),
    ]),
  ])
}

fn cookies() -> Element(msg) {
  section("Cookies", [
    paragraph([
      element.text(
        "No cookies are used to track user behaviour on this website. No consent banner is shown because there is nothing to consent to: no profiling cookies, no third-party advertising cookies. The analytics provider is cookieless (see below), so no consent is required under the Italian Garante's guidelines on cookies and tracking tools.",
      ),
    ]),
    paragraph([
      element.text(
        "Your theme preference (light or dark mode) is stored locally in your browser via localStorage. This is a purely technical, functional setting; it never leaves your device and is not used to identify or track you.",
      ),
    ]),
  ])
}

fn hosting() -> Element(msg) {
  section("Hosting and server logs", [
    paragraph([
      element.text(
        "This website is hosted by Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA), which acts as a data processor on my behalf. As with any web server, Vercel automatically processes technical data needed to deliver the site and keep it secure: your IP address, browser user-agent, requested URLs, referrer, and timestamps, recorded in server logs.",
      ),
    ]),
    paragraph([
      html.strong([], [element.text("Legal basis: ")]),
      element.text(
        "my legitimate interest (Art. 6(1)(f) GDPR) in operating the website, ensuring its security, and preventing abuse. These logs are kept only for as long as necessary for those purposes (typically up to 30 days) and are not used to profile you or build advertising audiences.",
      ),
    ]),
  ])
}

fn analytics() -> Element(msg) {
  section("Analytics with Umami", [
    paragraph([
      element.text(
        "Umami is used to collect anonymous usage data, so I can understand how visitors use the website and improve its design and functionality. This blog uses the EU-hosted Umami Cloud service (cloud.umami.is), where analytics data is stored on servers located in the European Union (Germany). The service is operated by Umami Software, Inc.",
      ),
    ]),
    paragraph([
      element.text(
        "Umami is cookieless and privacy-focused: it does not set cookies and does not store your IP address or any data that can directly identify you. It derives only aggregated, anonymous metrics, such as country, browser, and page views. None of these metrics contain personal data.",
      ),
    ]),
    paragraph([
      html.strong([], [element.text("Legal basis: ")]),
      element.text(
        "my legitimate interest (Art. 6(1)(f) GDPR) in measuring and improving the website. Because the data is anonymous and no cookies or device identifiers are used, no consent is required.",
      ),
    ]),
  ])
}

fn third_party_resources() -> Element(msg) {
  section("Third-party resources", [
    paragraph([
      element.text(
        "To render correctly, this website loads a small number of static resources from third-party content delivery networks: web fonts from Google Fonts (Google Ireland Limited / Google LLC), and JavaScript libraries from jsDelivr. When your browser fetches these resources, the provider necessarily receives your IP address and user-agent. No cookies are set by these requests and the data is not used to profile you.",
      ),
    ]),
    paragraph([
      html.strong([], [element.text("Legal basis: ")]),
      element.text(
        "my legitimate interest (Art. 6(1)(f) GDPR) in delivering the website with consistent typography and functionality.",
      ),
    ]),
  ])
}

fn international_transfers() -> Element(msg) {
  section("International data transfers", [
    paragraph([
      element.text(
        "Analytics data is stored within the European Union. Some providers are US-based companies (Vercel Inc., Umami Software, Inc., Google LLC, and the jsDelivr network), so limited technical data may be processed outside the European Economic Area. Where this happens, transfers are protected by appropriate safeguards under Chapter V GDPR, namely the EU-US Data Privacy Framework and/or the European Commission's Standard Contractual Clauses, together with the relevant data processing agreements.",
      ),
    ]),
  ])
}

fn your_rights() -> Element(msg) {
  section("Your rights", [
    paragraph([
      element.text(
        "Under the GDPR you have the right to access your personal data, and to request its rectification, erasure, or restriction, as well as the right to object to processing and the right to data portability. Note that the analytics data held is anonymous and cannot be linked back to you, so for that data I may be unable to identify you in order to act on a request.",
      ),
    ]),
    paragraph([
      element.text("To exercise any right, contact me at "),
      mail_link(contact_email),
      element.text(
        ". You also have the right to lodge a complaint with the Italian supervisory authority, the ",
      ),
      external_link(
        "https://www.garanteprivacy.it",
        "Garante per la protezione dei dati personali",
      ),
      element.text(
        ", or with the data protection authority of your country of residence.",
      ),
    ]),
  ])
}

fn external_links() -> Element(msg) {
  section("External links", [
    paragraph([
      element.text(
        "This website links to external services such as GitHub, Mastodon, and X. Once you leave this site, the privacy policy of the destination service applies. I am not responsible for the content or privacy practices of external websites.",
      ),
    ]),
  ])
}

fn changes() -> Element(msg) {
  section("Changes to this policy", [
    paragraph([
      element.text(
        "This privacy policy may be updated from time to time. Any changes will be published on this page with an updated \"Last updated\" date.",
      ),
    ]),
  ])
}

/// Render a titled section with a heading followed by its body elements.
fn section(title: String, body: List(Element(msg))) -> Element(msg) {
  html.section([components.classes(["mb-4"])], [
    heading.h2(dict.new(), "", [element.text(title)]),
    ..body
  ])
}

/// Render a justified body paragraph.
fn paragraph(children: List(Element(msg))) -> Element(msg) {
  html.p(
    [
      components.classes([
        "mb-3",
        "text-brand",
        "dark:text-gray-200",
        "text-justify",
      ]),
    ],
    children,
  )
}

/// Render a mailto link.
fn mail_link(email: String) -> Element(msg) {
  html.a(
    [
      attribute.href("mailto:" <> email),
      components.classes([
        "text-brand",
        "dark:text-white",
        "underline",
        "font-medium",
      ]),
    ],
    [element.text(email)],
  )
}

/// Render an external link that opens in a new tab.
fn external_link(href: String, label: String) -> Element(msg) {
  html.a(
    [
      attribute.href(href),
      attribute.target("_blank"),
      attribute.rel("noopener noreferrer"),
      components.classes([
        "text-brand",
        "dark:text-white",
        "underline",
        "font-medium",
      ]),
    ],
    [element.text(label)],
  )
}
