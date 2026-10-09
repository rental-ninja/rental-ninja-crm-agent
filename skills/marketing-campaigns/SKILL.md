---
name: marketing-campaigns
description: Run Rental Ninja marketing campaigns through the Hub tools - draft and edit in-app popup, push and email sequences in the Hub from the marketing context (hypothesis, audience, channels, copy in Spanish and English without AI tells, other languages machine-translated for review, a test to yourself per channel), and manage audiences, translations and the marketing context. Use when the user asks for a campaign, an in-app popup, a push notification, a marketing email, an upgrade, upsell, trial or reactivation nudge, a campaign audience or segment, or wants to change, pause or end a campaign.
argument-hint: "<goal or idea> | edit <campaign id> | options"
---

# Rental Ninja campaigns

You run Rental Ninja's marketing campaigns from here: Claude is the main way to draft, change and manage them, and
the Hub (Hub → Marketing) shows the same data. The audience is Rental Ninja's own customers: property managers who
use the Rental Ninja app. A campaign is a sequence of up to three messages (an in-app popup, a push notification, an
email), each on its own day and with its own send condition, shown to an audience of teams.

All calls go through this plugin's `hub` MCP server. No Hub tools at all: ask the user to restart Claude Code or
check their Hub token. A single tool missing: the person lacks its grant (see Grants).

## Rules

1. **Never start sending.** Four actions are human-only and done in the Hub: **activating** a campaign, **resuming**
   a paused one, turning **"Pause all sending" back off** and **lifting a suppression**. MCP does not offer them;
   never look for a way around that (no impersonation, no clicking through the Hub in a browser, no asking another
   agent). Everything else in Marketing you can do here.
2. **Context before copy.** Read `get_marketing_context` before writing or rewriting any text, for the brand voice,
   customer language, words to use and avoid, pain points, objections, positioning, what never to claim and
   sensitive topics. It holds no prices or figures: facts come from the tools (rule 7).
3. **Confirm before writing.** Show the plan (hypothesis, audience with its reach, sequence, Spanish and English
   copy) before creating a draft; confirm every edit, pause, end, deletion, approval, change to a saved audience or
   suppression with the user, naming exactly what it affects. `save_campaign_draft` with a `campaign_id` drops a
   channel set to `null` and replaces the hand-picked teams with `team_ids` / `company_ids` (`manage_campaign`
   `add_teams` appends): send only the fields to change.
4. **Tests only to yourself.** `send_campaign_test` reaches the user's own app account (the default) or a user of an
   internal Rental Ninja team, never a customer.
5. **Spanish and English are yours, the rest is the translator's.** Write `es` and `en` yourself. Fill `ca`, `fr`,
   `de`, `it`, `nl`, `pt` only with `translate_campaign_messages`, which marks them machine-translated. Never
   hand-write those languages, and mark translations reviewed (`manage_campaign` `mark_translations_reviewed`) only
   after a person who reads that language checked them and says so.
