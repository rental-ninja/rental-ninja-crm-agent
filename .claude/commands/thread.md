---
description: Quick thread/ticket lookup — view full context for a thread
---

Analyze thread `$ARGUMENTS` (thread ID or ticket number).

## Steps

1. `get_thread_detail` — read every message carefully
2. If company linked → `get_company_detail` (state, manager, notes, follow-up dates)
3. `search_threads` with `company_id` (limit 5) — recent threads from same company for context on ongoing issues
4. If messages reference a booking, rental, or guest → fetch the relevant detail (`search_bookings`, `get_rental_detail`, `get_guest_detail`)
5. If messages reference a channel manager issue (Rentals United, sync, mapping, API error) → `search_docs` repo=`rentals-united-docs`
6. If messages reference product questions → `search_docs` repo=`ninja-docs`

## Analysis

Read all messages end-to-end and determine:
- **What's being asked / what's the issue** — the core request or problem
- **Current status** — waiting on us? waiting on them? blocked? resolved?
- **Who spoke last** and when — are we the ones who owe a reply?
- **Sentiment** — is the customer frustrated, neutral, urgent?
- **Related context** — what did other threads from this company reveal? any patterns?
- **Missing info** — what do we still not know that we'd need to act?

## Output

Present a structured brief:
- **Thread**: #ID — subject — state (open/closed/snoozed)
- **Company**: name (#ID) — state — manager
- **Assigned to**: name or unassigned
- **Issue**: 2-3 sentence summary of the core problem/request
- **Status**: who owes the next action (us / them / third party) + since when
- **Sentiment**: frustrated / neutral / positive / urgent
- **Key details**: booking refs, rental names, error messages, dates mentioned
- **Related threads**: relevant threads from same company with one-line context
- **Missing info**: what we'd need to resolve this
- **Recommended action**: what to do next (draft reply, escalate, snooze, research more, etc.)

Then ask: want me to draft a reply, escalate, research deeper, or something else?
