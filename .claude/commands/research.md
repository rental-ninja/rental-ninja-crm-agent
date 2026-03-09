---
description: Deep-dive investigation on a thread, company, or topic
---

Research `$ARGUMENTS` (thread ID, company ID/name, or topic keyword) across all available sources.

## Steps by Target Type

### Thread (numeric ID)
1. `get_thread_detail` → identify company
2. `get_company_detail` for relationship context
3. `search_threads` with `company_id` (limit 10) — related threads
4. `search_bookings` with `company_id` — booking context
5. `list_company_rentals` with `include_channels: true` — property context
6. `search_docs` (no repo) — broad search
7. `search_docs` repo=`ninja-docs` — help center
8. `search_docs` repo=`ninja|ninja_app|ninja_app_client|rentals-united-docs` — if technical issue. Think hard and search for a solution, the docs most of the time have the answer.

### Company (ID or name)
1. `search_companies` (if name) or `get_company_detail` (if ID)
2. Same chain as thread steps 3-8

### Topic/keyword
1. `search_docs` across all repos
2. `search_threads` by keyword
3. Identify relevant companies → expand with company chain

## Output

Structured brief:
- **Subject**: what was researched
- **Company**: name, ID, state, manager
- **Thread history**: relevant threads summary
- **Key findings**: from docs, bookings, rentals
- **Documentation refs**: links/articles found
- **Booking/rental context**: if applicable
- **Open questions**: unresolved items
- **Recommended next steps**: actionable items