6. **A live campaign and its saved audience change only while it is paused.** `save_campaign_draft` refuses an
   active campaign: pause it first (`manage_campaign` `pause`, with the user's OK). Once activated, a campaign's
   choice of audience is fixed and hand-picked teams can only be added. A saved audience is evaluated live, so
   `save_marketing_audience` with `id` is refused while an active campaign uses it (pause that campaign first, or a
   person with Manage campaigns edits the audience in the Hub), and a paused campaign using it reaches the new set
   once resumed. Before replacing one: name every campaign `list_marketing_audiences` lists for it, with its status,
   show the new reach with `preview_marketing_audience`, save only after the user's explicit OK and relay the
   response's `campaigns` and `warning` word for word. When live campaigns use it and the user only wants a new
   segment, save a new audience (no `id`) instead.
7. **Live facts only.** Every fact in the copy comes from a tool in this session, never from memory, the context or
   an earlier campaign:
   - prices → `get_pricing_catalogue` (list prices) or `get_company_subscription` with `include_prices` (what one
     account pays);
   - offers → the text of `list_campaign_options` `offers`, word for word, and only after the user confirms billing
     applies it to every account that converts;
   - features → `search_changelog` + `search_docs`;
   - limits, contact rules and sending → `list_campaign_options` / `marketing_settings` `get`;
   - counts → `preview_marketing_audience`.

   If a tool and the context disagree, the tool wins: tell the user. No made-up statistics or testimonials.

## Tools

- **Context:** `get_marketing_context` (`version`, `include_history`), `update_marketing_context` (new version, or
  `restore_version`).
- **Facts (read-only):** `get_pricing_catalogue`, `get_company_subscription` {`company_id`, `include_prices`},
  `search_changelog`, `search_docs`.
- **Campaigns:** `list_campaign_options`, `list_campaigns`, `save_campaign_draft` (no `campaign_id` creates a draft),
  `translate_campaign_messages`, `preview_campaign`, `send_campaign_test`, `get_campaign_results`,
  `list_campaign_notes`, `add_campaign_note`, and `manage_campaign` with an `action`: `pause`, `end`, `duplicate`,
  `delete_draft`, `add_teams`, `remove_teams`, `mark_translations_reviewed`.
- **Audiences:** `list_marketing_audiences`, `preview_marketing_audience`, `save_marketing_audience`,
  `manage_marketing_audience` (`archive`, `restore`, `delete`).
- **Media library:** `list_marketing_assets` (with `id`: one asset and its files), `get_marketing_asset_upload_urls`,
  `publish_marketing_asset`, `manage_marketing_asset` (`update`, `approve`, `back_to_draft`, `archive`,
  `delete_file`). Popup and email media come only from the library: upload with
  `get_marketing_asset_upload_urls`, publish with `publish_marketing_asset`, approve, then pass the asset's `asset_id`.
- **Voice & settings:** `list_marketing_voices` (voices and the ElevenLabs balance), `generate_voiceover`, `generate_music`,
  `marketing_settings` (`get`, `set_voice`, `pause_all_sending`), `marketing_suppressions` (`list`, `add`).

## Routing

Parse `$ARGUMENTS`:

- **a goal or idea** ("get admins of segment 2 to try Smart Inbox") → the Workflow below.
- **`edit <id>`** → `list_campaigns`, `preview_campaign` and `list_campaign_notes` for it, ask what to change, then
  steps 5–9 with `save_campaign_draft` and its `campaign_id` (an active campaign is paused first: rule 6).
- **pause, end, duplicate, delete, remove teams, suppress a contact** → Managing campaigns below.
- **`options`** → summarise `list_campaign_options`: audiences with today's matches, placements, buttons, offers,
  contact rules and whether email sending is on.
- **results, reviews, postmortems** → the `marketing-review` skill.
- **a video for the popup or the email** → the `video` skill, which publishes it to the media library.

## Workflow

### 1. Gather

In parallel:

- `get_marketing_context`: audience and roles, pain points, objections, customer language per language, words to
  use and avoid, brand voice, positioning and what never to claim, sensitive topics. If `version` is null, nobody has
  written it yet: tell the user and offer to draft it (step "Marketing context" below) before writing copy.
- `search_changelog` + `search_docs` (repos `ninja-docs`, `ninja_app`) for the feature being promoted: what it does
  today and its exact path and label in the app.
- `get_pricing_catalogue` when the campaign sells a plan, an add-on or a trial: what is for sale and the caveat that
  teams can pay otherwise.
- `list_campaign_options`: audiences with `matches_today`, placements, app screens (`routes`, `email_routes`),
  button types (`cta_types` and which are admin-only), `offers`, `plans`, text limits, the push and email rules,
  `sending` (whether sending is paused) and `conversion_goals`.
- `list_campaigns`, then `list_campaign_notes` of the related or recent ones: their postmortems and hypotheses say
  what was tried and what it taught. Do not repeat an idea that failed without a new angle.
- `list_marketing_assets` (status approved) whenever the campaign may have a popup or an email: their video comes
  from the library (step 5, "Video").

### 2. Hypothesis

One or two sentences, required before anyone can activate the campaign:

> If we show **X** (the message and offer) to **Y** (the audience), **Z** will happen (the behaviour), measured by
> **…** (the conversion goal from `conversion_goals`).

- ES: *Si mostramos a los admins del segmento 2 que les devolvemos sus borradores gratis de Smart Inbox y que un
  borrador solo cuenta cuando lo envían, más equipos reactivarán la prueba y se suscribirán, medido por la
  suscripción a Smart Inbox.*
- EN: *If we show segment 2 admins that their free Smart Inbox drafts are back and that a draft only counts when
  they send it, more teams will reactivate the trial and subscribe, measured by Smart Inbox subscriptions.*

### 3. Audience

Pick one, then check its size before writing copy:

| Audience | How |
|---|---|
| Code-defined segment | `audience: "<key>"` from `list_campaign_options` (`matches_today` = teams and users today) |
| Saved audience | `audience: "saved_audience_<id>"` from `list_marketing_audiences`; `preview_marketing_audience` shows its count and sample; `save_marketing_audience` saves a new filter when the user asks for one (replacing one: rule 6) |
| Hand-picked teams | `team_ids` or `company_ids` (Hub companies); `manage_campaign` `add_teams` appends later |

- `roles`: `admin` (admins and owner), `member`, or both. Admin-only buttons (`upgrade_dialog`,
  `reactivate_smart_inbox_trial` and `open_route` to an admin-only screen) show members "Ask an admin" instead;
  send reactivate campaigns to admins only, since a member's request asks for an upgrade.
- Tell the user when the audience is too small for its results to show anything.
- **One text reaches every team.** Each language has one text for the whole audience. Before the copy states anything
  plan-, country- or size-specific, narrow the audience with saved-audience conditions (`plan`, `country`,
  `channel_manager`, `rentals`) so it is true for every team, or drop it. Spot-check 3–5 teams from
  `preview_marketing_audience` with `get_company_subscription` (`include_prices` for their prices).

### 4. Channels and sequence

Each channel is one step with `delay_days` (days after activation) and `send_condition`:

| Condition | Who still gets the step |
|---|---|
| `always` | everyone in the audience |
| `if_not_engaged` | people who did not click the popup, tap the push or click the email button on an earlier day |
| `if_not_converted` | teams that have not converted (converted teams never get any later step anyway) |

Default pattern, to adapt to the goal:

| Day | Channel | Condition | Job |
|---|---|---|---|
| 0 | `in_app` | always | the main message where they work (`placement`: `app_start` or the screen it is about) |
| 2 | `push` | if_not_engaged | a short reminder for people who missed or ignored the popup |
| 5 | `email` | if_not_converted | the full argument for people who still have not acted |

Adapt it: a feature discovery inside the app may need only the popup; people who rarely open the app need the email
first. Someone who dismisses the popup gets no other channel of that campaign for the dismiss cooldown, so a
dismissal is a no. If `list_campaign_options` says email sending is off (it stays off until legal validates
consent), the email step will not go out: say so in the plan.

### 5. Copy

**One message, one job, one call to action.** Each step says one thing and asks for one action; the button says
what happens when they tap it ("Probar Smart Inbox", "See the offer"), not "Click here" or "Más información". The
email body is short markdown: the pain, what changes, one sourced fact, the button.

Write from the context, with facts from the tools:

- Open on the pain in the customers' own words (the context's customer language for that language), then what
  changes for them, concretely ("el borrador de cada respuesta, listo en tu bandeja", not "ahorra tiempo").
