---
name: setup-hub
description: Set up or update the CLAUDE.md project instructions for Rental Ninja CRM. Run this once after installing the plugin, or anytime to check for updates.
---

# Setup Hub — CLAUDE.md Installer

Automatically configure the current project's `CLAUDE.md` with Rental Ninja CRM instructions by calling the hub MCP server for the latest content.

## Workflow

### 1. Check current version

Read `CLAUDE.md` in the current working directory (if it exists). Look for a `<!-- setup-version: xxx -->` HTML comment to extract the current version hash.

### 2. Fetch setup instructions

Call `get_setup_instructions` from the hub MCP server:
- If a version was found in step 1, pass it as `current_version`
- If no `CLAUDE.md` exists or no version comment found, call without `current_version`

### 3. Handle response

**If up-to-date** (tool says current version matches): tell the user their setup is already current. Done.

**If new content returned**: write the content to `CLAUDE.md` in the current working directory (overwrite if exists, create if not). Tell the user:
- That `CLAUDE.md` was written/updated
- The new version hash

## Notes

- This skill writes to `CLAUDE.md` in the **current working directory**, not the plugin directory
- The version comment inside `CLAUDE.md` is managed by the server — don't modify it manually
- Run `/ninja-hub:setup-hub` anytime to check for updates after a plugin upgrade
