---
description: Set up follow-up tracking with snooze, company note, and linked threads
---

Create follow-up tracking for thread. Input: `$ARGUMENTS` = `<thread_id> [YYYY-MM-DD] [notes]`. If no date provided, ask for one.

## Phase 1 — Thread context (sub-agent)

- **Agent A**: `get_thread_detail` + identify company → `get_company_detail`. Return: company_id, thread summary (subject, issue, current status), company context (name, ID, state, manager), ticket type classification (`RU ticket` | `customer support` | `mixed` — based on mentions of Rentals United, channel manager, sync, API, mapping, channel errors).

## Phase 2 — Related threads (parallel sub-agents)

Using company_id and ticket type from Agent A:

- **Agent B** (same-company): `search_threads` with `company_id`. Return: thread summaries (ID, subject, date, one-line context).
- **Agent C** (cross-company): `search_threads` with keywords only (no `company_id`) — cross-company RU tickets or related issues. Return: thread summaries (ID, subject, company, one-line context).

## Phase 3 — Act (main context)

From sub-agent summaries:

1. Present related threads for user confirmation → `link_threads`
2. `add_thread_note` — follow-up note:
   - Type (RU ticket / customer support / mixed)
   - Follow-up date
   - What to check / what we're waiting for
   - Linked thread IDs
   - Additional notes from user
3. `change_thread_state` action=`snooze`, `snooze_until`=follow-up date, `snooze_reason`=summary
4. `add_company_note` with `next_action_due`=follow-up date, content="Follow-up: [issue summary] — see thread #ID"
5. Report: note added, thread snoozed until [date], company follow-up set, threads linked
