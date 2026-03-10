---
description: Quick thread/ticket lookup — view full context for a thread
---

Analyze thread `$ARGUMENTS` (thread ID or ticket number).

## Phase 1 — Thread analysis (sub-agent)

- **Agent A**: `get_thread_detail` — read every message carefully. Return: company_id, issue summary, current status (waiting on us/them/blocked/resolved), who spoke last and when, sentiment (frustrated/neutral/positive/urgent), key details (booking refs,
  rental names, error messages, dates), missing info needed to act.

## Phase 2 — Context fan-out (parallel sub-agents)

Using company_id from Agent A:

- **Agent B** (company + related threads): `get_company_detail` (state, manager, notes, follow-up dates) + `search_threads` with `company_id` (limit 5). Return: company context + related thread summaries (ID, subject, one-line context, relevance).
- **Agent C** (conditional — if Agent A found refs or channel issues): `search_bookings`, `get_rental_detail`, `get_guest_detail`, or `search_docs` repo=`rentals-united-docs` / `ninja-docs`. Return: relevant context summaries.

## Phase 3 — Present (main context)

Assemble structured brief from sub-agent summaries:

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

Then offer numbered actions:

1. **Draft reply** — compose context-aware reply (`save_draft`), matching customer's language, leading with the solution
2. **Escalate** — write HTML escalation brief as thread note, link related threads, offer to assign and optionally create RU ticket
3. **Follow-up** — snooze thread to a date, add company note with `next_action_due`, link related threads, @mention assignee/manager
4. **Assign / reassign** — assign thread to a team member
5. **Close / snooze / reopen** — change thread state
6. **Research deeper** — fan out to bookings, rentals, docs, and related threads across all sources

Ask: which action (or something else)?
