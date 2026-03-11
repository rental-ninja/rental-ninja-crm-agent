---
name: file-bug
description: File a Linear bug issue from a CRM thread or freeform description. Use when the user says "file bug", "linear issue", "create bug", "report bug", or when a thread reveals a platform bug.
argument-hint: "<thread-id> or freeform bug description"
---

# File Bug — Linear Issue Creator

Create Linear bug issues from CRM threads or freeform descriptions.

**Requires:** `linear` MCP (issue creation, OAuth per user) and `hub` MCP (thread context + cross-linking). Both must be configured in `.mcp.json`.

## Workflow

### 1. Gather context + discover Linear targets

Run these in parallel:

**Thread context** (if thread ID provided): spawn a sub-agent to fetch thread detail + company via hub MCP tools. Extract the bug summary, repro steps, affected company/rental/booking, and any error messages.

**Linear discovery** (always): call `list_teams`, `list_projects`, and `list_issue_labels` in parallel to find the appropriate team, best-matching project, and `Bug` label.

If freeform description with no thread ID: skip the thread fetch, use what the user provided directly.

### 2. Compose the issue

Build the issue with:

- **Title**: concise, prefixed with area (e.g. `[Calendar] Double-booking on overlapping reservations`)
- **Description** (markdown):
  - Summary of the bug
  - Repro steps (if available from thread)
  - Expected vs actual behavior
  - CRM thread link: `https://rental-ninja.com/hub/threads/{thread_id}` (if from a thread)
  - Affected company/rental/booking refs
- **Priority**: map from assessment:
  - P1 → `1` (Urgent)
  - P2 → `2` (High)
  - P3 → `3` (Normal)
  - P4 → `4` (Low)
- **Label**: `Bug`
- **Team + Project**: from discovery step

### 3. Confirm with user

Present the proposed issue clearly:

```
**Linear Issue Preview**
- Title: [Area] Bug title
- Team: <team name>
- Project: <project name>
- Priority: P3 (Normal)
- Label: Bug

**Description:**
<full description>
```

Ask for confirmation before creating. This is a destructive operation — never auto-create.

### 4. Create and cross-link

1. Create the issue via `save_issue`
2. If sourced from a thread: add a hub thread note linking to the new Linear issue:
   ```html
   <p>Linear issue created: <a href="{issue_url}">{issue_identifier} — {title}</a></p>
   <p style="color:#888;font-size:11px;">🤖 CRM-AI-Agent</p>
   ```

Report the Linear issue URL and identifier to the user.

## Safety

- **Always confirm** before creating the issue
- **Never retry** on error — investigate instead
- **Tag notes** with the AI agent footer per hub conventions
- If Linear MCP is not connected, tell the user to restart Claude Code — OAuth browser flow triggers on first use
