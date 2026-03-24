# Channel Sync

Domain knowledge for investigating the sync pipeline between Rental Ninja, Rentals United (RU), and OTAs.

Use this when a customer reports wrong prices, missing availability, failed listings, overbookings from sync gaps, or any channel distribution issue. Differs from `booking-rental/` — that reference covers entity lookups; this one traces why data didn't reach the OTA or came back wrong.

---

## Domain Model

**Rentals United (RU)** — The white-label channel manager. All OTA distribution flows through RU. The customer-facing UI is called the "Distribution Center" (or "White Label"). Data flows: Rental Ninja → RU → OTA.

**ARI (Availability, Rates, Inventory)** — Dynamic data (prices, availability, min stay, changeover restrictions) pushed instantly on change. This is the real-time sync path.

**Static content** — Photos, amenities, descriptions, fees, taxes. Pushed every 4 hours if "Automatic Listing Content Update" is enabled per channel account. Otherwise requires a manual push. This timing gap is a common source of confusion.

**Provider logs** — S3-stored XML request/response pairs showing exactly what was sent to RU and what came back. Two provider types: `channel-manager` (push and webhook — what we send and receive) and `rentals-united` (fetch — what we pull from RU, like reservations).

**Manual Options** — RU-side overrides editable in the Distribution Center. They persist silently and can cause overbookings. The team never uses or explains this feature to customers, but customers can stumble into it. Only discoverable via the Distribution Center or RU Tier 3 support.

**Limited vs Full Sync** — Airbnb-specific concept. Limited Sync only pushes availability, rates, and min stay. Full Sync adds fees, taxes, content, photos, and more. This distinction is poorly understood and causes a disproportionate number of support threads.

For OTA-specific sync models and quirks, see the per-OTA references: `airbnb.md`, `bookingcom.md`, `vrbo.md`, `expedia.md`.

**RU documentation per channel** — `search_docs(query: "{channel_name}", repo: "rentals-united-docs")` returns rich channel-specific docs: integration overview, fee/tax mappings, connection requirements, known errors, reservation processing, and FAQs. Use the channel name alone (`"Airbnb"`, `"Booking.com"`, `"Vrbo"`, `"Expedia"`) for a broad overview, or narrow with `"{channel} sync"`, `"{channel} fees"`, `"{channel} content"`. Cross-channel docs like `FAQ__Partial-content-update.md` also surface and cover partial repush options per channel.

**External RMS** — Some users use external RMS providers, mainly PriceLabs. In these scenarios, we do not push prices, since the RMS pushes these directly to Rentals United, and from there, to the OTAs.

## Provider Log Analysis

Provider logs are the most powerful diagnostic tool for channel sync — and historically the most underused. They show the exact XML that was sent and what error (if any) came back.

Start broad: search push logs for a company and date without filtering by action type — this reveals what action types exist (e.g., `Push_PutPrices_RQ`, `Push_PutAvailability_RQ`). Then narrow by action type and rental ID to find the specific push. Read the XML to see what was sent and what the response was.

What to look for: error codes in the response XML, timing gaps (last successful push was days ago), stale data (what was pushed doesn't match what the rental currently has), and missing pushes (nothing sent for a rental that should be active). For large log files, paginate with offset and limit.

The reason logs matter so much: when the customer says "my prices are wrong on Booking.com" and the rental data looks correct in RN, the logs tell you whether we actually pushed that correct data — and if so, whether RU accepted it.

## Common Root Causes

From real investigations, these are the root cause categories ordered by frequency:

- **RU sync failure** — Ninja data is correct, OTA data is wrong. RU missed a push or pull. Provider logs show either no recent pushes or error responses. Usually requires an RU ticket because the problem is on RU's infrastructure side.

- **OTA content policy rejection** — The OTA rejects the listing for content reasons (missing photos, insufficient amenities, licence requirements, accessibility policy). This looks like a sync bug but isn't — the push went through but the OTA won't accept the content. Often only visible on the Distribution Center's Publishing page, not via API.

- **Configuration misunderstanding** — Customer reports "dates blocked" but it's actually min-stay filtering, bookable-months limit, or seasonal pricing rules. Cross-referencing the rate calendar against what the customer expects usually reveals the gap.

- **Manual Options override** — Someone edited Manual Options in the RU Distribution Center, creating a persistent override that prevents data from syncing correctly. Since the team never teaches this feature, nobody thinks to check it.

- **Limited vs Full Sync mode** — On Airbnb, Limited Sync won't push fees, taxes, or content. Switching to Full Sync or doing a manual listing content push resolves it, but the distinction confuses both customers and support staff.

## Investigation Approach

Start broad, narrow down. Get the big picture first, then drill into the specific channel and rental.

Identify the channel and rental — check channel connections and status for the company. Verify the data on our side — is the rental detail and rate calendar correct for the date range in question? Check provider logs — did we push the data, and did RU accept it? If logs show a successful push but the OTA still shows wrong data, the issue is OTA-side — consult the per-OTA reference for known patterns.

When API data looks correct but the customer disagrees, visual verification via the Distribution Center adds value. Two paths: `login_rentals_united` for a direct RU dashboard login, or `get_company_urls` for navigation links including the white label URL (a tokenized URL that opens the Distribution Center directly — no auth needed, expires after 5 minutes). For a detailed browser-based verification workflow, see `distribution-center.md`. Look for: channel status badges, "last synced" timestamps, error messages on the Publishing page, Manual Options state.

If all RN-side data is clean and push logs show success, prepare an RU ticket with evidence — the XML logs, the rental configuration, and the discrepancy.

## Escalation

Self-service: customer corrects data in RN and retries the push. CRM support: agent investigates provider logs and guides the customer. RU ticket: for channel-side issues where RN data is provably correct — use `generate_ru_ticket_body` then `create_ru_ticket` with `source_thread_id`. OTA direct: customer contacts the OTA for account-level issues (Booking.com Extranet Inbox, Airbnb support, Expedia Partner Central, VRBO Account Manager).

## Available Tools

- `list_company_rentals(company_id, include_channels)` — rentals with channel distribution and sync status
- `get_rental_detail(company_id, rental_id)` — full rental config, amenities, legal, channels
- `get_rental_rate_calendar(company_id, rental_id, date_from, date_to)` — daily pricing, min-stay, availability
- `search_provider_logs(company_id, date, log_type, action_type, rental_id)` — list S3 log files by team, date, provider type, and action
- `get_provider_log(path, offset, limit)` — read XML request/response (credentials auto-redacted)
- `login_rentals_united(company_id)` — direct RU dashboard login URL (~30s)
- `get_company_urls(company_id)` — all navigation URLs (Nova admin, white label, setup wizard, etc.)
- `generate_ru_ticket_body(thread_id)` — AI-draft an RU support ticket from a thread
- `create_ru_ticket(...)` — send ticket to RU (irreversible)
- `search_docs(query, repo)` — search `rentals-united-docs` and `ninja-docs` repos
