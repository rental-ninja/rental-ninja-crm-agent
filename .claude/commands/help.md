---
description: Show available commands, capabilities, and safety rules
---

Print the following reference card exactly (no MCP calls, no sub-agents):

---

## Rental Ninja CRM Operator — Quick Reference

AI-powered CRM operator for managing inbox, customers, bookings, and sales pipeline.

### Commands

| Command | Description |
|---------|-------------|
| `/triage` | Prioritize & process inbox (emails, snoozed, RU tickets) |
| `/thread <id>` | Thread lookup with full context — then offers actions (draft, escalate, follow-up, assign, etc.) |
| `/research <id\|name\|topic>` | Deep-dive investigation on a thread, company, or topic |
| `/help` | This reference card |

### Direct Capabilities

You can ask me to do any of these without a slash command:

- **Search** — companies, threads, bookings, rentals, guests
- **Thread management** — assign/reassign, close/snooze/reopen, link related threads
- **Internal notes** — add thread or company notes with @mentions
- **Documentation** — look up `ninja-docs`, `ninja`, `rentals-united-docs`, `ninja_app`, `ninja_app_client`
- **Debug pricing/min-stay** — check rental config + rate calendar
- **Transition company state** — advance pipeline stage (requires confirmation)
- **Send reply** — email customer directly (requires confirmation)
- **Create RU ticket** — open Rentals United support ticket (requires confirmation)

### Safety Reminders

Three operations are **destructive and irreversible** — I will always ask for confirmation:

1. **`send_reply`** — sends email to customer. I draft first by default.
2. **`transition_company`** — changes company state. May trigger automations.
3. **`create_ru_ticket`** — sends email to RU support.

Internal notes are **team-only** — customers never see them.

---
