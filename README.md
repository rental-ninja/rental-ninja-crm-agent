# Rental Ninja CRM Agent

A Claude Code project for operating the Rental Ninja CRM. Clone this repo, add your API token, and use Claude Code to manage inbox threads, reply to customers, and advance companies through the sales pipeline.

No Docker. No codebase. Just an API token.

## Prerequisites

- macOS
- Node.js 18+ — check with `node --version`, install from https://nodejs.org if missing

## Setup

### For team members

1. **Get the setup script** from Pol (he'll send you the file or a download link)
2. **Open Terminal** and run:

```bash
bash /path/to/setup.sh
```

3. It will ask for your **Hub API token** (Pol will give you one)
4. Once done, open a **new terminal** and type:

```bash
ninja
```

That's it. The agent auto-updates every hour.

### For Pol (admin)

1. Create a fine-grained PAT at GitHub → Settings → Developer settings → Fine-grained PATs
   - Scope: `rental-ninja/rental-ninja-crm-agent` only
   - Permission: Contents → Read-only
2. Paste the PAT into `setup.sh` (replace `__PASTE_YOUR_PAT_HERE__`)
3. Send `setup.sh` to team members (Slack, email, etc.) — the PAT is read-only, safe to share
4. Generate a `HUB_MCP_TOKEN` for each team member in Hub

## What You Can Do

| Task | Example prompt |
|------|----------------|
| Check inbox | `/triage` |
| Thread lookup | `/thread 1234` → then pick an action (draft, escalate, follow-up, assign…) |
| Research | `/research 1234` or `/research "Company Name"` |
| Triage email | "Read thread #1234 and assign it" |
| Move pipeline | "Transition options for company #56?" |
| Debug booking | "Look up booking REF-12345 for company #56" |
| Snooze thread | "Snooze thread #1234 until next Monday" |

## What's Inside

```
rental-ninja-crm-agent/
├── CLAUDE.md                          # CRM operator persona + safety rules + tool reference
├── .mcp.json                          # Hub MCP server connection
├── README.md                          # This file
├── .claude/
│   ├── settings.json                  # Auto-approve safe tools
│   ├── agents/
│   │   └── hub-crm-operator.md        # Autonomous triage agent
│   └── commands/
│       ├── triage.md                  # /triage — prioritized inbox processing
│       ├── thread.md                  # /thread — lookup + action menu
│       ├── research.md                # /research — deep-dive investigation
│       └── help.md                    # /help — quick reference card
├── .gitignore
└── .env.example
```

## Safety

- **21 tools auto-approved**: All read-only and idempotent operations run without prompting
- **2 tools require confirmation**: `send_reply` (sends email) and `transition_company` (changes CRM state) always ask first
- Claude defaults to saving drafts instead of sending emails directly

## Troubleshooting

**"MCP server not connecting"**
- Verify `HUB_MCP_TOKEN` is set: `echo $HUB_MCP_TOKEN`
- Verify Node.js is installed: `node --version` (need 18+)
- Try running the MCP command directly: `npx -y mcp-remote https://rental-ninja.com/hub/mcp --header "Authorization: Bearer $HUB_MCP_TOKEN"`

**"Permission denied" or "Unauthorized"**
- Your API token may be expired or revoked
- Generate a new token from Hub account settings

**"Tool not found"**
- The MCP server may be unreachable — check your internet connection
- Verify the Hub instance is running
