---
description: Generate a KB article from a resolved thread
---

Generate a knowledge base article from resolved thread `$ARGUMENTS`.

## Phase 1 — Thread context (sub-agent)

- **Agent A**: `get_thread_detail` + identify company → `get_company_detail` + `search_docs` repo=`ninja-docs` for existing similar articles. Return: company_id, company context, resolution status (resolved/unresolved), problem description, solution applied, key steps taken, existing similar article titles and summaries.

## Phase 2 — Compose (main context)

From Agent A's summary:

1. If not resolved → warn and stop
2. If similar article exists → report it, ask whether to proceed
3. Compose KB article:

```
# [Title — what customer would search for]

## Problem

## Cause (if applicable)

## Solution (numbered steps)

## Additional Notes (edge cases)

## Related (doc links found)

---
*Source: Thread #ID — resolved YYYY-MM-DD*
```

4. Present in code block for copying
5. `add_thread_note` documenting KB article was drafted
6. Suggest which `ninja-docs` section it belongs in
