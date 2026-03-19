# Documentation & Past Resolutions

Domain knowledge for searching Rental Ninja documentation and mining past support resolutions.

---

## Documentation Repos

- **`ninja-docs`** — Help center. Covers booking management, channel setup, guest portal, accounting, and most user-facing features. Start here for most questions.
- **`ninja`** — Backend Laravel codebase. Models, actions, API routes, DB schema. Use for backend/API questions.
- **`ninja_app`** — Flutter PMS app. Use for app behavior questions.
- **`ninja_app_client`** — Guest-facing app. Pre-check-in, identity verification. Use for guest portal questions.
- **`rentals-united-docs`** — Rentals United API. ARI, reservations, channel connectivity. Use for channel/OTA problems.

Omit the `repo` parameter for broad cross-repo search.

## Search Strategy

For thorough research, search multiple sources:

1. Search `ninja-docs` first — the help center covers most user-facing features.
2. Search a second repo relevant to the issue category:
   - Channel/OTA problem → `rentals-united-docs`
   - Backend/API question → `ninja`
   - App behavior → `ninja_app` or `ninja_app_client`
3. Search `search_closure_summaries` with at least 2 different phrasings — past resolutions often reveal the exact steps that fixed similar issues.
4. If a `thread_id` is available, use `suggest_linked_threads` to discover related threads.
5. If initial searches return nothing, try broader or narrower keywords. A single failed query doesn't mean nothing exists.

## Available Tools

- `search_docs(query, repo)` — search documentation and codebase. Repos: `ninja-docs`, `ninja`, `ninja_app`, `rentals-united-docs`, `ninja_app_client`. Omit `repo` for broad search.
- `search_closure_summaries(query)` — find how similar issues were resolved before
- `suggest_linked_threads(thread_id)` — AI-powered related thread suggestion
