# Hub MCP Tool Catalog

Complete reference for all 23 tools. Safety tiers: `read-only`, `idempotent` (safe to retry), `destructive` (irreversible).

---

## Knowledge & Search

### search_docs
**Safety**: read-only

Search documentation and codebase for product answers.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | yes | Search query (min 1 char) |
| `repo` | string | no | Filter: `ninja-docs` (help center), `ninja` (backend code), `ninja_app` (Flutter PMS app), `rentals-united-docs` (RU API), `ninja_app_client` (guest app) |

**Returns**: Text — documentation search results.

**Tips**:
- Use `ninja-docs` for customer-facing product questions
- Use `ninja` for backend code/DB schema questions
- Omit `repo` for broad searches across all sources

### get_dashboard_data
**Safety**: read-only

Get inbox counters (emails, tickets, actions) for a user or the team.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `admin_user_id` | integer | no | Scope to specific user (omit for team-wide) |
| `team_view` | boolean | no | Show team-wide counts (default: true) |

**Returns**: JSON — dashboard counters and inbox stats.

**Tips**:
- Call with no params for team-wide overview (morning standup)
- Pass `admin_user_id` to see a specific person's workload

---

## Threads

### search_threads
**Safety**: read-only

Search inbox threads by subject, body, or ticket number.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | yes | Search term (min 2 chars): subject text, body content, or ticket number |
| `company_id` | integer | no | Filter to threads belonging to this company |
| `limit` | integer | no | Max results 1-50 (default: 15) |

**Returns**: Text — list of matching threads with ID, ticket number, subject, type, state, company, assignee, and preview snippet.

### get_thread_detail
**Safety**: read-only

Get full thread with all messages, participants, linked threads, and draft.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `thread_id` | integer | yes | The CRM thread ID |

**Returns**: JSON — complete thread detail including message history.

### assign_thread
**Safety**: idempotent

Assign a thread to a team member.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `thread_id` | integer | yes | The CRM thread ID |
| `admin_user_id` | integer | yes | The admin user ID (get from `team_members` resource) |

**Returns**: Text — confirmation with thread ID and assignee name.

### change_thread_state
**Safety**: idempotent

Close, reopen, snooze, or wake a thread.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `thread_id` | integer | yes | The CRM thread ID |
| `action` | string | yes | One of: `close`, `reopen`, `snooze`, `wake` |
| `snooze_until` | string | no | ISO date for snooze expiry (**required** when action=snooze) |
| `snooze_reason` | string | no | Reason for snoozing, max 500 chars (**required** when action=snooze) |

**Returns**: Text — confirmation of state change.

**Tips**:
- When snoozing, both `snooze_until` and `snooze_reason` are required
- Use `wake` to cancel a snooze early

### add_thread_note
**Safety**: idempotent

Add an internal note to a thread (team-only, customers cannot see this).

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `thread_id` | integer | yes | The CRM thread ID |
| `body_html` | string | yes | HTML content (use `<p>` tags for paragraphs) |

**Returns**: Text — confirmation with note/message ID.

### link_threads
**Safety**: idempotent

Link two related threads together.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `source_thread_id` | integer | yes | First thread ID |
| `linked_thread_id` | integer | yes | Second thread ID |

**Returns**: Text — confirmation with link ID.

**Tips**: Cannot link a thread to itself.

### assign_company_to_thread
**Safety**: idempotent

Associate a CRM company with a thread.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `thread_id` | integer | yes | The CRM thread ID |
| `company_id` | integer | yes | The CRM company ID |

**Returns**: Text — confirmation with company name and thread ID.

### save_draft
**Safety**: idempotent

Save a draft reply for team review before sending.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `thread_id` | integer | yes | The CRM thread ID |
| `body_html` | string | yes | HTML draft content (use `<p>` tags) |
| `to_emails` | array | no | Recipient email addresses |

**Returns**: Text — confirmation with draft ID. Draft appears in the thread composer for human review.

**Tips**:
- Preferred over `send_reply` — lets the team review before sending
- Email addresses in `to_emails` must be valid email format

### send_reply
**Safety**: DESTRUCTIVE

Send an email to a customer. **IRREVERSIBLE** — the email is delivered immediately.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `thread_id` | integer | no | Thread ID to reply in (null creates new thread) |
| `company_id` | integer | no | Company ID for sender context |
| `to_emails` | array | yes | Recipient emails (min 1) |
| `subject` | string | yes | Email subject (max 500 chars) |
| `body_html` | string | yes | HTML email body (use `<p>` tags) |
| `cc_emails` | array | no | CC email addresses |
| `in_reply_to_message_id` | integer | no | CRM message ID to thread under |

**Returns**: Text — thread ID and message ID on success, error details on failure.

