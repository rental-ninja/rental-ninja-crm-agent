# Rental Ninja CRM Agent

A Claude Code plugin for operating the Rental Ninja CRM. Manage inbox threads, reply to customers, research bookings, and advance companies through the sales pipeline — all from Claude.

## Install

You need two things from Pol:
- **Marketplace URL** — a link he'll send you (just copy-paste it, no GitHub account needed)
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

### Step 4: Set up your project

Navigate to the folder where you'll use the CRM (e.g. your work directory), open Claude Code there, and run:

```
/ninja-hub:setup-hub
```

This creates a `CLAUDE.md` file that tells Claude to use the CRM tools when you ask about work stuff. Run it again anytime to check for updates.

### You're done

Type `/ninja-hub:hub help` to see what you can do. The plugin keeps itself up to date.

If something isn't working, check the [Troubleshooting](#troubleshooting) section below or ask Pol.

## Commands

| Command | What it does |
|---------|-------------|
| `/ninja-hub:hub triage` | Shows your inbox sorted by priority — emails, snoozed threads, RU tickets |
| `/ninja-hub:hub thread 1234` | Pulls up a thread with full context, then offers actions (reply, escalate, snooze, etc.) |
| `/ninja-hub:hub research 1234` | Deep investigation on a thread, company, or topic |
| `/ninja-hub:hub help` | Quick reference card |
| `/ninja-hub:accounting <query>` | Investigate payouts, settlements, payee strategies, and discrepancies |
| `/ninja-hub:blog-post <topic>` | Writes a multilingual blog article grounded in the Hub (changelog, docs, real threads) and saves an `.html` file to upload at `/admin/blog/import` in the CMS |
| `/rental-ninja-crm:video <topic>` | Makes an animated Rental Ninja video (in-app campaign 16:9, Instagram/Facebook 9:16, 1:1, 4:5) narrated and scored through the Hub and rendered to MP4 on your Mac, then publishes it to the Hub media library — see [Videos](#videos-mac) |
| `/rental-ninja-crm:marketing-campaigns <goal>` | Drafts a campaign (in-app popup, push, email) from the marketing context and manages it — see [Marketing](#marketing) |
| `/rental-ninja-crm:marketing-review weekly` | Reviews the active campaigns and writes postmortems as Hub notes; built to run weekly on a schedule — see [Marketing](#marketing) |

You can also just ask in plain language:

- "What's going on with thread 1057?"
- "Assign thread 1234 to Sarah"
- "Look up booking REF-12345 for company 56"
- "Snooze thread 1234 until next Monday"

## Videos (Mac)

`/rental-ninja-crm:video` turns a feature or campaign idea into an animated video in the Rental Ninja house style (flat illustration, brand colours, logo watermark, captions): in-app campaign videos (16:9) and Instagram/Facebook Reels, Stories and feed posts (9:16, 1:1, 4:5). Claude writes the script and the animation; you approve the feature list, the script, the narration and the drafts. The MP4s land in a folder you choose — we suggest `~/Videos/rn-films/<name>`.

**Before the first video**, run `/rental-ninja-crm:video setup`. It checks your Mac and tells you exactly what is missing:

| What | Why | How |
|------|-----|-----|
| Python 3.9 or newer | runs the video tools | `xcode-select --install` (Apple's command line tools) or `brew install python` |
| Homebrew | installs ffmpeg | the one-line installer from [brew.sh](https://brew.sh) |
| ffmpeg | audio, video and stills | `brew install ffmpeg` |
| Python packages + Chromium | draws the frames | Claude runs `setup --install` for you, with your OK: it only writes to `~/.cache/rental-ninja-video` and Playwright's cache (a few hundred MB) |
| faster-whisper (optional) | word timings for audio that has none | `setup --install --whisper` |
| Hub token | narration and music | the normal install above |
| ElevenLabs key (optional) | only if you want to use your own ElevenLabs account instead of the Hub | stored in the macOS Keychain, see the skill |

No OpenRouter or Google key is needed: voice and music both come from ElevenLabs through the Hub.

Homebrew and ffmpeg you install yourself in Terminal (they may ask for your Mac password); Claude never installs system software.

**Narration and music** go through the Hub: the brand voice for each language and a score composed for each film by ElevenLabs Music (it follows the film's acts and ends with the end card), with no API key on your Mac. Both are paid in ElevenLabs credits from the company account, with no per-person cap: about 1 per narrated character and 15 per second of music (a 15-second Reel's score ≈ 225), so Claude shows you the script and the music plan with its estimate before spending. If the account runs low (under 10 % left) or runs out, Claude passes on the Hub's message word for word. ElevenLabs output is cleared for commercial use, social posts and paid ads included. If you have your own ElevenLabs key, the film's `film.yml` can use it instead.

**Updates** replace the plugin's own folder only: your films and the tools cache live outside it, so nothing is lost.

**Media library.** When a film is approved, `/rental-ninja-crm:video publish <film folder>` puts it in Hub → Marketing → Library (MP4 per format, poster, WebVTT subtitles, and the voice and music rights, from which the Hub says whether it may run as a paid ad). It lands as a draft until it is approved; only approved videos can be added to campaigns. The upload step needs only the `python3` and `curl` that come with macOS.

## Marketing

Claude is the main way to run Rental Ninja's marketing; the Hub (Hub → Marketing) shows the same data and can do the same things.

- **`marketing-campaigns`** drafts a campaign from the marketing context: a hypothesis ("If we show X to Y, Z will happen, measured by …"), the audience and its reach, a sequence of in-app popup, push and email (by default popup on day 0, push on day 2 to people who did not engage, email on day 5 to teams that did not convert), copy in Spanish and English that respects the channel lengths, the brand's word lists and a "no AI tells" list, the other languages machine-translated and marked for review, and a test of each channel sent to your own account. It also manages campaigns, audiences, contact rules, the marketing context and the brand voices as the Hub tools for them arrive.
- **`marketing-review`** is the marketing loop: every week it reads each active campaign's results (guardrails, conversion against the holdout, with small-sample caution) and writes one note with 1–3 recommendations, and it writes a postmortem for every campaign that ended. It only writes notes and stops when the numbers look like a tracking bug. Schedule it from Claude Desktop (Scheduled tasks) or with `/schedule`; to stop it, disable the task.
- **`video`** makes the videos and publishes them to the media library (above).

**What stays human-only.** Only the actions that start or restart sending: activating a campaign, resuming a paused one, and turning "Pause all sending" back off. You do those in the Hub; Claude never does them. Anything else Claude does after showing you what it will change.

**Grants.** Reading needs no grant. These tools need yours in Hub → Staff access, group **"Campaigns & media"** (ask an admin): Send campaign test, Generate voiceover, Generate music, Update marketing context, Publish to the media library, Add campaign notes.

## Safety

- Most CRM tools (reading threads, searching, adding notes, etc.) run automatically
- These actions always ask for your confirmation first:
  - **Sending an email** to a customer — Claude drafts first, you review before sending
  - **Changing a company's pipeline stage** — may trigger automated emails
  - **Creating a Rentals United ticket** — sends to RU support
  - **Creating changelog content** — publish-facing text
  - **Forcing a Booking.com rate re-sync** — briefly pauses the whole hotel's rate plans
  - **Opening a session as a team owner** — impersonation
  - **Importing or removing a customer's past bookings** — writes into their account; needs the Imports tools in Staff access
  - **Creating or changing a campaign draft, a campaign test, a campaign note or a media library upload** — the team sees them; tests only reach your own account
- Read-only marketing tools (context, campaigns, results, notes, audiences, library, voices) run automatically
- **Activating, resuming or un-pausing campaign sending** never happens from Claude: a person does it in the Hub

---

## Admin Guide

Everything below is for Pol / whoever manages the plugin.

### Marketplace

- **Marketplace repo**: `rental-ninja/claude-plugins-marketplace` (private)
- **Plugin repo**: `rental-ninja/rental-ninja-crm-agent` (public)

Team members add the marketplace once with the URL Pol sends them. The plugin repo is public — no PAT needed for cloning.

### Releasing a new version

1. Make your changes (skills, agents, settings, etc.)
2. Bump `version` in `.claude-plugin/plugin.json`
3. Commit and push to `main`

Team members get the update on their next session.

### Changelog

- **5.6.0** — Marketing: new `marketing-campaigns` and `marketing-review` skills; the `video` skill reads the marketing context before the script, takes each language's brand voice from the Hub and publishes delivered films to the media library (`film.py publish` + `upload`, WebVTT subtitles); the read-only marketing tools are auto-approved.

### Adding a new team member

1. Generate a `HUB_MCP_TOKEN` for them in Hub
2. Send them: the marketplace URL + their token
3. Point them to the [Install](#install) section above

### Plugin structure

```
rental-ninja-crm-agent/
├── .claude-plugin/
│   └── plugin.json               # Plugin manifest (name, version)
├── .mcp.json                     # Hub MCP server connection
├── settings.json                 # Auto-approved tool permissions
└── skills/
    ├── accounting/
    │   └── SKILL.md              # Payout & settlement investigation skill
    ├── blog-post/
    │   ├── SKILL.md              # Hub-grounded multilingual blog writer
    │   └── reference/            # CMS import template + product-knowledge snapshot
    ├── marketing-campaigns/
    │   └── SKILL.md              # Campaign drafting and management through the Hub tools
    ├── marketing-review/
    │   └── SKILL.md              # Weekly campaign review + postmortems (the scheduled marketing loop)
    ├── setup-hub/
    │   └── SKILL.md              # CLAUDE.md installer/updater
    ├── video/
    │   ├── SKILL.md              # Animated video maker (in-app + social), Hub narration and music
    │   ├── tools/                # film.py pipeline: setup, narration, captions, music plan, sound, render, publish (library.py)
    │   ├── template_flat/        # House-style film scaffold (template/ = paper-craft)
    │   ├── reference/            # Scene code of two complete films
    │   └── library/              # Humaaans cast, with its licence record
    └── hub/
        ├── SKILL.md              # CRM operator skill (persona, safety, workflows)
        └── agents/
            └── hub-crm-operator.md   # Sub-agent for autonomous CRM tasks
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