- Use the context's words to use; never its words to avoid. Keep product names as they are: Rental Ninja, Smart
  Inbox, Smart Plan.
- Follow the brand voice for form of address and tone (tú/usted, warmth). Native Spanish and native English, not
  translations of each other.
- **No amounts** in copy for many accounts: teams pay different prices (legacy prices, coupons, negotiated lines,
  their own usage rates, yearly billing). Send admins to their own price instead: the popup button `upgrade_dialog`
  (`cta_params` plan `smart-plan`) shows each team its own Smart Inbox prices and leads to Billing; push and email
  open the `subscription` route (Billing). Both are admin-only.
- Every other fact per rule 7.

**No AI tells** (adapted from the copywriting rules of
[coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), MIT). The tools catch lengths,
links, stock phrases, em dashes in short copy, capitals, exclamation marks, amounts and `{placeholders}`; these they
can't:

| Tell | English | Spanish | Instead |
|---|---|---|---|
| Contrast reveal | "It's not X, it's Y", "Not because X. Because Y." | "No es X, es Y", "No porque X. Porque Y." | state the benefit |
| Negation list | "No setup, no templates, no waiting" | "Sin instalaciones, sin plantillas, sin esperas" | say what does happen |
| Self-answered question | "The result? Replies in seconds." | "¿El resultado? Respuestas en segundos." | say it plainly |
| Buzzword | robust, powerful, streamline, effortless | fácil, potente, intuitivo, integral, sin fisuras | a concrete fact |
| Trailing pile-on | a claim followed by ", saving you time, effort and stress" | "…, ahorrándote tiempo, esfuerzo y estrés" | stop after the claim |

