---
name: setup-hub
description: Set up or update the Rental Ninja CRM plugin and CLAUDE.md instructions. Run this once after installing the plugin, or anytime to check for updates.
---

# Setup Hub — Plugin & CLAUDE.md Updater

Keeps the Rental Ninja CRM plugin and project instructions up to date.

## Workflow

### 1. Update the plugin

Installed plugin info:
!`claude plugin list 2>&1 | grep -A3 "rental-ninja-crm" || echo "Plugin not found in installed list"`

Run `claude plugin update rental-ninja-crm` (append the `@marketplace` suffix from the info above if present).

**If the plugin was updated**: tell the user the plugin was updated and they should **restart Claude Code** (or run `/reload-plugins`) to apply the new version.

**If already up-to-date**: continue to step 2.

**If plugin not found or command fails**: show the user the error output, then continue to step 2 anyway (CLAUDE.md setup still works independently).

### 2. Check current CLAUDE.md version

Read `CLAUDE.md` in the current working directory (if it exists). Look for a `<!-- setup-version: xxx -->` HTML comment to extract the current version hash.

### 3. Fetch setup instructions

Call `get_setup_instructions` from the hub MCP server:
- If a version was found in step 2, pass it as `current_version`
- If no `CLAUDE.md` exists or no version comment found, call without `current_version`

### 4. Handle response

**If up-to-date** (tool says current version matches): tell the user their setup is already current. Done.

**If new content returned**: write the content to `CLAUDE.md` in the current working directory (overwrite if exists, create if not). Tell the user:
- That `CLAUDE.md` was written/updated
- The new version hash

## Notes

- This skill writes to `CLAUDE.md` in the **current working directory**, not the plugin directory
- The version comment inside `CLAUDE.md` is managed by the server — don't modify it manually
- Run `/setup-hub` anytime to check for both plugin and CLAUDE.md updates
