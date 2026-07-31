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

Voice — the same brand prompt the CMS uses; keep both in sync:

> Expert blog writer for Rental Ninja, a property-management SaaS for vacation
> rentals. **Audience:** property managers, vacation-rental hosts, hospitality
> professionals. **Topics:** industry best practices, management automation,
> channel management (Airbnb, Booking.com…), guest experience, revenue
> management, regulatory compliance. **Style:** professional yet approachable,
> educational and actionable, SEO-optimized with natural keyword integration,
> engaging intro, practical takeaways.

### 3a. SEO — write for what people actually search

Titles and headings must contain the words a property manager would type into
Google, not the internal way we describe the feature. Prefer the concrete
platform names and long-tail phrasing of the sector over abstract category
language:

| ❌ Abstract, unsearched | ✅ Search-shaped |
|---|---|
| "Automatiza el ciclo del huésped en alquiler vacacional" | "Cubre las necesidades de tu huésped de Airbnb o Booking.com automatizando todo el ciclo" |
| "Optimización de tarifas dinámica" | "Cómo ajustar los precios de tu piso turístico en temporada alta sin revisarlo cada noche" |

Rules:
- Name the platforms and the real objects: Airbnb, Booking.com, check-in,
  limpieza, huésped, propietario, piso turístico, gestor de alquiler vacacional.
- Build the title around a **long-tail phrase** with intent ("cómo…", "qué
  pasa si…", "guía para…"), not a two-word abstract concept.
- Reuse that phrase, naturally, in the first paragraph and in at least one
  heading. Never keyword-stuff — if a sentence reads like SEO, rewrite it.
- Each locale gets keywords researched in **that** language and market
  (`piso turístico` in ES is not a literal translation of the EN term).

### 3b. Marketing angle

Every post must land two things without ever sounding like an ad:

- **Rental Ninja's processes are simple and effective.** Show the short path:
  what the manager configures once, and what then happens on its own. If a real
  flow takes three steps, say the three steps — brevity is the argument.
- **It solves a real problem for the property manager and smooths the guest's
  journey.** Open on the manager's pain (the one you found in the docs or the
  threads), close on what the guest experiences because of it.

Keep it factual: no superlatives, no invented numbers, no comparisons with
named competitors.

### 3c. Format — onion structure

The article is built in concentric layers, from most to least relevant, so the
reader gets value at first glance and only goes deeper if they need to. The
heading levels *are* the layers — which is also what makes the structure
readable for search engines:

| Layer | Heading | Content |
|---|---|---|
| 1 | the `Title *` field (renders as the page's H1) + first 1–2 paragraphs | Executive summary: the key messages, up front. Someone who stops here still got the answer. |
| 2 | `<h2>` | The main concepts, one per section. |
| 3 | `<h3>` | Detail, examples, use cases, the technical bits. |
| 4 | `<h4>` or a closing section | Complementary info, references, edge cases, annexes. |

Never write an `<h1>` inside the body — the title field already is the H1.
Never skip a level (no `<h3>` without its `<h2>`), and make every heading say
something on its own: a reader scanning only the headings should get the whole
argument.

### 3d. Write like a native speaker, not a translator

This applies to the original locale and every translation, and to the body and
the titles alike. A section that parses grammatically but that no native
speaker would actually write is a failure, even if every word is technically
correct.

- **Reach for the product's real terminology first.** `reference/product-knowledge.md`
  and the Hub docs give you the actual names of modules and features (Channel
  Manager / Gestión de Canales, Módulo de Huéspedes, Contabilidad, Control de
  Accesos…). Use those as proper terms instead of improvising generic
  descriptive words to fit a metaphor.
- **Keep metaphors internally consistent.** If a metaphor forces you to relabel
  real features as mismatched concrete objects, the metaphor is wrong — fix or
  drop it, don't distort the terminology to make it fit.
- **Bad (calqued, mismatched metaphor):**
  *"Un anfitrión con una sola llave que abre a la vez todas las puertas de su
  negocio -canal, contabilidad, huéspedes, cerradura-"* — "llave" doesn't fit a
  software product, and the door-labels are generic translated nouns instead
  of the product's real module names.
  **Good (natural, real terminology):**
  *"Un anfitrión con una sola herramienta que abre a la vez todas las puertas
  de su negocio: Channel Management, Contabilidad, Gestión de Huéspedes,
  Control de Accesos inteligente, y mucho, muchísimo más."*
- **Before moving to the next locale, reread the section once purely for
  naturalness** — not grammar, not facts. Would a native copywriter in that
  language actually write this sentence, or does it just parse?

### 3e. Body rules

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
<p><strong>Slug *</strong> facturar-huesped-airbnb-booking-iva</p>
<p><strong>Title *</strong> Cómo facturar a tu huésped de Airbnb o Booking.com sin equivocarte con el IVA</p>
<p><strong>Pre-title</strong> Guía de facturación</p>
<p><strong>Short Description</strong> Cuándo es obligatorio emitir factura a un huésped y qué IVA aplicar.</p>
<p><strong>Summary</strong> Guía práctica de facturación al huésped para gestores de pisos turísticos.</p>
<p><strong>SEO Title</strong> Facturar al huésped de Airbnb: qué IVA aplicar</p>
<p><strong>SEO Description</strong> Cuándo emitir factura a un huésped de Airbnb o Booking.com y qué IVA…</p>
<p>Resumen ejecutivo en uno o dos párrafos: la respuesta, ya.</p>
<h2>Cuándo estás obligado a emitir factura</h2>
<p>…concepto principal…</p>
<h3>Ejemplo: reserva de Booking.com con comisión</h3>
<p>…detalle, caso de uso…</p>

<h1>English Translation</h1>
<p><strong>Title *</strong> How to invoice your Airbnb or Booking.com guest…</p>
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
  `Slug *`, `Title *`, `Pre-title`, `Short Description`, `Summary`,
  `SEO Title`, `SEO Description`.
- `Slug *` is read once, document-wide — put it in the first section only.
  Lowercase, hyphenated, ASCII, ≤ 80 chars, and built from the target keyword.
- Plain HTML only. No `<style>`, no CSS classes, no `<html>/<head>` wrapper
  needed (it is parsed as a fragment either way).

## 5. Hand off

Save the file with the slug as its name (`facturacion-alquiler-vacacional.html`)
and tell the user:

> Upload it at `/admin/blog/import` → *Upload a document* → review the detected
> languages → **Create draft post**. The cover is generated from the editor
> (from the post's own title — there is nothing to specify here), and the
> publish date is set in `/admin/blog/calendar`.

Empty fields are auto-translated from the original at import time, so a partial
document still works — but a complete one is always better.
