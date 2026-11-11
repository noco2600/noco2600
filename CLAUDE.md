# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Goal

Contributors only edit flat Markdown files (`_posts/*.md`, `about.md`). Pushing to `main` builds and deploys automatically. Keep it that way: no build steps, generated files, or tooling that a content author has to run.

## Commands

Local preview runs in Docker, so nothing has to be installed on the host:

```powershell
docker compose up -d             # http://localhost:4000, rebuilds + refreshes on save
docker compose logs -f eleventy  # build errors show up here
docker compose down
```

With Node 22+ on the host, `npm install` then `npm start` (port 8080) or `npm run build` also work.

## Architecture

[Eleventy 3](https://www.11ty.dev/) with Liquid templates (ported from Jekyll). There is no theme package; everything is local. Configuration lives in `eleventy.config.js`.

- `_data/site.js`: site-wide settings (`site.title`, `site.tagline`, `site.url`, `site.discord_url`, …).
- `_layouts/`: `default` (HTML shell), `home` (paginated post feed), `post`, `page`.
- `_includes/`: `header.html`, `footer.html`, `seo.html` (meta/OG tags, replaces jekyll-seo-tag).
- `_posts/_posts.json`: directory data that gives every post `layout: post`, the `posts` tag (collection), and the permalink `/posts/<slug>/` (date prefix stripped from the filename).
- `index.md`: paginates `collections.posts`, 5 per page, newest first, at `/` and `/page/N/`.
- Feed: `/feed.xml` (Atom) via `@11ty/eleventy-plugin-rss`.

### Template notes (Eleventy vs. Jekyll)

- Front matter is top-level: use `title`/`category`, not `page.title`. `page` is Eleventy's object (`page.url`, `page.date`, `page.fileSlug`).
- In collection loops, use `post.data.title`, `post.data.category`, `post.url`, `post.date`, and `post.content`.
- Write links as plain root-relative paths (`/about/`), with no `url` filter. Quote includes: `{% include "header.html" %}`.
- Custom filters: `date_to_xmlschema`, `excerpt` (first `<p>` of rendered HTML). Liquid dates are formatted in UTC so `date: 2026-05-13` doesn't render as May 12.

### Sass

`assets/css/main.scss` is compiled with Dart Sass by a custom `scss` extension in `eleventy.config.js` and written to `/assets/css/main.css`. Partials live in `_sass/` and use **modern `@use`/`@forward` syntax**. Never use `@import`. Files that reference variables must include `@use 'variables' as *;` themselves. Use `color.adjust()` from `sass:color`, not `darken()`/`lighten()`.

### Category badges

Posts declare `category:` in front matter. Badge colors come from the `$badges` map in `_sass/_variables.scss`; `_layout.scss` generates `.category-badge--<slug>` for each entry via `@each`. To add a category, add an entry to `$badges`.

### Adding content

New posts go in `_posts/YYYY-MM-DD-slug.md`, usually copied from `_posts/_template.md` (excluded from the build in `eleventy.config.js`). Images go in `assets/images/` (passthrough-copied). With zero posts, `index.md` still renders thanks to `generatePageOnEmptyData`. Front matter stays minimal and portable. Do not add `layout:`, since it comes from `_posts/_posts.json`:

```yaml
---
title: "Title"
date: YYYY-MM-DD
category: announcement  # announcement | news | meeting | blog | spotlight
---
```

### Cold Storage (archive)

`/cold-storage/` holds historical posts (2012–2022, imported from the old WordPress site). It is **frozen**: do not edit, reformat, or "fix" files in `_cold-storage/`. The point is that they stay as they were.

- `_cold-storage/_cold-storage.json`: layout `cold-post`, tag `coldstorage` (so these never enter `collections.posts`, the home feed, or `/feed.xml`), permalink `/cold-storage/<slug>/`, and `templateEngineOverride: md` so old content is never run through Liquid.
- `cold-storage.md`: the index page (layout `cold-storage`, grouped by year).
- Separate look and feel (late-90s GeoCities homepage): both cold layouts set `body_class: cold-storage`, which `default.html` puts on `<body>` and uses to swap in `cold-header.html` / `cold-footer.html` instead of the main header and footer. All styling lives in `_sass/_cold-storage.scss` (`gc-*` classes), nested under `body.cold-storage`, with its own local palette and fonts. It's pure CSS, no images. Animations (marquee, blink) are disabled under `prefers-reduced-motion`.
- Post pages end in a "webring" bar linking the previous/next archived post (`getPreviousCollectionItem` / `getNextCollectionItem`).
- `cold-storage-redirects.html`: paginates the collection and writes a meta-refresh page at each post's `original_path` (the old `/YYYY/MM/slug/` WordPress URL) so old links still resolve.
- Images referenced by archived posts live in `assets/images/cold-storage/`.

## Deployment

`.github/workflows/deploy.yml` runs on **every** push to `main` (plus manual `workflow_dispatch`): `npm ci`, then `eleventy`, then deploys `_site/` to GitHub Pages. `CNAME` (`noco2600.org`) is passed through to the output; the site is served from the domain root, so no `--pathprefix` is used. (If one is ever needed, note that `@11ty/eleventy-plugin-rss` registers the HTML base plugin twice and the prefix gets applied twice.) The repo's Pages source must be set to "GitHub Actions". Keep `package-lock.json` committed so CI and local builds use identical versions.
