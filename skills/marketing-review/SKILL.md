---
name: marketing-review
description: The Rental Ninja marketing loop, built to run on a schedule - a weekly review of every active campaign (results, guardrails, conversion) written as one Hub note per campaign with 1-3 concrete recommendations, and a postmortem note for every campaign that ended without one. It only writes notes - it never activates, pauses, sends or edits a campaign - and stops when the numbers look like a tracking bug. Use when the user says "review the campaigns", "weekly campaign review", "how are the campaigns doing", "campaign postmortem", or wants to schedule the marketing loop.
argument-hint: "weekly | postmortem [campaign id] | <campaign id> | schedule"
---

# Rental Ninja marketing loop

A loop that watches the running campaigns and keeps their learnings in the Hub, so the next campaign starts from what
the last one taught: every active campaign gets a weekly read with recommendations, every ended one a postmortem. It
is meant to run unattended every Monday morning (Claude Desktop scheduled task or `/schedule`; conversions take days,
so a daily run only adds noise), and it works the same when someone asks for it. Its only state is the notes
themselves (`list_campaign_notes`): no files, no memory.

## Rules

1. **Notes only.** The only write is `add_campaign_note`. The loop never activates, resumes, pauses, ends, sends
   (not even `send_campaign_test`) or edits a campaign, its audience or its copy, and never touches "Pause all
   sending". When a campaign needs one of those, the note recommends it and names who acts: a person in the Hub, or
   a person asking Claude interactively (the `marketing-campaigns` skill drafts follow-ups and pauses campaigns
   with their OK).
2. **One note per campaign per run, at most.** Weekly: skip a campaign that already has a weekly review from the
   last 6 days. Postmortem: skip a campaign that already has any `postmortem` note.
3. **Numbers with their source.** Every figure comes from `get_campaign_results` in this run; say so in the note.
   Mark guesses as guesses. Never write "significant" or "winner" on a small sample.
4. **A suspected tracking bug stops the note.** Do not write findings on numbers that cannot be right: report it to
   the person instead (Self-check).
5. **Nobody by name.** Campaign results include teams and companies: notes speak in counts and segments, never name a
   customer.

## Routing

Parse `$ARGUMENTS`:

- **`weekly`** or nothing → Weekly review, then Postmortems (the scheduled run).
- **`postmortem`** → Postmortems only; **`postmortem <id>`** → that campaign only (it must have ended).
- **`<campaign id>`** → a weekly review of that one campaign, written even if a recent one exists (a person asked).
- **`schedule`** → Scheduling below.

## Weekly review

1. `list_campaigns` with `status: active`. None → say so and go on to Postmortems.
2. For each campaign, `list_campaign_notes`. Skip it when a note of kind `note` whose first line starts with
   `**Weekly review` is less than 6 days old. Keep its hypothesis and the previous reviews for the trend.
3. `get_campaign_results` (reading it also records the conversions detected since the last read). Days live = today
   minus the activation or start date.
4. **Self-check** (below). A suspected bug → no note for this campaign; put it at the top of the summary.
5. Read it:
   - **Guardrails** (`guardrails`): email unsubscribe rate, push opt-outs, popup dismiss rate, each `ok` / `amber` /
     `red`. `red` → the first line of the note recommends pausing the campaign and says which metric; `amber` → watch
     it and name a cause to test.
   - **Conversion:** the converted teams and the conversion rate. With `small_sample`, or fewer than about 5
     conversions, write "too early to call" and give the numbers as directional only (rule 3).
   - **Funnel and steps** (`steps`, per channel): where people drop (audience → reached → clicked → converted);
     popup CTR and dismiss rate; push sent, failed and open rate; email delivered, clicks (email opens are not
     measured), bounces, complaints; skipped deliveries by reason (send window, contact limits,
     no device, email sending off).
   - **Against the hypothesis:** is the behaviour it predicted happening? Compare with the last review's numbers.
   - **Facts still true?** Compare the texts (`preview_campaign`) with `list_campaign_options` `offers` and
     `get_pricing_catalogue`, and check every date in the copy. An offer that is gone or a date that has passed is the
     first recommendation, with any `red` guardrail: pause the campaign and fix the copy.
