---
description: Thread lookup with full context and actions
---

Analyze thread `$ARGUMENTS` (thread ID or ticket number).

## Gather Context

Use sub-agents to gather in parallel:
- Full thread messages — read carefully for issue, status, sentiment, key details
- Company info — state, manager, notes, follow-up dates
- Related threads for the same company
- Any referenced bookings, rentals, or guests (if mentioned in messages)

## Present Brief

- **Thread**: #ID — subject — state
- **Company**: name (#ID) — state — manager
- **Assigned to**: name or unassigned
- **Issue**: 2-3 sentence summary
- **Status**: who owes the next action (us / them / third party) + since when
- **Sentiment**: frustrated / neutral / positive / urgent
- **Key details**: booking refs, rental names, error messages, dates
- **Related threads**: from same company, with one-line context
- **Missing info**: what we'd need to resolve this
- **Recommended action**: what to do next

## Offer Actions

1. **Draft reply** — context-aware draft matching customer's language
2. **Escalate** — escalation brief as thread note, link related threads, offer to assign and optionally create RU ticket
3. **Follow-up** — snooze to a date, company note with follow-up date, link related threads, @mention assignee/manager
4. **Assign / reassign**
5. **Close / snooze / reopen**
6. **Research deeper** — fan out across all sources

Ask: which action?
