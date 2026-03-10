#!/bin/bash
# Check if HUB_MCP_TOKEN is available via shell env or Claude Code settings

# Already in environment — nothing to do
[ -n "$HUB_MCP_TOKEN" ] && exit 0

# Check ~/.claude/settings.json
if [ -f "$HOME/.claude/settings.json" ] && grep -q '"HUB_MCP_TOKEN"' "$HOME/.claude/settings.json" 2>/dev/null; then
  exit 0
fi

# Token not found — tell Claude to handle setup
cat <<'EOF'
HUB_MCP_TOKEN is not configured. This is likely the user's first session.

Ask the user to provide their Hub API token (they should ask Pol if they don't have one). Once they give you the token:

1. Read ~/.claude/settings.json (create it if it doesn't exist)
2. Add their token under the "env" key: {"env": {"HUB_MCP_TOKEN": "<token>"}}
3. Preserve any existing settings in the file
4. Tell them to restart Claude Code so the MCP server connects with the new token
EOF