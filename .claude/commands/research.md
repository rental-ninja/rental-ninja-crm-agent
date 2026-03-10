---
description: Deep-dive investigation on a thread, company, or topic
---

Research `$ARGUMENTS` (thread ID, company ID/name, or topic keyword) across all available sources.

## Phase 1 — Identify target (sub-agent)

- **Agent A**: Resolve the target and extract IDs needed to fan out.
  - Thread (numeric ID): `get_thread_detail` → return company_id, thread subject, key topics.
  - Company (ID or name): `search_companies` (if name) or `get_company_detail` (if ID) → return company_id, name, state.
  - Topic/keyword: skip to Phase 2 with keyword-only searches.

## Phase 2 — Fan-out (parallel sub-agents)

Using company_id and topic from Agent A:

- **Agent B** (threads): `search_threads` with `company_id` (limit 10). Return: thread IDs + subjects + dates + one-line summary each.
- **Agent C** (bookings/rentals): `search_bookings` with `company_id` + `list_company_rentals` with `include_channels: true`. If pricing/min-stay issue, also `get_rental_rate_calendar` for affected rental. Return: booking refs, statuses, key dates, rental names + channels, rate calendar segments if applicable.
- **Agent D** (docs): `search_docs` across repos — broad search first, then targeted (`ninja-docs`, `ninja`, `ninja_app`, `rentals-united-docs` if technical). Return: relevant article titles + key excerpts.
- **Agent E** (related threads): If researching a thread, `suggest_linked_threads` for AI-ranked related threads. Return: related thread summaries with confidence + reason.

For topic/keyword searches, Agent B uses keyword-only `search_threads`, Agent D searches all repos.

## Phase 3 — Synthesize (main context)

Assemble structured brief from sub-agent summaries:

- **Subject**: what was researched
- **Company**: name, ID, state, manager
- **Thread history**: relevant threads summary
- **Key findings**: from docs, bookings, rentals
- **Documentation refs**: links/articles found
- **Booking/rental context**: if applicable
- **Open questions**: unresolved items
- **Recommended next steps**: actionable items
