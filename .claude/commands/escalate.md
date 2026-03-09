---
description: Create an escalation brief for a thread
---

Escalate thread `$ARGUMENTS`.

## Phase 1 — Thread context (sub-agent)

- **Agent A**: `get_thread_detail`. Return: company_id, subject, participants (names + emails), timeline (created, last message), issue summary, what's been tried so far, whether booking-related.

## Phase 2 — Context fan-out (parallel sub-agents)

Using company_id and context from Agent A:

- **Agent B** (company + related): `get_company_detail` + `search_threads` with `company_id` (limit 10). Return: company name/ID/state/manager + related thread summaries (ID, subject, one-line context).
- **Agent C** (bookings + docs): `search_bookings` with `company_id` if booking-related + `search_docs` for known issues. Return: booking context (refs, statuses, dates) + known issue articles.

## Phase 3 — Act (main context)

From sub-agent summaries:

1. Compose HTML escalation brief as thread note:
   - Thread # + subject
   - Company name / ID / state
   - Reporter name / email
   - Issue summary (1-2 sentences)
   - Timeline (when reported, duration)
   - Business impact (revenue, guests, properties affected)
   - Reproduction / details
   - What was already tried
   - Related thread IDs
   - Recommended action
2. `add_thread_note` with the brief
3. `link_threads` for any related threads found
4. Show team members list → ask user who to assign → `assign_thread`
