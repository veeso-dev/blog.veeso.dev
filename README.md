# blog.veeso.dev

My personal blog built with [Gleam](https://gleam.run/) and [Lustre](https://lustre.dev/), powered by [Blogatto](https://github.com/veeso/blogatto).

Previously built with Gatsby, now migrated to a fully static site generated with Gleam/OTP.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| [Gleam](https://gleam.run/) | Programming language (compiles to Erlang/OTP) |
| [Lustre](https://lustre.dev/) | UI component framework |
| [Blogatto](https://github.com/veeso/blogatto) | Blog engine / static site generator |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Vercel](https://vercel.com/) | Hosting |

## Project Structure

```txt
blog.veeso.dev/
├── src/blog/                # Gleam source code
│   ├── blog.gleam           # Entry point & Blogatto configuration
│   ├── components/          # Reusable UI components
│   ├── pages/               # Homepage and blog listing pages
│   └── template/            # Page template, topbar, footer
├── blog/                    # Markdown posts (with frontmatter)
├── assets/                  # CSS source (Tailwind input)
├── static/                  # Static files (favicon, avatar, OG image)
└── dist/                    # Generated output (after build)
```

## Development

### Prerequisites

- [Gleam](https://gleam.run/) >= 1.14.0
- [Erlang/OTP](https://www.erlang.org/) >= 28
- [Docker](https://www.docker.com/) (for local preview)
- [just](https://github.com/casey/just) (optional task runner)

### Commands

```sh
gleam run       # Build the static site into ./dist
gleam test      # Run tests
gleam format    # Format code
just dev        # Build + start local Nginx server on port 3000
```

## Deployment

The site is deployed to Vercel via GitHub Actions:

- **Push to `main`**: production deployment
- **Pull requests**: preview deployment

## License

- Code: [MIT](https://opensource.org/licenses/MIT)
- Content: [CC-BY-NC-ND-4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/)

## Resources

- [A Blog in Gleam](https://gearsco.de/blog/blog-in-gleam/)
- [blogatto](https://github.com/veeso/blogatto): A blog engine in Gleam
- [glailglind](https://hexdocs.pm/glailglind/): Tailwind CSS installer for Gleam
- [webls](https://hexdocs.pm/webls/): Sitemaps, robots and RSS feed for Websites