Also: at most one list of three or one fragment per message; no emoji unless the brand voice allows them; em dashes
rare even where the tools allow them; the swap test — if a competitor could send the message unchanged, add the
Rental Ninja specific. Read every text for these before saving, then fix every `copy_warnings` entry the tools
return.

**Video.** A short video shows the feature working in a way the popup text can't, so whenever the plan has a popup
(or an email), recommend one in the plan without waiting to be asked:

- If an approved library asset fits the message, propose it by name.
- Otherwise offer to make one now with the `video` skill, briefed from this campaign: the audience, the pain in
  their words, what changes, the button, the languages, 16:9 for the popup, 20–30 seconds. Say that the voice and
  the music spend ElevenLabs credits (`list_marketing_voices` shows what is left), and start it only on the user's yes.
- Don't hold the draft for it: create the draft without `asset_id`, and add the video with `save_campaign_draft`
  once the user has watched it and it is approved (step 7).

### 6. Contact rules

The Hub enforces fixed contact rules across campaigns: a send window in each team's timezone for push and email,
caps per person on each channel and the popup dismiss cooldown; when several campaigns match
a user, the highest `priority` goes first. The live values are in `list_campaign_options` (or `marketing_settings`
`get`): plan the sequence around them, since a step due outside the send window or over a cap waits.

### 7. Create the draft

After the user's OK on the plan, `save_campaign_draft` (no `campaign_id`) with `name`, `hypothesis`, the audience (`audience`, or
`team_ids`/`company_ids`), `roles`, optional `starts_at`/`ends_at`/`priority`, and one object per channel: `in_app`
{`placement`, `title`, `body`, `cta_label`, `cta_type`, `cta_params`, `asset_id`?, `delay_days`, `send_condition`},
`push` {`title`, `body`, `route`, `delay_days`, `send_condition`}, `email` {`subject`, `preheader`, `body`
(markdown), `cta_label`, `route` or `url`, `asset_id`?, `delay_days`, `send_condition`}. Texts are objects per
language: `{"es": "…", "en": "…"}`.

