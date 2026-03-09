# CRM Workflows

Step-by-step recipes for common CRM operations.

---

## 1. Morning Inbox Standup

**Goal**: Understand what needs attention today.

1. Call `get_dashboard_data` with no params for a team-wide overview
2. Call `get_dashboard_data` with a specific `admin_user_id` for a personal queue
3. Report total unhandled emails, tickets needing response, and overdue actions

---

## 2. Triage a New Email

**Goal**: Read, categorize, assign, and document a new inbound email.

1. Call `get_thread_detail` to read the full thread
2. Call `search_companies` to find or confirm the sender's company
3. Call `assign_company_to_thread` to link the company if not already linked
4. Call `assign_thread` to assign to the right team member (check `team_members` resource for IDs)
5. Call `add_thread_note` to document the triage decision

---

## 3. Reply to Customer (Safe Path)

**Goal**: Draft a reply for human review before sending.

1. Call `get_thread_detail` to understand the full conversation context
2. Call `search_docs` to look up product answers if needed
3. Call `save_draft` to save the reply in the thread composer
4. Notify the team member to review and send manually

The draft sits in the composer. No email is sent until a human clicks Send.

---

## 4. Reply to Customer (Direct Send)

**Goal**: Send a reply immediately. Use only when confident and authorized.

1. Call `get_thread_detail` to read full context
2. Call `search_docs` to verify any product claims
3. Call `send_reply` to send the email

This is irreversible. Double-check recipients and content. Prefer workflow #3 when possible.

---

## 5. Transition a Company State

**Goal**: Move a company through the sales pipeline.

1. Call `get_company_detail` to review current state and context
2. Call `get_transition_paths` to see available transitions and obtain the exact `to_state_class` value
3. Call `transition_company` using the class name from step 2

Never hardcode or guess `to_state_class` values. Always get fresh transition paths — available transitions depend on current state. Some transitions may trigger automations.

---

## 6. Snooze / Wake a Thread

**Goal**: Temporarily hide a thread until a specific date.

**To snooze**: Call `change_thread_state` with `action: "snooze"`, `snooze_until: "2025-04-15"`, `snooze_reason: "Waiting for contract signature"`

**To wake early**: Call `change_thread_state` with `action: "wake"`

**To close**: Call `change_thread_state` with `action: "close"`

**To reopen**: Call `change_thread_state` with `action: "reopen"`

---

## 7. Company Deep Dive

**Goal**: Build a complete picture of a company before a call or decision.

1. Call `get_company_detail` for contact info, state, manager, notes
2. Read `company_threads` resource for all email/ticket history
3. Read `company_bookings` resource for booking activity
4. Call `list_company_rentals` with `include_channels: true` for properties and distribution
5. Call `search_guests` for guest profiles (if relevant)

---

## 8. Debug a Booking or Rental Issue

**Goal**: Investigate a customer's booking/rental problem.

1. Call `search_bookings` to find the booking by reference, guest name, or ID
2. Call `get_booking_detail` for pricing, payments, check-in status, notes
3. Call `get_rental_detail` for property config, amenities, door codes, legal details
4. Call `search_docs` to look up relevant help articles or backend behavior
5. Call `save_draft` or `send_reply` to respond to the customer

---

## 9. Link Related Threads

**Goal**: Connect threads that discuss the same topic or issue.

1. Call `search_threads` to find the related thread(s)
2. Call `link_threads` to link them together

Both threads will show the link in their detail view.

---

## 10. Research Before Replying

**Goal**: Find accurate product information before responding to a customer.

1. Call `search_docs` with `repo: "ninja-docs"` for help center articles (customer-facing)
2. Call `search_docs` with `repo: "ninja"` for backend code/DB technical details
3. Call `search_docs` with `repo: "rentals-united-docs"` for channel manager API docs
4. Compose the reply using verified information only
