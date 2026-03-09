# Hub MCP Resource Catalog

Resources provide read-only data access via URI templates. Use resources for quick lookups; use tools when you need to search or take action.

---

## inbox_overview
**URI**: `hub://inbox/overview`
**MIME**: application/json

Dashboard overview: email/ticket/action counts for the authenticated user and team.

**Parameters**: None (uses authenticated user automatically).

**Returns**: JSON with inbox counters — total emails, tickets, pending actions, team-wide stats.

**When to use**: Morning standup, understanding workload, checking what needs attention.
**Tool alternative**: `get_dashboard_data` (same data, but lets you scope to a specific user).

---

## team_members
**URI**: `hub://team/members`
**MIME**: application/json

All CRM team members who can be assigned to threads or mentioned in notes.

**Parameters**: None.

**Returns**:
```json
{
  "count": integer,
  "members": [{ "id": integer, "name": string, ... }]
}
```

**When to use**: Before `assign_thread` to find valid `admin_user_id` values. Before mentioning someone in a note.

---

## thread_detail
**URI**: `hub://threads/{threadId}`
**MIME**: application/json

Full thread detail including messages, participants, linked threads, and draft.

**Parameters**: `threadId` (integer) — the CRM thread ID.

**Returns**: JSON — complete thread with message history, participants, linked threads, and any existing draft.

**When to use**: When you already have a thread ID and want the full context.
**Tool alternative**: `get_thread_detail` (identical data, same parameter).

---

## company_detail
**URI**: `hub://companies/{companyId}`
**MIME**: application/json

Full company detail: contact info, state, manager, listings count, notes count.

**Parameters**: `companyId` (integer) — the CRM company ID.

**Returns**:
```json
{
  "id": integer,
  "company_name": string,
  "contact_name": string|null,
  "contact_email": string|null,
  "phone": string|null,
  "company_url": string|null,
  "current_state": string|null,
  "state_class": string|null,
  "manager": string|null,
  "managed_by": string|null,
  "country": string|null,
  "locale": string|null,
  "rental_count": integer,
  "next_action_due": string|null,
  "notes_count": integer,
  "created_at": string|null
}
```

**When to use**: Quick company overview without notes detail.
**Tool alternative**: `get_company_detail` (same base data plus `recent_notes` array).

---

## company_threads
**URI**: `hub://companies/{companyId}/threads`
**MIME**: application/json

All CRM threads (emails, tickets) associated with a company.

**Parameters**: `companyId` (integer) — the CRM company ID.

**Returns**:
```json
{
  "company": string,
  "thread_count": integer,
  "threads": [{
    "id": integer,
    "subject": string,
    "type": string,
    "ticket_number": string|null,
    "state": string|null,
    "assigned_to": string|null,
    "last_message_date": string|null,
    "message_count": integer
  }]
}
```

Max 50 threads, ordered by most recent message date.

**When to use**: See all communication history for a company. Find threads to link or review.
**Tool alternative**: `search_threads` with `company_id` filter (also searches by content).

---

## company_bookings
**URI**: `hub://companies/{companyId}/bookings`
**MIME**: text/plain

Recent bookings for a company, including guest info, dates, and status.

**Parameters**: `companyId` (integer) — the CRM company ID.

**Returns**: Text — formatted list of recent bookings.

**When to use**: Quick overview of a company's booking activity.
**Tool alternative**: `search_bookings` (more filters: status, date range, search query).
