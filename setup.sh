#!/bin/bash
set -eo pipefail

# ============================================================
# Rental Ninja CRM Agent — Mac Setup Script
#
# DISTRIBUTION:
#   1. Paste your GitHub PAT into the PAT= line below
#   2. Send this file to team members (Slack, email, etc.)
#   3. They run: bash setup.sh
#
# The PAT placeholder is committed to the repo. The version
# you distribute (with the real PAT) is NOT committed.
# ============================================================

REPO="rental-ninja/rental-ninja-crm-agent"
INSTALL_DIR="$HOME/rental-ninja-crm-agent"
CRON_LABEL="# rental-ninja-auto-update"
LOG_FILE="/tmp/ninja-update.log"

# ⚠️  Pol: paste your fine-grained PAT below (read-only, contents only, scoped to this repo).
#    This is a SHARED read-only token — safe to distribute. Team members never see it.
#    Generate at: GitHub → Settings → Developer settings → Fine-grained PATs
PAT="__PASTE_YOUR_PAT_HERE__"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[+]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[x]${NC} $1"; exit 1; }

# --- Banner ---
echo ""
echo "================================================"
echo "  Rental Ninja CRM Agent — Setup"
echo "================================================"
echo ""

# --- Validate PAT ---
if [ "$PAT" = "__PASTE_YOUR_PAT_HERE__" ]; then
    error "Setup script not configured yet. Ask Pol — he needs to add the access token to this script before distributing it."
fi

# --- Pre-checks ---
command -v git &>/dev/null || error "git is not installed. Run: xcode-select --install"
command -v node &>/dev/null || error "Node.js is not installed. Install from https://nodejs.org"

if ! command -v claude &>/dev/null; then
    warn "Claude Code CLI not found. Installing..."
    npm install -g @anthropic-ai/claude-code || error "Failed to install Claude Code.\nTry: sudo npm install -g @anthropic-ai/claude-code\nOr ask Pol for help."
fi

# --- Clone or update repo ---
if [ -d "$INSTALL_DIR/.git" ]; then
    info "Repo already exists at $INSTALL_DIR — updating..."
    cd "$INSTALL_DIR"
    git fetch origin main 2>/dev/null || error "Failed to fetch updates. Check your internet connection.\nIf the problem persists, your access token may have expired — ask Pol."
    git reset --hard origin/main || error "Failed to update to latest version.\nTry deleting $INSTALL_DIR and re-running setup."
else
    info "Cloning repo to $INSTALL_DIR..."
    if ! git clone "https://x-access-token:${PAT}@github.com/${REPO}.git" "$INSTALL_DIR" 2>/dev/null; then
        error "Failed to clone repository. Check your internet connection.\nIf the problem persists, your access token may be invalid — ask Pol."
    fi
    cd "$INSTALL_DIR"
fi

# Store PAT in remote URL for future pulls (cron needs it)
git remote set-url origin "https://x-access-token:${PAT}@github.com/${REPO}.git"
chmod 700 "$INSTALL_DIR/.git"
warn "Your access token is stored in $INSTALL_DIR/.git/config — do not share this folder."

# --- Configure .env ---
if [ ! -f "$INSTALL_DIR/.env" ]; then
    echo ""
    read -sp "Enter your Hub API token (ask Pol if you don't have one): " hub_token < /dev/tty
    echo ""
    if [ -z "$hub_token" ] || [ ${#hub_token} -lt 10 ]; then
        error "Token looks invalid (empty or too short). Ask Pol for your HUB_MCP_TOKEN."
    fi
    (umask 077 && echo "HUB_MCP_TOKEN=${hub_token}" > "$INSTALL_DIR/.env")
    info "Saved token to .env"
else
    if ! grep -q "HUB_MCP_TOKEN=.\+" "$INSTALL_DIR/.env" 2>/dev/null; then
        warn ".env exists but may have an empty token. Delete $INSTALL_DIR/.env and re-run setup if you have issues."
    else
        info ".env already exists — skipping token setup"
    fi
fi

# --- Install auto-update cron (every hour) ---
CRON_CMD="cd \"$INSTALL_DIR\" && git fetch origin main >> \"$LOG_FILE\" 2>&1 && git reset --hard origin/main >> \"$LOG_FILE\" 2>&1 || echo \"[\$(date)] Update failed\" >> \"$LOG_FILE\""

# Atomic: remove old entry + add new one in a single pipeline
( crontab -l 2>/dev/null | grep -v "$CRON_LABEL" || true; echo "0 * * * * $CRON_CMD $CRON_LABEL" ) | crontab - || error "Failed to install auto-update cron job.\nYou can update manually: cd $INSTALL_DIR && git pull"

# Verify cron was installed
if crontab -l 2>/dev/null | grep -q "$CRON_LABEL"; then
    info "Auto-update cron installed (runs every hour, logs to $LOG_FILE)"
else
    warn "Cron job may not have installed correctly. You can update manually: cd $INSTALL_DIR && git pull"
fi

# --- Create launcher alias ---
case "$SHELL" in
    */zsh)  SHELL_RC="$HOME/.zshrc" ;;
    */bash) SHELL_RC="$HOME/.bashrc" ;;
    */fish)
        warn "Fish shell detected. Add this alias manually:"
        echo "  alias ninja 'cd $INSTALL_DIR; and claude'"
        SHELL_RC=""
        ;;
    *)
        warn "Unknown shell ($SHELL). Add this alias manually:"
        echo "  alias ninja='cd $INSTALL_DIR && claude'"
        SHELL_RC=""
        ;;
esac

ALIAS_LINE="alias ninja='cd $INSTALL_DIR && claude'"
if [ -n "$SHELL_RC" ]; then
    if ! grep -q "alias ninja=" "$SHELL_RC" 2>/dev/null; then
        echo "" >> "$SHELL_RC"
        echo "# Rental Ninja CRM Agent" >> "$SHELL_RC"
        echo "$ALIAS_LINE" >> "$SHELL_RC"
        info "Added 'ninja' command to $SHELL_RC"
    else
        info "'ninja' alias already exists in $SHELL_RC"
    fi
fi

# --- Post-condition checks ---
PROBLEMS=0
[ ! -d "$INSTALL_DIR/.git" ] && warn "Repository not found at $INSTALL_DIR" && PROBLEMS=1
[ ! -f "$INSTALL_DIR/.env" ] && warn ".env file is missing" && PROBLEMS=1
command -v claude &>/dev/null || { warn "Claude Code CLI not found in PATH"; PROBLEMS=1; }

if [ "$PROBLEMS" -gt 0 ]; then
    echo ""
    error "Setup completed with errors (see warnings above). Ask Pol for help."
fi

# --- Done ---
echo ""
echo "================================================"
echo -e "  ${GREEN}Setup complete!${NC}"
echo "================================================"
echo ""
echo "  To start:  Open a new terminal and type: ninja"
echo "  Or run:    cd $INSTALL_DIR && claude"
echo ""
echo "  Auto-updates: Every hour (pulls latest code)"
echo "  Update log:   $LOG_FILE"
echo "  Your token:   Stored in $INSTALL_DIR/.env"
echo ""