**Tips**:
- Always read the thread first with `get_thread_detail`
- Prefer `save_draft` → human review → manual send
- Double-check recipient emails before sending
- Never retry on error — investigate first

---

## Companies

### search_companies
**Safety**: read-only

Find CRM companies by name, email, phone, URL, or Airbnb host ID.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `search` | string | yes | Search term (min 2 chars) |
| `limit` | integer | no | Max results 1-50 (default: 20) |

**Returns**: Text — list with ID, company name, contact, email, manager, and state.

### get_company_detail
**Safety**: read-only

Get full company info with contact details, state, manager, and recent notes.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `company_id` | integer | yes | The CRM company ID |

**Returns**: JSON — company detail including `state_class` (FQCN), manager, rental count, recent notes.

### get_company_states
**Safety**: read-only

View available state transitions with labels and colors.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `company_id` | string | yes | The CRM company ID |

**Returns**: Text — current state and available transitions with labels, colors, rollback indicators.

**Tips**: Use for display purposes. For transitioning, use `get_transition_paths` instead (it includes class names).

### get_transition_paths
**Safety**: read-only

Get available state transitions with fully qualified class names needed by `transition_company`.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `company_id` | integer | yes | The CRM company ID |

**Returns**: Text — transitions with state class FQCNs, rollback indicators, and action verbs.

**Tips**: **Always** call this before `transition_company`. Never hardcode state class names.

### add_company_note
**Safety**: idempotent

Add an internal note to a company record, optionally setting a follow-up date.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `company_id` | integer | yes | The CRM company ID |
| `content` | string | yes | HTML content, max 50000 chars (use `<p>` tags) |
| `next_action_due` | string | no | Follow-up date (YYYY-MM-DD) to set on the company |

**Returns**: Text — confirmation with note ID. Includes follow-up date if set.

### transition_company
**Safety**: DESTRUCTIVE

Change a company's CRM state. **May trigger automations.**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `company_id` | integer | yes | The CRM company ID |
| `to_state_class` | string | yes | Fully qualified state class name from `get_transition_paths` |

**Returns**: Text — confirmation with previous and new state names.

**Tips**:
- **Always** call `get_transition_paths` first to get valid `to_state_class` values
- Never hardcode or guess state class names
- State transitions may trigger automated workflows (emails, tasks, etc.)
- Never retry on error — investigate the failure

---

## Bookings

### search_bookings
**Safety**: read-only

Search bookings by reference, guest name, external ID, or booking ID.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `company_id` | integer | yes | The CRM company ID |
| `query` | string | no | Search term (min 1 char) |
| `status` | string | no | Filter: `Booked`, `Canceled`, `Tentative`, `Request`, `Lead`, `Unavailable`, `Rejected`, `Archived` |
| `date_from` | string | no | Check-in from date (YYYY-MM-DD) |
| `date_to` | string | no | Check-in until date (YYYY-MM-DD) |
| `limit` | integer | no | Max results 1-50 (default: 10) |

**Returns**: JSON — count and booking list with guest name, rental, dates, pricing, and status.

### get_booking_detail
**Safety**: read-only

Get full booking with guest, pricing breakdown, fees, taxes, payments, and notes.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `company_id` | integer | yes | The CRM company ID |
| `booking_id` | integer | yes | The booking ID |

**Returns**: JSON — comprehensive booking data including nested guest, rental, pricing, fees, taxes, payments, pre-check-in status, contract status, and notes.

---

## Rentals

### list_company_rentals
**Safety**: read-only

List all rental properties for a company.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `company_id` | integer | yes | The CRM company ID |
| `include_channels` | boolean | no | Include channel distribution data (default: false) |

**Returns**: JSON — count and rental list with type, location, capacity, pricing, owner, and optionally channel data.

### get_rental_detail
**Safety**: read-only

Get full rental with amenities, check-in/out info, legal details, Wi-Fi, door codes, and channels.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `company_id` | integer | yes | The CRM company ID |
| `rental_id` | integer | yes | The rental ID |

**Returns**: JSON — comprehensive rental data including location, capacity, stay rules, pricing, check-in details (door codes, Wi-Fi), check-out details, amenities, legal info, contacts, owner, provider info, channels, and descriptions.

---

## Guests

### search_guests
**Safety**: read-only

Search guests by name within a company.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `company_id` | integer | yes | The CRM company ID |
| `query` | string | yes | Guest name search (min 2 chars) |

**Returns**: JSON — count and guest list with name, email, locale, and bookings count.

### get_guest_detail
**Safety**: read-only

Get full guest detail with contact info, addresses, and complete booking history.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `company_id` | integer | yes | The CRM company ID |
| `guest_id` | integer | yes | The guest (client) ID |

**Returns**: JSON — guest detail including all emails, phone numbers, addresses, passport info, notes, and full booking history with pricing.
