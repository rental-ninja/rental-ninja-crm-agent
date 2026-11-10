---
name: file-bug
description: File a Kaneo bug task from a CRM thread or freeform description. Use when the user says "file bug", "create bug", "report bug", "kaneo task", or when a thread reveals a platform bug.
argument-hint: "<thread-id> or freeform bug description"
---

# File Bug — Kaneo Task Creator

Create Kaneo bug tasks (https://kaneo.rental-ninja.com) from CRM threads or freeform descriptions.

**Requires:** `kaneo` MCP (task creation, OAuth per user, one sign-in every 30 days) and `hub` MCP (thread context + cross-linking). Both must be configured in `.mcp.json`.

## Workflow

### 1. Gather context + discover Kaneo targets

Run these in parallel:

**Thread context** (if thread ID provided): spawn a sub-agent to fetch thread detail + company via hub MCP tools. Extract the bug summary, repro steps, affected company/rental/booking, and any error messages.

**Kaneo discovery** (always):

1. Pick the project by its slug. `RN` (Dev Team, workspace "Rental Ninja") is the default. Use `CAS` or `PIR` (workspace "Castells & Pirabot") or `MAR` (workspace "Marketing & sales") only when the bug is about those.
2. Call `list_workspaces`, then `list_projects` with that workspace's `id`, and take the project whose `slug` matches. Never take the first project: "Rental Ninja" also holds `SAN` (Sandbox).
3. Call these in parallel for that project:
   - `list_project_columns`: the status is the `slug` of the lowest-`position` column with `isFinal: false` (`todo` in RN).
   - `list_project_custom_fields`: the dropdown field named `Project`.
   - `list_workspace_labels` with the project's `workspaceId`: the `Bug` label.

**Project field**: use the current quarter's **General Development** option, named `QX-YY General Development` (X = quarter 1–4, YY = 2-digit year, e.g. `Q2-26 General Development` for Q2 2026). Look for it in the `Project` field's `options`. Kaneo's MCP can't add dropdown options: if the field or the option is missing, leave the field empty and say so in the preview. Someone adds the option in Kaneo's project settings.

**Bug label**: `list_workspace_labels` returns the workspace's labels plus one row for every label on every task. Use only the row named exactly `Bug` with `taskId: null`. Attaching a row that has a `taskId` moves that label off the other task. In RN the result is too large to return, so Claude Code saves it to a file: search that file for the `Bug` entry whose `taskId` is `null`. If there is none, the label is created in step 4.

If freeform description with no thread ID: skip the thread fetch, use what the user provided directly.

### 2. Compose the task

Build the task with:

- **Title**: concise, prefixed with area (e.g. `[Calendar] Double-booking on overlapping reservations`)
- **Description** (markdown):
  - Summary of the bug
  - Repro steps (if available from thread)
  - Expected vs actual behavior
  - CRM thread link: `https://rental-ninja.com/hub/threads/{thread_id}` (if from a thread)
  - Affected company/rental/booking refs
- **Priority**: map from assessment:
  - P1 → `urgent`
  - P2 → `high`
  - P3 → `medium`
  - P4 → `low`
- **Label**: `Bug`
- **Project**: `RN` unless the bug is about CAS, PIR or MAR
- **Project field**: the current quarter's `QX-YY General Development`, or empty when the option is missing
- **Status**: the first open column from discovery

### 3. Confirm with user

Present the proposed task clearly:

```
**Kaneo Task Preview**
- Title: [Area] Bug title
- Project: RN (Dev Team)
- Project field: QX-YY General Development
- Priority: P3 (medium)
- Label: Bug
- Status: Todo

**Description:**
<full description>
```

When the option is missing, show `Project field: empty (no "QX-YY General Development" option in Kaneo)`.

Ask for confirmation before creating. Never auto-create.

### 4. Create and cross-link

1. Create the task via `create_task` with `projectId`, `title`, `description`, `priority` and `status`.
2. Label it:
   - If the `Bug` row with `taskId: null` exists: `attach_label_to_task` with that row's `id` and the new task's `id`.
   - If it doesn't: `create_label` with `name: "Bug"`, `color: "#eb5757"` and the `workspaceId`, without `taskId`, then attach it the same way.
3. If the quarter's option exists: `set_task_custom_field_value` with the `Project` field's `id`, the task's `id` and the option name as `value`.
4. Build the ticket ID and the URL. The `workspaceId`, `projectId` and `slug` come from discovery; `id` and `number` come from the task `create_task` returns (if `number` is missing, read it with `get_task`):
   - Ticket ID: the project's `slug`, a hyphen and the task's `number`, e.g. `RN-4728`.
   - URL: `https://kaneo.rental-ninja.com/dashboard/workspace/{workspaceId}/project/{projectId}/task/{id}`
5. If sourced from a thread: add a hub thread note linking to the new Kaneo task:
   ```html
   <p>Kaneo task created: <a href="{task_url}">{ticket_id} — {title}</a></p>
   <p style="color:#888;font-size:11px;">🤖 CRM-AI-Agent</p>
   ```

Report the Kaneo ticket ID and URL to the user.

## Safety

- **Always confirm** before creating the task
- **Never retry** on error — investigate instead. If the task exists but the label or the field failed, never create the task again: report what is missing.
- **Tag notes** with the AI agent footer per hub conventions
- If the Kaneo tools are missing or answer unauthorized, the `kaneo` server needs a one-time sign-in: `/mcp` → kaneo → Authenticate, or `claude mcp login plugin:rental-ninja-crm:kaneo` in a terminal. The sign-in lasts 30 days.
