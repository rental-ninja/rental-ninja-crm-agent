---
description: Draft a context-aware reply for a thread
---

Draft a reply for thread `$ARGUMENTS`.

## Steps

1. `get_thread_detail` — full conversation context
2. Identify company → `get_company_detail` for relationship context
3. `search_docs` repo=`ninja-docs` for relevant help articles; repo=`ninja` if technical
4. If booking/rental mentioned → `search_bookings` or `get_rental_detail`
5. Detect appropriate tone:
   - **Support**: problem → empathetic, solution-focused
   - **Sales/onboarding**: warm, proactive
   - **Account management**: professional, concise
   - **Escalation follow-up**: direct, reference prior context
6. Compose HTML reply:
   - Acknowledgment of their message
   - Direct answer or solution
   - Documentation references if applicable
   - Clear next step
7. `save_draft` — **never** use `send_reply`

## Output

Report: draft ID, tone used, key points covered, review suggestions for the team.
