import path from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import site from "./_data/site.js";

export default function (eleventyConfig) {
  // ── Not site content ──────────────────────────────────────────────────────
  for (const f of ["README.md", "usage.md", "CLAUDE.md", "LICENSE", "_posts/_template.md"]) {
    eleventyConfig.ignores.add(f);
  }
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy({ ".well-known": ".well-known" });
  eleventyConfig.addPassthroughCopy({ ".well-known/security.txt": "security.txt" });
  eleventyConfig.addPassthroughCopy("assets/images");

  // Polling for file changes inside Docker (see docker-compose.yml).
  if (process.env.ELEVENTY_POLL) {
    eleventyConfig.setChokidarConfig({ usePolling: true, interval: 500 });
  }

  // ── Liquid ────────────────────────────────────────────────────────────────
  // Front matter dates (e.g. 2026-05-13) are UTC midnight; format them in UTC
  // so they don't shift to the previous day in Mountain Time.
  eleventyConfig.setLiquidOptions({ timezoneOffset: 0 });

  eleventyConfig.addFilter("date_to_xmlschema", (d) => new Date(d).toISOString());

  // First paragraph of rendered post HTML (Jekyll's default excerpt).
  eleventyConfig.addFilter("excerpt", (html = "") => {
    const m = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    return m ? m[1] : "";
  });

  // ── Sass ──────────────────────────────────────────────────────────────────
  // assets/css/main.scss -> /assets/css/main.css; partials live in _sass/.
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    useLayouts: false,
    compile(inputContent, inputPath) {
      if (path.basename(inputPath).startsWith("_")) return; // partial
      const result = sass.compileString(inputContent, {
        loadPaths: [path.dirname(inputPath), "_sass"],
        style: "compressed",
      });
      // Sass reports file:// URLs; Eleventy's watcher needs paths, or edits to
      // a partial never trigger a recompile of main.scss.
      this.addDependencies(
        inputPath,
        result.loadedUrls.filter((u) => u.protocol === "file:").map((u) => fileURLToPath(u)),
      );
      return () => result.css;
    },
  });

  // ── Atom feed at /feed.xml ────────────────────────────────────────────────
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "posts", limit: 10 },
    metadata: {
      language: "en",
      title: site.title,
      subtitle: site.description,
      base: site.url + "/",
      author: site.author,
    },
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
  };
}
