---
name: blog-post
description: Write a multilingual Rental Ninja blog article, grounded in the Hub (changelog, product docs, real customer threads), and export it as an import-ready HTML document for the CMS. Use when the user says "write a blog post", "draft an article", asks to turn a feature or changelog entry into a post, or wants content for try.rental-ninja.com.
argument-hint: "<topic, feature or changelog entry>"
---

# Rental Ninja blog writer

Produce **one HTML file** that the Rental Ninja CMS imports as a multilingual
draft post at `/admin/blog/import` (upload the file, review, publish).

You are not writing into any repository. The only deliverable is the HTML file.

## 1. Ground the article in real data (Hub MCP)

**Requires:** the `hub` MCP (changelog, docs, threads). Never invent product
behaviour — gather the facts first:

| Need | Tool |
|---|---|
| What actually shipped | `mcp__hub__search_changelog`, `list_changelog_items`, `get_changelog_draft` |
| How a feature really works | `mcp__hub__search_docs` (repos: `ninja-docs` for help-center, `ninja` for backend, `ninja_app` for the manager app, `ninja_app_client` for the guest app, `rentals-united-docs` for channel/OTA) |
| Real customer pain points, in their own words | `mcp__hub__search_threads`, `search_closure_summaries`, `get_thread_detail` |
| Channel/OTA specifics | `mcp__hub__search_docs` with `repo: rentals-united-docs` |

`reference/product-knowledge.md` is a snapshot of the main features and their
real names — read it to know *what to search for*, then verify with the live
tools. When the snapshot and the tools disagree, the tools win.

**Grounding rules — non-negotiable.** The in-app generator this skill replaces
shipped confident, invented specifics; that is the failure mode to avoid:

- Every product claim traces to a `search_docs` or changelog result. Use the
  real feature names and real behaviour — never guess a feature name, a
  workflow, a limit or a price.
- **Never invent statistics, percentages, survey results, named customer
  stories, awards or certifications.** If a number would strengthen a point and
  you don't have a real one, drop it or go qualitative ("many managers find…",
  not "73% of managers…").
- If the brief doesn't map to anything real, write general vacation-rental
  industry guidance — do not invent a Rental Ninja capability to fit it.
- Customer threads are for *themes and phrasing of the problem* only. Never
  quote a customer, never name a company, guest, property or booking.
- If the Hub tools are unavailable, say so and ask the user for the source
  material rather than writing from memory.

## 2. Ask only what you can't infer

Before writing, confirm with the user (one short round, skip anything already
given):

- post type: feature / business / general training / other
- the problem it solves
- objectives: SEO / training / product diffusion
- **additional context**: any real facts specific to this post — figures, a
  particular workflow, pricing — that the Hub won't give you. Treat what they
  give as fact and never contradict it.
- target locales. Default: `es` (original), `en`, `fr`, `it`, `pt`, `de`.

## 3. Write it

Voice and structure — this is the same brand prompt the CMS uses; keep both in
sync:

> Expert blog writer for Rental Ninja, a property-management SaaS for vacation
> rentals. **Audience:** property managers, vacation-rental hosts, hospitality
> professionals. **Topics:** industry best practices, management automation,
> channel management (Airbnb, Booking.com…), guest experience, revenue
> management, regulatory compliance. **Style:** professional yet approachable,
> educational and actionable, SEO-optimized with natural keyword integration,
> clear H2/H3 structure, engaging intro, practical takeaways.

Markdown/HTML rules for the body:
- `<h2>` for main sections, `<h3>` for subsections. **Never an `<h1>`** — the
  title is a separate field.
- Real paragraphs, `<ul>/<li>` lists, `<strong>` for emphasis. No emojis, no
  hashtags, no "In conclusion" filler.
- 900–1500 words unless the user asks otherwise.
- Write the original locale first, then translate. Translations are full
  translations, not summaries — same headings, same structure.
- Every locale gets its own SEO title (≤ 60 chars) and meta description
  (≤ 160 chars) written natively in that language, not translated literally.

## 4. Export the HTML document

Write a single `.html` file (see `reference/template.html`). Shape:

```html
<h1>Versión Original (Español)</h1>
<p><strong>Slug *</strong> facturacion-alquiler-vacacional</p>
<p><strong>Cover prompt</strong> A host drowning in paper invoices</p>
<p><strong>Title *</strong> Facturación en el alquiler vacacional</p>
<p><strong>Pre-title</strong> Guía de IVA</p>
<p><strong>Short Description</strong> Cuándo es obligatorio emitir factura.</p>
<p><strong>Summary</strong> Guía técnica sobre facturación al huésped.</p>
<p><strong>SEO Title</strong> Facturación en alquiler vacacional: guía de IVA</p>
<p><strong>SEO Description</strong> Cuándo emitir factura y qué IVA aplicar…</p>
<h2>Primera sección</h2>
<p>…cuerpo del artículo…</p>

<h1>English Translation</h1>
<p><strong>Title *</strong> Vacation rental invoicing</p>
…
```

Hard requirements — the importer is a deterministic parser, not an AI:
- One `<h1>` **language header** per locale, and it must literally contain
  `Versión Original` (for the source) or `English Translation` /
  `French Translation` / `Italian Translation` / `Portuguese Translation` /
  `German Translation`. Any other wording is not recognized as a section.
- The field block comes **immediately after** the language header, before any
  body content. The first non-field element starts the body.
- Field labels are always these English labels, in every language section:
  `Slug *`, `Cover prompt`, `Title *`, `Pre-title`, `Short Description`,
  `Summary`, `SEO Title`, `SEO Description`.
- `Slug *` and `Cover prompt` are read once, document-wide — put them in the
  first section only. Slug: lowercase, hyphenated, ASCII, ≤ 80 chars.
- Plain HTML only. No `<style>`, no CSS classes, no `<html>/<head>` wrapper
  needed (it is parsed as a fragment either way).

### The cover prompt

The CMS generates every cover with **one fixed brand prompt** — a typographic
poster, ALL-CAPS allegorical caption, brand palette, witty footnote — so all
covers stay consistent. The `Cover prompt` field is *art direction layered on
top of that*, never a replacement.

So write one short line describing the **idea/metaphor** for this post
("A host drowning in paper invoices", "The tax office as the guest who never
reviews"). Do not specify fonts, colors, layout, image style or "generate an
image of…" — the format is fixed and those instructions will be ignored or
degrade the result. Nobody generates the cover here: the editor does, later.

## 5. Hand off

Save the file with the slug as its name (`facturacion-alquiler-vacacional.html`)
and tell the user:

> Upload it at `/admin/blog/import` → *Upload a document* → review the detected
> languages → **Create draft post**. The cover is generated from the editor, and
> the publish date is set in `/admin/blog/calendar`.

Empty fields are auto-translated from the original at import time, so a partial
document still works — but a complete one is always better.
