# Rental Ninja CRM Agent

A Claude Code project for operating the Rental Ninja CRM. Clone this repo, add your API token, and use Claude Code to manage inbox threads, reply to customers, and advance companies through the sales pipeline.

No Docker. No codebase. Just an API token.

## Prerequisites

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed
- Node.js 18+ (for `npx mcp-remote`)

## Setup

### 1. Clone

```bash
git clone https://github.com/nicobatllo/rental-ninja-crm-agent.git
cd rental-ninja-crm-agent
```

### 2. Get your API token

Go to your Hub account settings and generate a new API token.

### 3. Set the token

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export HUB_MCP_TOKEN="your-api-token-here"
```

Then reload: `source ~/.zshrc`

Alternatively, create a `.env` file (gitignored):

```bash
cp .env.example .env
# Edit .env with your token
```

### 4. Start Claude Code

```bash
claude
```

Claude will connect to the Hub MCP server automatically.

## What You Can Do

| Task | Example prompt |
|------|----------------|
| Check inbox | "What needs attention today?" or `/triage` |
| Triage email | "Read thread #1234 and assign it" |
| Reply to customer | "Draft a reply to thread #1234" |
| Research company | "Give me a full overview of company #56" |
| Move pipeline | "What are the transition options for company #56?" |
| Debug booking | "Look up booking REF-12345 for company #56" |
| Snooze thread | "Snooze thread #1234 until next Monday" |

## What's Inside

```
rental-ninja-crm-agent/
├── CLAUDE.md                          # CRM operator persona
├── .mcp.json                          # Hub MCP server connection
├── README.md                          # This file
├── .claude/
│   ├── settings.json                  # Auto-approve safe tools
│   ├── skills/hub-mcp/
│   │   ├── SKILL.md                   # Tool quick-ref + decision tree
│   │   └── references/
│   │       ├── tool-catalog.md        # All 23 tools: params, returns, tips
│   │       ├── resource-catalog.md    # All 6 resources: URIs, shapes
│   │       ├── workflows.md           # 10 step-by-step CRM recipes
│   │       └── safety.md             # Destructive tool guardrails
│   ├── agents/
│   │   └── hub-crm-operator.md        # Autonomous triage agent
│   └── commands/
│       └── triage.md                  # /triage inbox command
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
