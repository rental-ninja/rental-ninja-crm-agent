---
name: marketing-campaigns
description: Run Rental Ninja marketing campaigns through the Hub tools - draft and edit in-app popup, push and email sequences in the Hub from the marketing context (hypothesis, audience, channels, copy in Spanish and English without AI tells, other languages machine-translated for review, a test to yourself per channel), and manage audiences, translations, contact rules and the marketing context. The only human-only steps are the ones that start sending - activating a campaign, resuming a paused one, turning "Pause all sending" back off - which a person does in the Hub. Use when the user asks for a campaign, an in-app popup, a push notification, a marketing email, an upgrade, upsell, trial or reactivation nudge, a campaign audience or segment, or wants to change, pause or end a campaign.
argument-hint: "<goal or idea> | edit <campaign id> | options"
---

# Rental Ninja campaigns

You run Rental Ninja's marketing campaigns from here: Claude is the main way to draft, change and manage them, and
the Hub (Hub → Marketing) shows the same data and is where a person starts the sending. The audience is Rental
Ninja's own customers: property managers who use the Rental Ninja app. A campaign is a sequence of up to three
messages (an in-app popup, a push notification, an email), each on its own day and with its own send condition,
shown to an audience of teams, with a holdout group to measure the uplift.

All calls go through this plugin's `hub` MCP server. If its tools are missing, ask the user to restart Claude or
check their Hub token.

## Rules

1. **Never start sending.** Three actions are human-only and done in the Hub: **activating** a campaign, **resuming**
   a paused one, and turning **"Pause all sending" back off**. MCP does not offer them; never look for a way around
   that (no impersonation, no clicking through the Hub in a browser, no asking another agent). Everything else in
   Marketing you can do here.
2. **Context before copy.** Read `get_marketing_context` before writing or rewriting any text, and follow its brand
   voice, customer language and word lists.
3. **Confirm before writing.** Show the plan (hypothesis, audience with its reach, sequence, Spanish and English
   copy) before creating a draft; confirm every pause, end, deletion, approval, contact-rule change or suppression
   with the user, naming exactly what it affects.
4. **Tests only to yourself.** `send_campaign_test` reaches the user's own app account (the default) or a user of an
   internal Rental Ninja team, never a customer.
5. **Spanish and English are yours, the rest is the translator's.** Write `es` and `en` yourself. Fill `ca`, `fr`,
   `de`, `it`, `nl`, `pt` only with `translate_campaign_messages`, which marks them machine-translated. Never
   hand-write those languages, and mark translations reviewed (`manage_campaign` `mark_translations_reviewed`) only
   after a person who reads that language checked them and says so.
