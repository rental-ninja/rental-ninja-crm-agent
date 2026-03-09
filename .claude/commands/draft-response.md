---
description: Draft a context-aware reply for a thread
---

Draft a reply for thread `$ARGUMENTS`.

## Phase 1 — Thread context (sub-agent)

- **Agent A**: `get_thread_detail` + identify company → `get_company_detail`. Return: company_id, company name/state/manager, participants (names + emails), message count, last 3 messages summarized, key asks/issues, booking/rental refs mentioned, recent company note summaries.

## Phase 2 — Fan-out (parallel sub-agents)

Using company_id and topic from Agent A:

- **Agent B** (docs): `search_docs` repo=`ninja-docs` for relevant help articles; repo=`ninja` if technical. Return: relevant article titles + solution excerpts.
- **Agent C** (conditional — if refs found): `search_bookings` or `get_rental_detail` for referenced bookings/rentals. Return: booking/rental context summaries.

## Phase 3 — Compose + save (main context)

From sub-agent summaries:

1. **Tone — sound like a real person, not a template:**
   - Write like a competent colleague sending a quick email — natural, straight to the point
   - Match the customer's language (French → French, Catalan → Catalan, Spanish → Spanish, etc.)
   - No filler apologies ("nous sommes conscients du délai et nous nous en excusons") — if something took long, one brief acknowledgment max, then move on to the fix
   - No over-politeness or hedging — say what happened, what to do, done
   - No corporate sign-offs beyond a simple "Cordialement" or equivalent
   - Short paragraphs, no walls of text
   - If you found the problem, lead with the solution, not the diagnosis
2. Compose HTML reply:
   - Lead with the answer or solution — not a recap of their problem
   - Include specifics (IDs, steps) so they can act immediately
   - Skip documentation references unless genuinely useful
   - One clear next step — don't give them homework
3. `save_draft` — **never** use `send_reply`

## Output

Report: draft ID, tone used, key points covered, review suggestions for the team.
