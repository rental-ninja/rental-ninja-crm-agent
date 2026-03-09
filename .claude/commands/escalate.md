---
description: Create an escalation brief for a thread
---

Escalate thread `$ARGUMENTS`.

## Steps

1. `get_thread_detail` — full conversation
2. Identify company → `get_company_detail`
3. `search_threads` with `company_id` — related threads (limit 10)
4. `search_bookings` if booking-related
5. `search_docs` for known issues
6. Compose HTML escalation brief as thread note:
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
7. `add_thread_note` with the brief
8. `link_threads` for any related threads found
9. Show team members list → ask user who to assign → `assign_thread`
