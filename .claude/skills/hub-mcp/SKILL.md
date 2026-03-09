---
name: hub-mcp
description: This skill provides CRM operations via the Rental Ninja Hub MCP server. It should be used when working with inbox threads, companies, bookings, rentals, guests, or CRM state transitions — any task that involves reading or modifying CRM data.
---

# Hub MCP Skill

Operate the Rental Ninja CRM through 23 MCP tools and 6 resources.

## Tool Index

| Tool | Safety | Domain |
|------|--------|--------|
| `search_docs` | read-only | Knowledge |
| `get_dashboard_data` | read-only | Knowledge |
| `search_threads` | read-only | Threads |
| `get_thread_detail` | read-only | Threads |
| `search_companies` | read-only | Companies |
| `get_company_detail` | read-only | Companies |
| `get_company_states` | read-only | Companies |
| `get_transition_paths` | read-only | Companies |
| `search_bookings` | read-only | Bookings |
| `get_booking_detail` | read-only | Bookings |
| `list_company_rentals` | read-only | Rentals |
| `get_rental_detail` | read-only | Rentals |
| `search_guests` | read-only | Guests |
| `get_guest_detail` | read-only | Guests |
| `assign_thread` | idempotent | Threads |
| `change_thread_state` | idempotent | Threads |
| `add_thread_note` | idempotent | Threads |
| `link_threads` | idempotent | Threads |
| `assign_company_to_thread` | idempotent | Threads |
| `save_draft` | idempotent | Threads |
| `add_company_note` | idempotent | Companies |
| `send_reply` | **DESTRUCTIVE** | Threads |
| `transition_company` | **DESTRUCTIVE** | Companies |

For full parameter tables, return shapes, and tips, see [references/tool-catalog.md](references/tool-catalog.md).

## Resource Index

| URI | Returns |
|-----|---------|
| `hub://inbox/overview` | Dashboard counters |
| `hub://team/members` | Team member list (for `assign_thread` IDs) |
| `hub://threads/{threadId}` | Full thread detail |
| `hub://companies/{companyId}` | Company detail |
| `hub://companies/{companyId}/threads` | All threads for a company |
| `hub://companies/{companyId}/bookings` | Recent bookings |

For full URI specs and return shapes, see [references/resource-catalog.md](references/resource-catalog.md).

## Decision Tree

To check inbox status, call `get_dashboard_data` — see [Workflow 1](references/workflows.md#1-morning-inbox-standup).
To triage a new email, follow [Workflow 2](references/workflows.md#2-triage-a-new-email).
To reply to a customer, prefer [Workflow 3 (draft)](references/workflows.md#3-reply-to-customer-safe-path) over [Workflow 4 (direct send)](references/workflows.md#4-reply-to-customer-direct-send).
To move a company in the pipeline, follow [Workflow 5](references/workflows.md#5-transition-a-company-state).
To snooze or close a thread, follow [Workflow 6](references/workflows.md#6-snooze--wake-a-thread).
To research a company in depth, follow [Workflow 7](references/workflows.md#7-company-deep-dive).
To debug a booking or rental issue, follow [Workflow 8](references/workflows.md#8-debug-a-booking-or-rental-issue).
To connect related threads, follow [Workflow 9](references/workflows.md#9-link-related-threads).

## Safety (Critical)

Full guardrails documented in [references/safety.md](references/safety.md). The four non-negotiable rules:

1. **Read before write** — fetch thread/company context before any action
2. **Draft before send** — use `save_draft` instead of `send_reply`
3. **Paths before transition** — call `get_transition_paths` before `transition_company`
4. **Never retry destructive ops** — investigate errors instead of retrying
