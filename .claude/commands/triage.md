---
description: Triage inbox — prioritize and process unhandled threads
---

Triage the team inbox with priority and category classification.

## Phase 1 — Dashboard (sub-agent)

- **Agent A**: Call `get_dashboard_data` (team-wide, no params). Return: inbox counts by state, total unhandled, list of unhandled thread IDs.

## Phase 2 — Thread summaries (parallel sub-agents)

Based on Agent A's thread count, batch `get_thread_detail` calls across sub-agents (up to 15 oldest unhandled). Each agent returns per thread: thread ID, subject, sender name/email, company name/ID, age (days since created), one-line preview of latest message.

Note remaining count if more than 15 unhandled threads exist.

## Phase 3 — Classify + prioritize (main context)

From sub-agent summaries (no raw messages needed):

1. Categorize each thread: `billing` | `onboarding` | `technical` | `churn-risk` | `general`
2. Prioritize each: `P1 Critical` | `P2 High` | `P3 Medium` | `P4 Low`
3. Present sorted table:

```
| # | Thread ID | Subject | Category | Priority | Company | Age |
```

4. Summary: counts by priority + category, recommended first action

## Processing

Process P1-first, one thread at a time. For each, offer to:
- Read full detail
- Assign to a team member
- Draft a reply
- Add triage note (include category + priority tag)
- Snooze with reason and date

Wait for user input between each thread.
