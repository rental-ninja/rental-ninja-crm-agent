# Safety Rules & Guardrails

## Tool Safety Tiers

| Tier | Tools | Risk | Behavior |
|------|-------|------|----------|
| **Read-only** (14) | search_docs, search_companies, search_threads, get_thread_detail, get_company_detail, get_company_states, get_transition_paths, get_dashboard_data, search_bookings, get_booking_detail, list_company_rentals, get_rental_detail, search_guests, get_guest_detail | None | Auto-approved. No side effects. |
| **Idempotent** (7) | assign_thread, change_thread_state, add_thread_note, link_threads, assign_company_to_thread, save_draft, add_company_note | Low | Safe to retry. Internal only (no customer impact). |
| **Destructive** (2) | send_reply, transition_company | High | **Irreversible.** Requires confirmation every time. |

## send_reply Rules

- Read the thread with `get_thread_detail` before composing any reply
- Verify recipient email addresses against thread or company detail — never guess
- Prefer `save_draft` over `send_reply` to allow human review
- Never send without understanding the full conversation context
- Never retry a failed send — investigate the error first
- Sending with `thread_id: null` creates a **new thread** — only do this intentionally

## transition_company Rules

- Call `get_transition_paths` first to obtain valid state class names
- Never hardcode or guess `to_state_class` values — they are fully qualified class names
- Never retry a failed transition without investigating the cause
- State transitions may trigger automations (emails sent to customers, tasks created)
- Rollback transitions are marked with `[ROLLBACK]` — use with caution

## Notes

- `add_thread_note` and `add_company_note` are visible to the CRM team only — customers never see them
- Notes are safe to add freely for documentation purposes

## Idempotent Tool Behavior

- `assign_thread` — reassigning updates the assignee; safe to retry
- `assign_company_to_thread` — re-linking updates the association; safe to retry
- `link_threads` — already-linked threads do not create duplicates

## Booking/Rental/Guest Tools Require company_id

All tools in the Bookings, Rentals, and Guests categories require a `company_id` parameter:
1. Find the company first via `search_companies`
2. Use the returned company ID for subsequent queries

## Audit Trail

All actions are logged under the authenticated user's identity. Every tool call is traceable.

## Error Handling

- Read-only errors: safe to retry
- Idempotent errors: safe to retry, but investigate if repeated
- Destructive errors: **do not retry** — report the error and ask for guidance
