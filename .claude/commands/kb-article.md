---
description: Generate a KB article from a resolved thread
---

Generate a knowledge base article from resolved thread `$ARGUMENTS`.

## Steps

1. `get_thread_detail` — verify resolved (closed or clear resolution in messages)
2. If not resolved → warn and stop
3. `get_company_detail` for context
4. `search_docs` repo=`ninja-docs` — check for existing similar articles
5. If similar exists → report it, ask whether to proceed
6. Compose KB article:

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

7. Present in code block for copying
8. `add_thread_note` documenting KB article was drafted
9. Suggest which `ninja-docs` section it belongs in