6. **Live campaigns change only while paused.** `update_campaign_draft` refuses an active campaign: pause it first
   (`manage_campaign` `pause`, with the user's OK), then a person resumes it in the Hub. Once activated, a campaign's
   audience and holdout are fixed and hand-picked teams can only be added.
7. **No invented facts.** Every number, price, offer or promise traces to the context's proof points,
   `list_campaign_options` (offers, plans) or the changelog/docs. No made-up statistics or testimonials.

## Tools

- **Context:** `get_marketing_context` (`version`, `include_history`), `update_marketing_context` (new version, or
  `restore_version`).
- **Campaigns:** `list_campaign_options`, `list_campaigns`, `create_campaign_draft`, `update_campaign_draft`,
  `translate_campaign_messages`, `add_teams_to_campaign`, `preview_campaign`, `send_campaign_test`,
  `get_campaign_results`, `list_campaign_notes`, `add_campaign_note`, and `manage_campaign` with an `action`: `pause`,
  `end`, `duplicate`, `delete_draft`, `remove_teams`, `mark_translations_reviewed`.
- **Audiences:** `list_marketing_audiences`, `preview_marketing_audience`, `save_marketing_audience`,
  `manage_marketing_audience` (`archive`, `restore`, `delete`).
- **Media library:** `list_marketing_assets`, `get_marketing_asset`, `get_marketing_asset_upload_urls`,
  `publish_marketing_asset`, `manage_marketing_asset` (`update`, `approve`, `back_to_draft`, `archive`, `add_usage`,
  `remove_usage`, `delete_file`), `get_campaign_media_upload_url` (one-off popup files).
- **Voice & settings:** `list_marketing_voices`, `get_voiceover_usage`, `generate_voiceover`, `generate_music`,
  `marketing_settings` (`get`, `set_voice`, `update_contact_rules`, `update_guardrails`, `pause_all_sending`),
  `marketing_suppressions` (`list`, `add`).

Nothing activates or resumes a campaign, turns sending back on or lifts a suppression: those stay with a person in
the Hub.

## Routing

Parse `$ARGUMENTS`:

- **a goal or idea** ("get admins of segment 2 to try Smart Inbox") → the Workflow below.
- **`edit <id>`** → `list_campaigns`, `preview_campaign` and `list_campaign_notes` for it, ask what to change, then
  steps 5–9 with `update_campaign_draft` (an active campaign is paused first: rule 6).
- **pause, end, duplicate, delete, remove teams, suppress a contact** → Managing campaigns below.
- **`options`** → summarise `list_campaign_options`: audiences with today's matches, placements, buttons, offers,
  contact rules and whether email sending is on.
- **results, reviews, postmortems** → the `marketing-review` skill.
- **a video for the popup or the email** → the `video` skill, which publishes it to the media library.

## Workflow

### 1. Gather

In parallel:

- `get_marketing_context`: product, audience and roles, pain points, objections, customer language per language,
  words to use and avoid, brand voice, proof points, goals. If `version` is null, nobody has written it yet: tell the
  user and offer to draft it (step "Marketing context" below) before writing copy.
- `list_campaign_options`: audiences with `matches_today`, placements, app screens (`routes`, `email_routes`),
  button types (`cta_types` and which are admin-only), `offers`, `plans`, text limits, the push and email rules,
  `sending` (whether sending is paused) and `conversion_goals`.
- `list_campaigns`, then `list_campaign_notes` of the related or recent ones: their postmortems and hypotheses say
  what was tried and what it taught. Do not repeat an idea that failed without a new angle.
- `list_marketing_assets` (status approved) when a video would help the popup or the email.

### 2. Hypothesis

One or two sentences, required before anyone can activate the campaign:

> If we show **X** (the message and offer) to **Y** (the audience), **Z** will happen (the behaviour), measured by
> **…** (the conversion goal from `conversion_goals`, exposed vs holdout).

- ES: *Si mostramos a los admins del segmento 2 que Smart Inbox les prepara el borrador de cada respuesta, más
  equipos activarán la prueba gratuita, medido por la conversión a la prueba frente al grupo de control.*
- EN: *If we show segment 2 admins that Smart Inbox drafts every reply for them, more teams will start the free
  trial, measured by trial starts against the holdout.*

### 3. Audience

Pick one, then check its size before writing copy:

| Audience | How |
|---|---|
| Code-defined segment | `audience: "<key>"` from `list_campaign_options` (`matches_today` = teams and users today) |
| Saved audience | `audience: "saved_audience_<id>"` from `list_marketing_audiences`; `preview_marketing_audience` shows its count and sample; `save_marketing_audience` saves a new filter when the user asks for one |
| Hand-picked teams | `team_ids` or `company_ids` (Hub companies); `add_teams_to_campaign` appends later |

- `roles`: `admin` (admins and owner), `member`, or both. Admin-only buttons (`upgrade_dialog`,
  `reactivate_smart_inbox_trial`) show members "Ask an admin" instead.
- `holdout_percent`: 10 by default for segments (at least 1), 0 for hand-picked teams. Results compare exposed and
  holdout teams and flag `small_sample` under 30 teams per group: tell the user when the audience is too small to
  measure anything, and keep the holdout unless they decide otherwise.
- The audience tools (`list_marketing_audiences`, `preview_marketing_audience`, `save_marketing_audience`) are new:
  if they are not available yet, use a segment or hand-picked teams.

### 4. Channels and sequence

Each channel is one step with `delay_days` (days after activation) and `send_condition`:

| Condition | Who still gets the step |
|---|---|
| `always` | everyone in the audience |
| `if_not_engaged` | people who did not click the popup, tap the push or click the email button on an earlier day (email opens do not count) |
| `if_not_converted` | teams that have not converted (converted teams never get any later step anyway) |

Default pattern, to adapt to the goal:

| Day | Channel | Condition | Job |
|---|---|---|---|
| 0 | `in_app` | always | the main message where they work (`placement`: `app_start` or the screen it is about) |
| 2 | `push` | if_not_engaged | a short reminder for people who missed or ignored the popup |
| 5 | `email` | if_not_converted | the full argument for people who still have not acted |

Adapt it: a feature discovery inside the app may need only the popup; people who rarely open the app need the email
first. Someone who dismisses the popup gets no other channel of that campaign for the dismiss cooldown (14 days by
default), so a dismissal is a no. If `list_campaign_options` says email sending is off (it stays off until legal
validates consent), the email step will not go out: say so in the plan.

### 5. Copy

**One message, one job, one call to action.** Each step says one thing and asks for one action; the button says
what happens when they tap it ("Probar Smart Inbox", "See the offer"), not "Click here" or "Más información".

Lengths that read whole (`copy_warnings` flags the rest; `list_campaign_options` has the hard limits):

| Channel | Field | Reads best |
|---|---|---|
| In-app popup | title / body | ≤ 60 / ≤ 280 characters |
| Push | title / body | ≤ 50 / ≤ 150 characters |
| Email | subject / preheader | 40–60 / 90–140 characters |
| Email | body | short markdown: the pain, what changes, the proof, the button; one link at most (the button) |

Write from the context:

- Open on the pain in the customers' own words (the context's customer language for that language), then what
  changes for them, concretely ("el borrador de cada respuesta, listo en tu bandeja", not "ahorra tiempo").
