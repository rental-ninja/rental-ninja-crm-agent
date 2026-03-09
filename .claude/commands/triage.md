---
description: Triage inbox — prioritize and process unhandled threads
---

Triage the team inbox with priority and category classification.

## Steps

1. Call `get_dashboard_data` (team-wide, no params) for inbox overview
2. Call `get_thread_detail` for up to 15 oldest unhandled items; note remaining count if more exist
3. Categorize each thread: `billing` | `onboarding` | `technical` | `churn-risk` | `general`
4. Prioritize each: `P1 Critical` | `P2 High` | `P3 Medium` | `P4 Low`
5. Present sorted table:

```
| # | Thread ID | Subject | Category | Priority | Company | Age |
```

6. Summary: counts by priority + category, recommended first action

## Processing

Process P1-first, one thread at a time. For each, offer to:
- Read full detail
- Assign to a team member
- Draft a reply
- Add triage note (include category + priority tag)
- Snooze with reason and date

Wait for user input between each thread.
