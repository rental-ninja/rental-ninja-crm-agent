---
description: Set up follow-up tracking with snooze, company note, and linked threads
---

Create follow-up tracking for thread. Input: `$ARGUMENTS` = `<thread_id> [YYYY-MM-DD] [notes]`. If no date provided, ask for one.

## Steps

1. `get_thread_detail` — understand the thread
2. Identify company → `get_company_detail`
3. Classify ticket type:
   - **RU ticket**: mentions Rentals United, channel manager, sync, API, mapping, channel errors
   - **Customer support**: customer-reported issue, bug, question
   - **Mixed**: RU issue reported by customer
4. Two-pass related thread search:
   - Pass 1: `search_threads` with `company_id` — same-company threads
   - Pass 2: `search_threads` with keywords only (no `company_id`) — cross-company RU tickets
5. Ask user to confirm links → `link_threads`
6. `add_thread_note` — follow-up note:
   - Type (RU ticket / customer support / mixed)
   - Follow-up date
   - What to check / what we're waiting for
   - Linked thread IDs
   - Additional notes from user
7. `change_thread_state` action=`snooze`, `snooze_until`=follow-up date, `snooze_reason`=summary
8. `add_company_note` with `next_action_due`=follow-up date, content="Follow-up: [issue summary] — see thread #ID"
9. Report: note added, thread snoozed until [date], company follow-up set, threads linked
