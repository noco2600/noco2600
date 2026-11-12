# NoCo 2600 Website (`noco2600-org`)

The official public website and community blog for **NoCo 2600** (Northern Colorado Security Community).

* **Live Site**: [https://noco2600.org](https://noco2600.org)
* **Archive**: [https://noco2600.org/cold-storage/](https://noco2600.org/cold-storage/)
* **Discord**: [Join our Discord](https://discord.com/invite/ApgRfP2DHe)

---

## Domains & Redirection

* **Primary Domain**: `noco2600.org` is the canonical domain set in the repository's `CNAME` file and served by GitHub Pages.
* **`noco2600.com` Forwarding**: GitHub Pages only binds a single custom domain per repository. Incoming traffic to `noco2600.com` and `www.noco2600.com` is redirected to `https://noco2600.org/` via an **HTTP 301 redirect configured at the DNS / domain registrar level**.

---

## Architecture & Tech Stack

* **Static Site Generator**: [Eleventy 3 (11ty)](https://www.11ty.dev/) with Liquid template engine.
* **Styles**: Dart Sass (`sass`) compiled to `/assets/css/main.css` using modern `@use`/`@forward` modules.
* **Hosting**: GitHub Pages, built automatically via GitHub Actions.
* **Feeds & SEO**: Atom feed at `/feed.xml`, OpenGraph tags, and [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) compliant `/.well-known/security.txt`.

---

## Content Organization

1. **Current Content (`_posts/`)**:
   * Holds current announcements, meeting notes, spotlights, and security news.
   * Paginated on the home page (`/`) and published to the Atom feed (`/feed.xml`).
2. **Cold Storage (`_cold-storage/`)**:
   * Frozen archive of 76 historical posts (2012–2022) imported from the legacy WordPress site.
   * Rendered with a late-90s personal homepage / hacker aesthetic, isolated under `body.cold-storage`.
   * Preserves backward compatibility: `cold-storage-redirects.html` writes client redirect stubs at old WordPress URLs (e.g. `/YYYY/MM/slug/`).

---

## Basic Operations & Workflows

### 1. Adding a Post
1. Copy `_posts/_template.md` to `_posts/YYYY-MM-DD-your-slug.md`.
2. Fill in the front matter (`title`, `date`, `category`: `announcement`, `news`, `meeting`, `blog`, or `spotlight`).
3. Commit and push to `main`:
   ```bash
   git add _posts/YYYY-MM-DD-your-slug.md
   git commit -m "Add meeting announcement"
   git push origin main
   ```
4. GitHub Actions builds and publishes the update in ~1–2 minutes. *(For more details, see [`usage.md`](usage.md)).*


## Repository Map

| Path | Purpose |
|---|---|
| `_posts/` | Active community articles and meeting notes |
| `_cold-storage/` | Frozen 2012–2022 archive |
| `_layouts/` | Page shells (`default`, `home`, `post`, `page`, `cold-*`) |
| `_includes/` | Header, navigation bar, footer, SEO partials |
| `_sass/` | SCSS stylesheets (cyberpunk main theme + retro cold-storage) |
| `_data/site.js` | Site-wide metadata and social links |
| `assets/images/` | Site imagery and Cold Storage media/badges |
| `.well-known/` | Security disclosure file (`security.txt`) |
| `robots.txt` | Crawler policy |
| `CNAME` | GitHub Pages custom domain configuration |
| `eleventy.config.js` | 11ty pipeline, Sass compile hooks, and Atom feed config |