- Use the context's words to use; never its words to avoid. Keep product names as they are: Rental Ninja, Smart
  Inbox, Smart Plan.
- Follow the brand voice for form of address and tone (tú/usted, warmth). Native Spanish and native English, not
  translations of each other.
- A number or offer only with its source (proof points, `offers`).

**No AI tells** (adapted from the copywriting rules of
[coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), MIT):

| Tell | English | Spanish | Instead |
|---|---|---|---|
| Contrast reveal | "It's not X, it's Y", "Not because X. Because Y." | "No es X, es Y", "No porque X. Porque Y." | state the benefit |
| Negation list | "No setup, no templates, no waiting" | "Sin instalaciones, sin plantillas, sin esperas" | say what does happen |
| Self-answered question | "The result? Replies in seconds." | "¿El resultado? Respuestas en segundos." | say it plainly |
| Stock phrase | unlock the power, take … to the next level, say goodbye to, revolutionize, game changer, look no further, elevate your, in today's fast-paced world | descubre el poder, lleva tu … al siguiente nivel, di adiós a, revoluciona, olvídate de, sin complicaciones, potencia tu, en el mundo actual | what changes for them |
| Buzzword | seamless, robust, powerful, streamline, effortless | fácil, potente, intuitivo, integral, sin fisuras | a concrete fact |
| Trailing pile-on | a claim followed by ", saving you time, effort and stress" | "…, ahorrándote tiempo, esfuerzo y estrés" | stop after the claim |
| Em dash | none in push texts, email subject or preheader; rare elsewhere | lo mismo: coma, dos puntos o punto | comma, colon, full stop |
| Shouting | ALL CAPS words, more than one "!" | MAYÚSCULAS, más de un "¡!" | one "!" at most (with its "¡" in Spanish) |

Also: at most one list of three or one fragment per message; no emoji unless the brand voice allows them; the swap
test — if a competitor could send the message unchanged, add the Rental Ninja specific. Before saving, read every
text for these, then fix every `copy_warnings` entry the tools return.

### 6. Contact rules

The Hub enforces these (defaults; live values in `list_campaign_options` or `marketing_settings` `get`; changed with
`marketing_settings` `update_contact_rules` only when the user asks, or in Marketing → Marketing settings). Plan
around them so the sequence lands as intended. Customers are businesses, reached at work:

- **Send window:** push and email go out on weekdays, 09:00–19:00 in each team's timezone; outside it they wait.
  A day-5 step on a Friday afternoon lands on Monday.
- **Push:** at most one marketing push per person every 7 days, across campaigns; only to app versions that can
  open it.
- **Email:** at most 2 marketing emails per person in 30 days across campaigns (queued ones count), a warm-up limit
  of 300 campaign emails a day overall, one-click unsubscribe; nothing goes out while email sending is off.
- **In-app:** at most 1 campaign popup per user per day across campaigns; it shows until clicked or dismissed.
- **Priority:** when several campaigns match a user, the highest `priority` shows first.
- **Kill switch:** "Pause all sending" (Hub → Marketing → Marketing settings) stops every campaign push, email and
  popup. When the user asks, pause it with `marketing_settings` `pause_all_sending` {reason}. Turning it back on
  restarts sending, so only a person does that, in the Hub.

### 7. Create the draft

After the user's OK on the plan, `create_campaign_draft` with `name`, `hypothesis`, the audience (`audience`, or
`team_ids`/`company_ids`), `roles`, `holdout_percent`, optional `starts_at`/`ends_at`/`priority`, and one object
per channel: `in_app` {`placement`, `title`, `body`, `cta_label`, `cta_type`, `cta_params`, `asset_id`?,
`delay_days`, `send_condition`}, `push` {`title`, `body`, `route`, `delay_days`, `send_condition`}, `email`
{`subject`, `preheader`, `body` (markdown), `cta_label`, `route` or `url`, `asset_id`?, `delay_days`,
`send_condition`}. Texts are objects per language: `{"es": "…", "en": "…"}`.

