# Rental Ninja CRM Agent

A Claude Code plugin for operating the Rental Ninja CRM. Manage inbox threads, reply to customers, research bookings, and advance companies through the sales pipeline — all from Claude.

## Install

You need two things from Pol:
- **Marketplace URL** — a long link he'll send you (just copy-paste it, no GitHub account needed)
- **Hub API token** — your personal CRM access token

You also need Claude Code. If you have the Claude desktop app, you already have it — just open Terminal and type `claude` to check. If not, install it with:

```
brew install --cask claude-code
```

### Step 1: Open Claude Code and add the marketplace

Open Terminal, type `claude`, and press Enter. Once Claude Code opens, type:

```
/plugin marketplace add <paste the marketplace URL Pol sent you>
```

You only need to do this once.

### Step 2: Install the plugin

```
/plugin install ninja-hub
```

### Step 3: Set up your token

Close Claude Code (Ctrl+C) and open it again. Claude will notice your token is missing and ask you to paste it in the chat. Just paste the token Pol gave you and press Enter — Claude saves it for you.

Close and reopen Claude Code one last time so the CRM connection activates.

### You're done

Type `/ninja-hub:help` to see what you can do. The plugin keeps itself up to date.

If something isn't working, check the [Troubleshooting](#troubleshooting) section below or ask Pol.

## Commands

| Command | What it does |
|---------|-------------|
| `/ninja-hub:triage` | Shows your inbox sorted by priority — emails, snoozed threads, RU tickets |
| `/ninja-hub:thread 1234` | Pulls up a thread with full context, then offers actions (reply, escalate, snooze, etc.) |
| `/ninja-hub:research 1234` | Deep investigation on a thread, company, or topic |
| `/ninja-hub:help` | Quick reference card |

You can also just ask in plain language:

- "What's going on with thread 1057?"
- "Assign thread 1234 to Sarah"
- "Look up booking REF-12345 for company 56"
- "Snooze thread 1234 until next Monday"

## Safety

- Most CRM tools (reading threads, searching, adding notes, etc.) run automatically
- Three actions always ask for your confirmation first:
  - **Sending an email** to a customer — Claude drafts first, you review before sending
  - **Changing a company's pipeline stage** — may trigger automated emails
  - **Creating a Rentals United ticket** — sends to RU support

---

## Admin Guide

Everything below is for Pol / whoever manages the plugin.

### Marketplace & PAT

Already set up:
- **Marketplace repo**: `rental-ninja/claude-plugins-marketplace` (public)
- **Plugin repo**: `rental-ninja/ninja-hub-agent` (private)
- **PAT**: fine-grained, read-only Contents on the plugin repo, owned by `rental-ninja` org

The marketplace repo has a plain URL in `marketplace.json` (no secrets). The PAT is only in the URL you send to team members:

```
https://x-access-token:<PAT>@github.com/rental-ninja/claude-plugins-marketplace.git
```

Team members paste this URL when they run `/plugin marketplace add`. The PAT gives them read access to the private plugin repo. It never gets stored in any repo.

### Releasing a new version

1. Make your changes (skills, agents, CLAUDE.md, settings, etc.)
2. Bump `version` in `.claude-plugin/plugin.json`
3. Commit and push to `main`

Team members get the update on their next session.

### Adding a new team member

1. Generate a `HUB_MCP_TOKEN` for them in Hub
2. Send them: the marketplace URL (with PAT embedded) + their token
3. Point them to the [Install](#install) section above

### Plugin structure

```
ninja-hub-agent/
├── .claude-plugin/
│   └── plugin.json               # Plugin manifest (name, version)
├── CLAUDE.md                     # CRM operator persona + safety rules
├── .mcp.json                     # Hub MCP server connection
├── settings.json                 # Auto-approved tool permissions
├── skills/
│   ├── triage/SKILL.md           # /ninja-hub:triage
│   ├── thread/SKILL.md           # /ninja-hub:thread
│   ├── research/SKILL.md         # /ninja-hub:research
│   └── help/SKILL.md             # /ninja-hub:help
├── agents/
│   └── hub-crm-operator.md       # Sub-agent for autonomous CRM tasks
└── hooks/
    ├── hooks.json                # Hook definitions
    └── check-token.sh            # First-run token setup
```

## Troubleshooting

**CRM tools not working / "MCP server not connecting"**
1. Make sure you completed the token setup (Step 3 above)
2. Try closing and reopening Claude Code
3. If it still doesn't work, ask Pol to check your token is valid

**"Permission denied" or "Unauthorized"**
- Your token may have expired — ask Pol for a new one

**Commands not showing up**
- Make sure the plugin is installed: type `/plugin` and check the list
- Try updating: `/plugin update ninja-hub`