6. Write **one** `add_campaign_note`, `kind: note`, markdown, in the language of the campaign's earlier notes
   (English when there are none):

   ```markdown
   **Weekly review · 2026-10-12** · day 9 of the campaign
   **Guardrails:** unsubscribes 0.2 % (ok) · push opt-outs 0.4 % (ok) · popup dismissals 83 % (amber)
   **Funnel:** 412 teams → 268 reached → 41 clicked → 9 converted; small sample: directional only.
   **Read:** the popup is seen but mostly dismissed; the day-2 push brings most clicks (guess: the popup shows at app
   start, before people are in the inbox).
   **Recommendations:**
   1. Move the popup's placement from app_start to the inbox (a draft change; the campaign has to be paused first).
   2. Keep the push as it is.
   3. Review again next week before deciding on the email step.
   _Source: get_campaign_results, 2026-10-12 08:05 UTC._
   ```

   Recommendations are 1–3, concrete and doable: a copy line to change, a step to add or drop, an audience to narrow,
   a date to end it. Each names who acts.
7. Keep a line per campaign for the summary: reviewed / skipped (recent review) / stopped (suspected bug), and any
   `red` guardrail or stale fact.

## Postmortems

1. `list_campaigns` with `status: ended`, newest first.
2. For each, `list_campaign_notes`: skip it when any note of kind `postmortem` exists (that is how the loop knows a
   campaign ended since the last run). At most 5 postmortems per run, newest first; say how many are left.
3. `get_campaign_results`, the hypothesis and the weekly reviews; Self-check as above.
4. Write one `add_campaign_note`, `kind: postmortem`:
   - **Goal vs result:** the hypothesis and the conversion goal; the conversions with the sample caveat; reach per
     step.
   - **What worked:** the steps, copy lines, placement or audience that carried the clicks and conversions.
   - **What did not:** where people dropped, guardrails that went amber or red, steps that never sent (and why).
   - **Reusable:** copy that performed (quote it), the media library asset id, the audience or saved audience,
     the sequence pattern.
   - **Next hypothesis:** "If we show X to Y, Z will happen, measured by …".
   - _Source: get_campaign_results at <time>._

## Self-check: does this look like a tracking bug?

Stop writing for that campaign and tell the person when any of these holds:

- more reached than the audience, more clicked than reached, more converted teams than reached or than the audience;
- email clicks above sends, push opens above sends, or any negative number;
- nothing reached after 3 or more days live while sending is on and the steps are not waiting on the send window,
  the contact limits or the email legal gate (check `list_campaign_options` `sending` and the skipped reasons);
- a sudden jump or drop against the last review that no date, step or change explains.

Say which campaign, which numbers and why they cannot be right, and suggest someone check it in the Hub (the tracking
may need a developer). No note is written on it until a person has looked.

## Stop conditions

- **No Hub tools at all:** stop and say so (restart Claude Code or check the Hub token).
- **`add_campaign_note` missing from the tools:** the person lacks its grant. Stop and tell them to ask an admin for
  "Add campaign notes" in Hub → Staff access → Campaigns & media, then restart Claude Code (the tool list is cached
  about 5 minutes).
- **Suspected tracking bug:** that campaign is skipped and reported (above); the others go on.
- **Global pause:** when `list_campaign_options` says sending is paused, mention it once at the top of the summary;
  reviews still run.
- **More than 20 active campaigns:** review the 20 with the most reach and say the rest were left for the next run.

## Kill switches

- **Sending:** the one switch is "Pause all sending" (Hub → Rental Ninja Settings → Marketing), which stops every
  campaign push, email and popup. A red guardrail is a recommendation for a person, who flips it or asks Claude to
  (the `marketing-campaigns` skill).
- **The loop:** disable or delete its scheduled task (Claude Desktop → Scheduled; Claude Code `/schedule`). Removing
  "Add campaign notes" from the person's Staff access also stops it from writing.

## Scheduling

1. Run it once by hand (`/rental-ninja-crm:marketing-review weekly`) and allow `add_campaign_note` when Claude asks
   ("always allow"): an unattended run cannot answer a permission prompt.
2. Create the task. In Claude Desktop: a scheduled task, every Monday at 09:00 Europe/Madrid, with the prompt
   `/rental-ninja-crm:marketing-review weekly`, in a folder where this plugin is enabled. In Claude Code: `/schedule`
   with the same prompt; a cloud routine needs the Hub MCP server reachable from where it runs.
3. Each run ends with the summary: campaigns reviewed, skipped, stopped, postmortems written, red guardrails first.
