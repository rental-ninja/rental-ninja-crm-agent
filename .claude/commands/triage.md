---
description: Triage inbox — prioritize and process unhandled threads, snoozed threads, and RU tickets
---

Triage the full team inbox.

## Gather

Use sub-agents in parallel to fetch:
- Dashboard counters (team-wide)
- Unhandled emails (unassigned, active) — get details for anything that looks urgent
- Snoozed threads — flag overdue or missing-reason snoozes
- Active RU tickets — get details for anything that looks urgent

## Classify & Present

Categorize each: `billing` | `onboarding` | `technical` | `churn-risk` | `general`
Prioritize each: `P1 Critical` | `P2 High` | `P3 Medium` | `P4 Low`

Present three sorted tables:

**Unhandled Emails**
| # | Thread ID | Subject | Category | Priority | Company | Age |

**Snoozed Threads**
| # | Thread ID | Subject | Category | Priority | Company | Snooze Until | Reason |

**RU Tickets**
| # | Thread ID | Subject | Category | Priority | Company | Assignee | Age |

Summary: counts by priority + category, recommended first action.

## Process

P1-first, one thread at a time. For each, offer: read detail, assign, draft reply, add triage note, snooze, or wake. Wait for user input between threads.
