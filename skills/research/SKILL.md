---
name: research
description: Deep-dive investigation on a thread, company, or topic
argument-hint: Thread ID, company ID/name, or topic keyword
---

Research `$ARGUMENTS` (thread ID, company ID/name, or topic keyword).

## Gather

Identify the target (thread, company, or keyword). Resolve the primary entity first (e.g. fetch thread to get company ID), then fan out with parallel sub-agents across all relevant sources: company info, bookings, rentals, documentation, and related threads. Cast a wide net.

## Synthesize

Present a structured brief:

- **Subject**: what was researched
- **Company**: name, ID, state, manager (if applicable)
- **Thread history**: relevant threads summary
- **Key findings**: from docs, bookings, rentals
- **Documentation refs**: relevant articles found
- **Booking/rental context**: if applicable
- **Open questions**: unresolved items
- **Recommended next steps**: actionable items