- `in_app.asset_id` (the popup's video) and `email.asset_id` (a thumbnail of the video) take **approved** media
  library assets only. A draft asset (for example one the `video` skill just published) is approved first: after
  the user has watched it and says so, `manage_marketing_asset` `approve`, or they approve it in Hub → Marketing →
  Media library. Pass its rights note on when it limits use.
- Fix the `copy_warnings` it returns with `save_campaign_draft` and the draft's `campaign_id`.

### 8. Translate, preview, test

1. `translate_campaign_messages` fills the missing languages from English (else Spanish), keeping links, limits and
   product names. It lists what it rejected: leave those languages to fall back to English,
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

- the hypothesis, the audience with its reach, the sequence (day, channel, condition, one-line summary);
- each fact in the copy with the tool it came from (rule 7);
- the languages written by you and the machine-translated ones awaiting review;
- the popup's video: linked, waiting for approval in the media library, or none (and why);
- copy warnings left on purpose, and anything that will not send (email off, no push devices);
- the tests sent;
- the `hub_url`, where a person activates it (rule 1).

## Managing campaigns

Each of these needs the user's explicit OK for the named campaign, team or contact. A tool missing from your tools
means the person lacks its grant (see Grants); the same action is always in the Hub too.

| Ask | Tool | Notes |
|---|---|---|
| Pause a campaign | `manage_campaign` `pause` | stops its sends and popups |
| End a campaign | `manage_campaign` `end` | final; its results and notes stay; a `marketing-review` postmortem follows |
| Start from an earlier campaign | `manage_campaign` `duplicate` | the copy is a new draft: re-check hypothesis, audience and copy |
| Delete a draft | `manage_campaign` `delete_draft` | drafts only, never one that reached people |
| Add / remove hand-picked teams | `manage_campaign` `add_teams` / `remove_teams` | never on an active campaign; after activation teams can only be added |
| Stop all marketing at once | `marketing_settings` `pause_all_sending` {reason} | "Pause all sending" (Hub → Rental Ninja Settings → Marketing): every campaign push, email and popup |
| A customer asks not to get marketing | `marketing_suppressions` `add` (`list` to check) | also tell the person handling that customer's thread |
| Brand voice per language | `list_marketing_voices` / `marketing_settings` `set_voice` | the voice the `video` skill uses by default |
| Change a saved audience | `save_marketing_audience` with `id` | rule 6 |
| Retire an audience | `manage_marketing_audience` `archive` | campaigns already using it keep working; new ones can't pick it |

## Notes and learnings

- An idea for a later campaign → `add_campaign_note` with `kind: hypothesis` on the campaign it came from.
- Weekly reviews and postmortems are the `marketing-review` skill's job.

## Marketing context

`update_marketing_context` saves a new version of the whole document. Only when the user asks: start from
`get_marketing_context`, keep what still holds, follow the section template in the tool's description, quote
customers verbatim with where it comes from, mark guesses and pass a one-line summary as `change_note`. Customer
language comes from real threads (`search_threads`, `search_closure_summaries`): phrasing only, never a customer's
name. Earlier versions: `get_marketing_context` with `include_history` or `version`, and `update_marketing_context`
`restore_version` to bring one back as a new version.

It holds what stays true for months: style and positioning (product overview in one paragraph, audience and roles,
pain points, customer language, brand voice, words to use and avoid, how to talk about price, differentiation and
what never to claim, objections, dated competitive notes, sensitive topics). Never prices, offer terms, limits,
counts or offer dates: those change without anyone editing the document and live in the tools (rule 7). If you find
any there, don't use them: tell the user and propose removing them in a new version.

## Grants

Reading needs no grant. Writing needs one of five grants in Hub → Staff access → Campaigns & media: Campaign drafts
(drafts, translations, notes, saved audiences, tests), Manage campaigns, Media library & context (uploads, assets, the
marketing context), Voiceovers & music, Marketing settings (`marketing_settings` and `marketing_suppressions`, even to
`get` or `list`). A tool missing from your tools means the person lacks its grant. The grant labels, what to tell the person and which tools run
without a prompt: **Grants and approvals** in the `hub` skill (`${CLAUDE_SKILL_DIR}/../hub/SKILL.md`).