- `in_app.asset_id` (the popup's video) and `email.asset_id` (a thumbnail of the video) take **approved** media
  library assets only. A draft asset (for example one the `video` skill just published) is approved first: after
  the user has watched it and says so, `manage_marketing_asset` `approve`, or they approve it in Hub → Marketing →
  Media library. Pass its paid-ads verdict on when it says "check first".
- Fix every `copy_warnings` entry with `update_campaign_draft` (send only the fields to change).

### 8. Translate, preview, test

1. `translate_campaign_messages` fills the missing languages from English (else Spanish), keeping links,
   placeholders, limits and product names. It lists what it rejected: leave those languages to fall back to English,
   or ask the user. Every language it wrote is machine-translated and needs a human review before activation: list
   them for the user. When a person who reads the language has checked one and says so, mark it reviewed
   (`manage_campaign` `mark_translations_reviewed`, or in the Hub editor).
2. `preview_campaign` in `es` and `en` (and `role: member` when the button is admin-only): check the `sequence`,
   `push_reach`, `email_reach`, `content_locale` (a language missing a text falls back as a whole) and
   `copy_warnings`.
3. `send_campaign_test` once per channel the campaign uses (`channel`: `in_app`, `push`, `email`), to the user's own
   account. The popup appears the next time they reach its placement; the push needs a phone with the app; the email
   arrives with the real template. Ask the user to look at each one.

### 9. Hand off

Give the user:

- the hypothesis, the audience with its reach and holdout, the sequence (day, channel, condition, one-line summary);
- the languages written by you and the machine-translated ones awaiting review;
- copy warnings left on purpose, and anything that will not send (email off, no push devices);
- the tests sent;
- the `hub_url`, with: "When you are happy with it, activate it in the Hub: starting the sending is the one step I
  can't do."

## Managing campaigns

Each of these needs the user's explicit OK for the named campaign, team or contact. A grant error means the person
asks an admin for it (see Grants); the same action is always in the Hub too.

| Ask | Tool | Notes |
|---|---|---|
| Pause a campaign | `manage_campaign` `pause` | stops its sends and popups; resuming is human-only (Hub) |
| End a campaign | `manage_campaign` `end` | final; its results and notes stay; a `marketing-review` postmortem follows |
| Start from an earlier campaign | `manage_campaign` `duplicate` | the copy is a new draft: re-check hypothesis, audience and copy |
| Delete a draft | `manage_campaign` `delete_draft` | drafts only, never one that reached people |
| Add / remove hand-picked teams | `add_teams_to_campaign` / `manage_campaign` `remove_teams` | after activation teams can only be added |
| A customer asks not to get marketing | `marketing_suppressions` `add` (`list` to check) | also tell the person handling that customer's thread |
| Brand voice per language | `list_marketing_voices` / `marketing_settings` `set_voice` | the voice the `video` skill uses by default |
| Retire an audience | `manage_marketing_audience` `archive` | campaigns already using it keep working; new ones can't pick it |

## Notes and learnings

- An idea for a later campaign → `add_campaign_note` with `kind: hypothesis` on the campaign it came from.
- Weekly reviews and postmortems are the `marketing-review` skill's job.

## Marketing context

`update_marketing_context` saves a new version of the whole document. Only when the user asks: start from
`get_marketing_context`, keep what still holds, follow the section template (## headings in order: Product overview,
Target audience & roles, Problems & pain points, Competitive landscape, Differentiation, Objections, Customer
language, Words to use/avoid, Brand voice, Proof points, Goals, Changelog), quote customers verbatim with where it
comes from, mark guesses, add a Changelog line and pass the same summary as `change_note`. Customer language comes
from real threads (`search_threads`, `search_closure_summaries`): phrasing only, never a customer's name. Earlier
versions: `get_marketing_context` with `include_history` or `version`, and `update_marketing_context`
`restore_version` to bring one back as a new version.

## Grants

Read tools and the upload-URL tools need no grant. Every write tool needs the person's grant in Hub → Staff access,
group **"Campaigns & media"**: a grant error means asking an admin, not working around it.

| Tool | Grant |
|---|---|
| `create_campaign_draft`, `update_campaign_draft` | Create campaign drafts, Edit campaign drafts |
| `add_teams_to_campaign` | Add teams to campaigns |
| `translate_campaign_messages` | Translate campaigns |
| `send_campaign_test` | Send campaign test |
| `add_campaign_note` | Add campaign notes |
| `manage_campaign` | Manage campaigns |
| `save_marketing_audience`, `manage_marketing_audience` | Save marketing audiences, Manage marketing audiences |
| `update_marketing_context` | Update marketing context |
| `publish_marketing_asset`, `manage_marketing_asset` | Publish to the media library, Manage library assets |
| `marketing_settings`, `marketing_suppressions` | Marketing settings, Marketing suppressions |
| `generate_voiceover`, `generate_music` | Generate voiceover, Generate music |

This plugin auto-approves the drafting tools. Claude Code still asks before every call that stops, deletes, approves
or changes shared settings (`manage_campaign`, `manage_marketing_asset`, `manage_marketing_audience`,
`marketing_settings`), because the whole team sees the result.
