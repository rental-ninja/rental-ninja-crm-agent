---
description: Triage inbox — prioritize and process unhandled threads, snoozed threads, and RU tickets
---

Triage the full team inbox: unhandled emails, snoozed threads, and Rentals United tickets.

## Phase 1 — Dashboard (sub-agent)

- **Agent A**: Call `get_dashboard_data` (team-wide, no params). Return all counters:
  - Emails: mine, unassigned, snoozed
  - Tickets (RU): mine, unassigned, snoozed
  - Actions: overdue, dueToday, thisWeek

## Phase 2 — Thread summaries (parallel sub-agents)

Launch sub-agents in parallel to fetch thread lists, then selectively get details for threads that need more context:

- **Agent B — Unhandled emails**: Call `list_threads` with `state: "active", type: "customer_email", assigned_to: 0, limit: 15`. For P1/P2 candidates, call `get_thread_detail` to get message previews. Return per thread: thread ID, subject, sender name/email, company name/ID, age (days since created), one-line preview if fetched.

- **Agent C — Snoozed threads**: Call `list_threads` with `state: "snoozed", limit: 10`. For overdue or reason-less snoozes, call `get_thread_detail` for context. Return per thread: thread ID, subject, company, snooze_until, snooze_reason, last message preview if fetched. Flag any that are overdue (snooze_until < now) or snoozing without a reason.

- **Agent D — RU tickets**: Call `list_threads` with `state: "active", type: "ru_ticket", limit: 10`. For P1/P2 candidates, call `get_thread_detail` for message previews. Return per ticket: thread ID, subject, company, assignee, age, last message preview if fetched.

Note remaining counts if more threads exist than fetched.

## Phase 3 — Classify + prioritize (main context)

From sub-agent summaries (no raw messages needed):

1. Categorize each thread: `billing` | `onboarding` | `technical` | `churn-risk` | `general`
2. Prioritize each: `P1 Critical` | `P2 High` | `P3 Medium` | `P4 Low`
3. Present three sorted tables:

**Unhandled Emails**
```
| # | Thread ID | Subject | Category | Priority | Company | Age |
```

**Snoozed Threads**
```
| # | Thread ID | Subject | Category | Priority | Company | Snooze Until | Reason |
```

**RU Tickets**
```
| # | Thread ID | Subject | Category | Priority | Company | Assignee | Age |
```

4. Summary: counts by priority + category across all three groups, recommended first action

## Processing

Process P1-first across all groups, one thread at a time. For each, offer to:
- Read full detail
- Assign to a team member
- Draft a reply
- Add triage note (include category + priority tag)
- Snooze with reason and date
- Wake a snoozed thread (for snoozed items)

Wait for user input between each thread.
