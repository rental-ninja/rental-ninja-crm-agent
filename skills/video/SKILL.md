---
name: video
description: Make a Rental Ninja animated video on your Mac — in-app campaign videos and Instagram/Facebook Reels, Stories and feed posts — in the house style (flat vector, Humaaans cast, brand palette, red banner + logo watermark), written from the Hub's marketing context, narrated and scored through the Hub (ElevenLabs brand voice and music), with burned-in captions and foley, rendered to MP4 and published to the Hub media library as a draft asset. Use when the user asks for a product video, feature video, promo, social video, in-app campaign video or animated explainer for Rental Ninja, wants to edit one of their films, or wants to put a finished film in the media library (Hub → Marketing → Media library). Run it with `setup` once on a new Mac.
argument-hint: "setup | <what the video is about> | edit <film folder> | publish <film folder> [<film folder> …]"
---

# Rental Ninja videos

For marketing and product people using Claude Code on a Mac. You (Claude) write the film — script, scene code,
sound plan — and render it locally; the user approves the content at each gate and gets MP4s ready to upload:

- **In-app campaign videos** (the popup/web player): 16:9, 1920×1080.
- **Instagram / Facebook**: Reels and Stories 9:16, feed 1:1 or 4:5, with burned-in captions (most feeds play muted).

One film = one folder with a `film.yml` (the single source of truth) + `app/` (the player page and the scene code,
plain JS on a canvas). Headless Chromium renders every frame, ffmpeg does the audio and video.

## Routing

Parse `$ARGUMENTS`:

- **`setup`** → run the Setup section and stop.
- **a topic** (a feature, a campaign, a changelog entry) → start at phase 1.
- **`edit <folder>`** or an existing film folder → read its `film.yml`, ask what to change, resume at that phase.
- **`publish <folder> [<folder> …]`** → the Media library section (phase 8) for delivered films, one folder per language.
- nothing → ask what the video is about and where it will play (in-app or which social placement).

## Tools and folders

`FILM` below means:

```
python3 "${CLAUDE_SKILL_DIR}/tools/film.py"
```

Claude Code replaces `${CLAUDE_SKILL_DIR}` with this skill's folder (inside the plugin cache, e.g.
`~/.claude/plugins/cache/rental-ninja/rental-ninja-crm/<version>/skills/video`). If it ever shows up literally, use the
"Base directory for this skill" path given above this file instead. `template_flat/`, `reference/` and `library/`
below are relative to that folder. `FILM --help` lists every command.

- **The skill folder is read-only.** A plugin update replaces it, so nothing is ever written there: `film.py` refuses
  a film folder inside it. To start from a reference, copy it out first.
- **Films live where the user chooses.** Ask once per film; suggest `~/Videos/rn-films/<slug>`, then
  `FILM new ~/Videos/rn-films/<slug>` (the slug in `film.yml` is taken from the folder name). Everything a film needs
  (takes, mix, renders, `final/`) stays in its folder, so it survives sessions and plugin updates.
- **Caches** — the tools venv, Python bytecode and the optional faster-whisper live in `~/.cache/rental-ninja-video`
  (`RN_VIDEO_HOME` overrides it); Playwright keeps Chromium in `~/Library/Caches/ms-playwright`.

## Setup (once per Mac)

1. `python3 --version`. If it is missing (macOS offers to install the developer tools), the user runs
   `xcode-select --install` or `brew install python` in their own Terminal.
2. `FILM setup` checks everything and prints `ok` / `MISSING` / `optional` with the exact command for each gap.
   It installs nothing by itself.
3. **Python packages + Chromium** (pyyaml, numpy, playwright): with the user's OK, run
   `FILM setup --install`. It creates the tools venv in `~/.cache/rental-ninja-video/venv` and downloads Playwright's
   Chromium (a few hundred MB, user space only, no password). `film.py` switches to that venv on its own from then on.
4. **Homebrew and ffmpeg** are system installs: give the user the commands `FILM setup` printed
   (`brew install ffmpeg`, and the Homebrew installer first if `brew` is missing) to run in their own Terminal. Never
   run `sudo` or the Homebrew installer yourself.
5. **Optional:** `FILM setup --install --whisper` adds faster-whisper for local word timings. Hub and ElevenLabs takes
   carry their own timings, so only imported audio without timings needs it.
6. **Hub:** narration, music and publishing go through this plugin's Hub MCP server (Hub token: the plugin README).
   No Hub tools at all: ask the user to restart Claude Code or check the token. `generate_voiceover`,
   `generate_music`, `publish_marketing_asset` and `manage_marketing_asset` are grant-gated: one missing from your
   tools means the person lacks its grant ("Generate voiceover", "Generate music", "Publish to the media library",
   "Manage library assets"). They ask an admin for it in Hub → Staff access → Campaigns & media, then restart Claude
   Code (the tool list is cached about 5 minutes); never work around it. Which tools ask before running: **Grants and
   approvals** in the `hub` skill (`${CLAUDE_SKILL_DIR}/../hub/SKILL.md`).
7. Run `FILM setup` again until it prints `Ready.`

## Phases and gates

1. **Brief → feature list → user approval (gate).** Ask where the video will play (in-app = 16x9; Reels/Stories
   9x16; feed 1x1 or 4x5), who it is for and in which languages (one film folder per language). Read the Hub's
   marketing context first (`get_marketing_context`) for style and positioning: the audience and roles, their pain
   points, the customer language for the film's language (their own words, verbatim), the words to use and avoid, the
   brand voice, the differentiation and what never to claim. If it is empty, say so and work from the docs; never
   invent it. Ground every feature in the Hub before listing it: what shipped (`search_changelog`,
   `list_changelog_items`) and how it really works (`search_docs`, repos `ninja-docs`, `ninja_app`,
   `ninja_app_client`). Then send the user the list of features/beats you will show, in order, and wait for approval.
   Respect `keep_out`.
   **Claims.** Every claim on screen or in the narration has its source in `brief.claims`: a tool result from this
   session or a positioning line of the context. No prices, discounts, offers, end dates or customer counts, on screen
   or in the narration: the film outlives the campaign, and teams pay different prices. The claims in
   `reference/film5/film.yml` are examples: re-source any you reuse. Never show a real customer, guest, property or
   booking.
2. **Script.** `FILM new <folder>`, then fill `film.yml`: one narration line ≈ one scene; 8–14 words a line,
   ~150 wpm (`FILM check` estimates the length). Problem → turn → features → proof → CTA for promos; the last line is
   always the brand + tagline over the series end card. The end card's button (`end_card.cta`, empty in a new film
   until you set it): for an in-app film, the action of the campaign's button (its label, e.g. "Try Smart Inbox"),
   since the viewers are customers already; "Book a demo" only for social films aimed at prospects. Write the script
   in the context's brand voice: open on the pain in the
   customers' own words, use the words to use, never the words to avoid, no stock phrases ("di adiós a", "lleva tu …
   al siguiente nivel", "unlock the power", "seamless") and no "it's not X, it's Y". Show the script to the user
   before recording: every take spends ElevenLabs credits (see Budget).
3. **Narration.** Resolve the voice first (see Narration, step 1: `list_marketing_voices`), then `FILM takes`, the
   Hub jobs, listen, set `pick` per line, then `FILM vo` (cleanup chain → word timings → `words.js` → captions →
   page). It flags takes whose words drift from the script. Tune `gap` per line for breathing room (longer after the
   problem beat and before the turn).
4. **Scenes.** Write `app/js/scenes*.js` (add them to `app.scripts` before `main_flat.js`), starting from
   `reference/film5/js`: 24 complete scenes covering people, houses, phones, calendars, inbox, pricing, money,
   reports, proof and CTA. Review with `FILM peek <folder> NAME t1 t2 t3 t4 …` at word times and look at every
   sheet yourself before moving on.
5. **Sound.** Set `music.sections` (and `stops`) to the acts, show the user `FILM score <folder> --dry` (the plan and
   its credits), then `FILM score <folder>` and run its `generate_music` job + `import-music` (see Music). Then
   `FILM audio <folder>` (cues → foley → score → mix → `app/audio/mix.mp3`). The master lands at −14 LUFS / ≤ −1 dBTP.
   Let the user listen to the score alone (`afplay <folder>/music/composed.wav`) before rendering.
6. **Render + deliver.** `FILM render <folder> draft1 [--fmt 9x16]`, watch it, fix, re-render. Show the user the
   draft (gate) before `FILM deliver <folder> draftN` → `final/<slug>.mp4` (1080p), `-720p.mp4`, `.srt` + `.vtt`,
   `poster.jpg`; other formats `final/<slug>-<fmt>.mp4`, `-<fmt>-720p.mp4`, `poster-<fmt>.jpg` (the format is read
   from the render). `FILM pagecheck <folder>` checks the player page at 1280 / 400 px.
7. **Hand-off.** Tell the user where the files are (`open <folder>/final` opens it in Finder) and which file goes
   where: the 1080p MP4 for in-app campaigns and Instagram/Facebook uploads, the 720p copy for chat and email, the
   `.srt` for platforms that take sidecar captions. If the Artifact tool is available and the user wants a shareable
   player, `FILM artifact <folder>` prints `file_path`, `icon` and the `files` map to publish it privately.
8. **Media library.** Offer to put the film in the Hub media library, where in-app campaigns and emails pick their
   videos (see Media library below). It lands as a draft until it is approved.

## Narration (engine `hub`, the team default)

The Hub MCP tool `generate_voiceover` makes ElevenLabs takes server-side: no local key, the brand voice per locale
comes from the backend, spend is logged per `label` (see Budget). Input
`{text ≤ 2500 chars (v4 audio tags OK), locale, voice_id?, model?, settings? {stability, similarity_boost, style,
use_speaker_boost}, label?}`; output `{audio_url (signed, expires), expires_at, duration_s, voice_id, model,
characters, words: [{text, start, end}]}`.

1. **Voice.** `voice.engine: hub` (the template default). Call `list_marketing_voices` (free, no grant, no prompt)
   and find `film.lang`:
   - a `voice_id` → leave `voice.voice` empty (the Hub uses that brand voice) and write its `name` into `voice.name`;
   - `voice_id` null (no brand voice for that language yet) → ask the user for an ElevenLabs voice id, or to have one
     picked in Hub → Rental Ninja Settings → Voice & audio (`settings_url`), and set `voice.voice` (+ `voice.name`);
   - the user wants another voice for this film → `voice.voice` overrides the brand voice; keep it in `film.yml`.
   Set `voice.from_voice_library` when you know it (true = a public ElevenLabs Voice Library voice, e.g. Cristina
   `1CeqBeXMOqCleeQjfYfO`; false = premade or the company's own); `publish` records the rights from these fields.
   `FILM takes <folder>` calls nothing: it writes `vo/hub_jobs.json`, one job per line × take: `input` (text =
   `say:` or `text`, locale, model, settings, label `<slug> line N take T`), `save_result_as`, `import`. It prints
   the characters the takes will use (1 credit each); fewer takes (`--takes a,b`, `--lines 3,4`) spend less.
2. Run the jobs one at a time, never as parallel tool calls (see Budget): call `generate_voiceover` with
   `job.input`, write its JSON result to `job.save_result_as`, run `job.import` straight away (the URL expires):
   `FILM import-take <folder> LINE TAKE RESULT.json`, then go on to the next job. The general form is
   `FILM import-take <folder> LINE TAKE AUDIO_URL_OR_PATH [WORDS_JSON_PATH_OR_INLINE]`: it downloads (curl) or copies
   the audio to `vo/lines/l<N>_<take>.wav` (48 kHz mono) and the words to `l<N>_<take>.words.json`. A refusal or a
   `warning`: see Hub notices (Budget).
3. Let the user listen (`afplay <folder>/vo/lines/l<N>_<take>.wav` plays a take) and set `pick` per line, then
   `FILM vo <folder>`: a picked take with a
   `.words.json` skips transcription; the words are shifted by the leading silence the cleanup chain trims and clamped
   to the final length. The drift check still compares them with the script (tags ignored).

**Delivery direction.** The default model `eleven_v4` takes audio tags in `say:` (one per clause, in English even for
Spanish text: `[tired]`, `[sighs]`, `[relieved, warming up]`, `[softly, smiling]`, `[confident, warm]`); they shape the
delivery and are not spoken. `say:` also fixes pronunciations ("Booking dot com", "Verbo"). `voice.settings` /
per-line `settings` are the ElevenLabs voice settings. Guide: elevenlabs.io/blog/elevenlabs-audio-tags-list.

**Optional engine `elevenlabs`, for people with their own key:** the same API with a personal key, from `ELEVEN_KEY`
or the macOS Keychain (service `elevenlabs-api-key`; store it with
`security add-generic-password -a "$USER" -s elevenlabs-api-key -w`). `voice.voice` is a voice id from `FILM voices`;
takes come with word timings. `FILM budget` shows the credits left (needs the key's `user_read` permission; `voices`
needs `voices_read`). The same key composes music with `music.engine: elevenlabs`.

## Music (engine `hub`, the team default)

The score is composed for each film by ElevenLabs Music, from the film's own timing, so it follows the scenes and ends
with the end card.

1. **Plan.** After `FILM vo`, `FILM score <folder> --dry` builds a composition plan from `words.js`
   (`tools/music.py`): one chunk per act, each starting where its scene wipes in (line start − `timing.lead`): the intro
   before the first word (folded into the first act when shorter than 3 s), the acts, and the end card (last line +
   `tail`), whose chunk asks for a clean final chord at the film's length. Total = the film's length, so the music
   ends with the end card. It prints the chunks, the styles, the stops and the estimate (~15 credits a second) and
   writes `music/plan.json`. Show it to the user before spending.
2. **Hub jobs.** `FILM score <folder>` calls nothing: it writes `music/hub_jobs.json`, one job per part (`input` =
   `{composition_plan, instrumental: false, model, label, seed?}` or, with `music.prompt`, `{prompt, length_s,
   instrumental: true, model, label}`; `save_result_as`; `import`). Run the jobs one at a time, in order, never as
   parallel tool calls (see Budget): call the Hub MCP tool `generate_music` with `job.input` exactly as written, write
   its JSON result (`{audio_url, expires_at, duration_s, model, credits, label, warning?}`) to `job.save_result_as`
   and run `job.import` straight away (the URL expires): `FILM import-music <folder> composed RESULT.json` (or
   `composed.p1`, `composed.p2`, …). The general form `FILM import-music <folder> NAME AUDIO_URL_OR_PATH_OR_RESULT_JSON`
   → `music/NAME.wav` (other names become extra clips). A refusal or a `warning`: see Hub notices (Budget).
   `instrumental: false` with a plan is deliberate: ElevenLabs rejects `force_instrumental` together with a
   composition plan (422); the plan's styles exclude vocals instead.
   **Parts.** `generate_music` takes at most 90 s per call. A longer plan is cut into parts of ≤ 90 s at chunk
   boundaries (a section longer than that is first split into equal sub-sections with the same styles); `score --dry`
   lists them. Every part carries the same seed (the `music.seed`, else one derived from the plan) and the same key, BPM
   and instrumentation in every chunk, and overlaps its neighbours by `music.crossfade` (0.8 s): never reword a part.
   The last import joins `music/composed.pN.wav` into `music/composed.wav` with an equal-power crossfade centred on
   each boundary, cut to the film's length (`audio` joins them too if needed). `music.prompt` is limited to 90 s.
   The direct `elevenlabs` engine splits the same way (one call per part) for the same sound.
3. `FILM audio <folder>` lays the composed score at 0 (clips on top), applies the stops and runs the mix chain (ride,
   ducking under the voice, intro swell, outro lift, −14 LUFS). It warns when the timing or the music settings changed
   since the score was composed (plan hash): re-run `score` to fit it again.

**film.yml `music`:** `engine` (`hub`; `elevenlabs` = personal key, one direct call per part, refuses to recompose
the same plan without `--force`; `library` = only `clips` + `synth` from the film folder, e.g. licensed music), `model`
(`music_v2_5`), `style` / `negative` (brand defaults in `tools/spec.py`: 108 BPM, G major, warm playful acoustic pop,
marimba, plucked guitar, ukulele, light drums; no vocals, no silence), `sections` (`{lines: [a, b], act | name, mood,
avoid}`; `act` = intro problem turn features proof outro; lines left out follow the default split: problem ≈ first
20 %, turn, features, proof ≈ last 15 %, end card), `stops` (`{line, word, n, offset}` or `{at}`: a hard stop on a
beat, silent until the next chunk starts or for `hold` s), `ending` (the last chunk's ending style), `seed` (plans
only), `prompt` (free text instead of a plan: no sections, no seed, ≤ 90 s), `crossfade` (seconds between parts,
0.8), `gain_db`, plus `clips` / `synth` on top.

**Write moods as arrangements.** The model plays styles literally: "ticking clock" gives ticks, "sparse" gives lone
chords with silence between. Describe full, continuous arrangements per section (instruments, groove, energy) and give
sections musical names ("Playful Tension Groove", "Warm Resolution and Final Chord"), as the defaults do.

## House style

`FILM new <folder>` scaffolds a film in the house style, from `template_flat/`.

- **Look:** flat vector illustration, 25 fps, smooth easing, paper grain, push transitions led by a navy band
  (`drawPush`). Palette "Coral & Navy" in `palette.js` (logo coral `#F5515F`, navy `#0D2B4E`, cream walls,
  dusty-blue backdrop `C.teal`) plus the livelier brand red `C.red #EC2B3B` / `C.redD #B3122A`.
- **Brand (brand.js):** product placement = the red `banner(x, cx, top)` with the official ninja (`street()` hangs it
  on the facade by default; reuse it on office walls, screens, signs). Watermark = the official logo bottom-right on
  every scene (`drawMark`), white on dark ground and colour on light ground, picked automatically; set `noMark: true`
  on a scene that already shows the logo (end card, brand reveal). Logos live in `app/img/` (`logo_color.svg`,
  `logo_neg.png`, `iso.svg`, from the backend repo `public/img/logo/`). The host wears `C.red`.
- **Cast (person.js):** Humaaans (CC0) parts drawn as Path2D (`hum_data.js`, `hum_rig.js`) behind the API
  `person(x, px, py, {who, s, dir, walk, sit, armF, headTilt, hold: 'case'|'phone', a})`. Roles: host ginger beard
  cleaner owner blonde dad tech (`HUM_CAST`). 1 = 520 px tall. Faces are profile-only (no moods); only the back arm
  moves (`armF` raised poses map onto it); walking cuts the legs at the knee. `folk.js` still provides `POSE`,
  `shadeHex` and the old procedural rig as a fallback.
- **Hands (hands.js):** `handPhone2(x, px, py, o, fn)` close-up phone (screen 300×640 in `fn`) with
  `...thumbTrack(t, [[time, [sx, sy]], …])` so the thumb lands on taps; `handPoint`, `handHold`, `handWave`,
  `handThumbsUp`, `handOpen`, `handKeyboard`.
- **World (world.js):** `street` `facade` `door` `antenna` `home` `phone` `laptop` `keypad` `appBar` `pill` `avatar`
  `check` `cross` `icon` `badge` `calGrid` `thumb` `ninja` `brand` `bush/drawBush` (navy foliage silhouettes in the
  foreground).
- **End card:** `endCardScene(lastLine)` (endcard.js): official ninja drops in, name pops on the voice, tagline,
  red CTA pill, URL, from `end_card` in film.yml.
- **Reference:** `reference/film5/` is the 24-scene Rental Ninja promo in this style (scenes_f1..f4.js). It was
  animated onto an earlier film's finished mix, so its beats use `hit(type, near)` on `hits.js`; new films time beats
  with `w()` and emit their own `cue()`s (Scene code rules).

## Formats and captions

- **Placement → `film.format`:** Reels/Stories `9x16` (1080×1920), feed `1x1` (1080×1080) or `4x5` (1080×1350),
  in-app popup / web / YouTube `16x9` (1920×1080, the default). One film folder serves every format: render each with
  `--fmt` (or set `film.format`); `deliver` names them `final/<slug>-<fmt>.mp4` (+ `-<fmt>-720p.mp4`,
  `poster-<fmt>.jpg`; 16x9 keeps `<slug>.mp4`, `-720p.mp4`, `poster.jpg`).
- **Social rules:** 15–30 s; the hook lands in the first 2 seconds (first line at ~0.6–1.0 s, the problem on screen
  at once, no slow intro); captions on (`captions.burn` defaults on for every format but 16x9); brand + CTA end card
  last. `FILM check` warns when a social cut runs outside ~12–32 s.
- **Default adaptation (any film):** scenes stay composed on the 1920×1080 stage. In other formats the stage is
  fitted to the width, centred in the safe area, over a cream brand backdrop; nothing is stretched or cropped. The
  watermark moves above the stage (`LAYOUT.mark`), captions go below it, and the end card re-lays out natively
  (centred, larger in portrait). 16x9 output is unchanged.
- **Scene globals:** `FMT = {id, w, h, portrait, wide}`; `SAFE = {top, bottom, left, right, w, h, cx, cy, x(f),
  y(f), stage, mark, caps}` (canvas px; `SAFE.caps` = the caption slot to keep clear; 9x16 keeps text out of the top
  14% and bottom 20%, override with `film.safe`); `LAYOUT`; `drawStage(ctx, S, t, {x, y, w})` (the scene's 16:9
  picture at any rect: bigger = cropped); `wrapText(s, size, maxW, weight)`; `CAPS`.
- **Native layout per scene:** give a scene `drawFmt(ctx, t, FMT)` (every non-16x9 format) or
  `layouts: {'9x16': fn}`. It draws in canvas pixels after the scene `bg` fill (no camera), and wins over the
  adaptation; pushes into or out of it run in canvas space. Keep `SAFE.caps` and the watermark slot clear, or move
  the mark with `mark: {'9x16': {x, y, w}}` (`noMark` hides it, `noCaps` hides captions, as the end card does):

  ```js
  scene(3, 3, { bg: C.sky, draw(x, t) { /* the 16:9 composition */ },
    layouts: { '9x16'(x, t) {
      drawStage(x, this, t, { w: 1560, x: -40, y: SAFE.caps.y - 900 });       // stage 1.45x, cropped to the action
      wrapText('¿Te suena?', 76, SAFE.w, 700).forEach((l, i) => txt(x, l, FMT.w / 2, SAFE.top + 70 + i * 90, { size: 76, weight: 700, align: 'center' }));
    } },
    mark: { '9x16': { x: 540, y: SAFE.top + 165, w: 260 } } });
  ```
- **Burned-in captions** (`captions:` in film.yml): `style: pill` = bold white Ubuntu on navy pills, `karaoke` = the
  spoken word also gets a brand-red chip; ≤ `max_chars` (32) per line, ≤ `max_lines` (2) per page, balanced,
  breaking after punctuation; lower third inside the safe area. Pages come from `VO.burn` (built by
  `FILM captions`/`vo` from the word timings, inside each `split` caption, so `split` still forces a page break).
  Previews: `?fmt=9x16`, `?caps=0|1|pill|karaoke`, `?safe=1` (red = platform UI, blue = caption slot, green =
  watermark slot).
- **Review:** `FILM peek <folder> NAME t… --fmt all [--caps karaoke] [--safe]` writes one sheet per time with the four
  formats side by side (`stills/NAME_tTTT.TT.jpg`); look at every one. `FILM render <folder> NAME --fmt 9x16 --span 0 6`
  renders a short draft (silent when there is no mix yet).
- **Older film folders:** copy `flat.js`, `main_flat.js`, `brand.js`, `endcard.js` from `template_flat/app/js` into
  the film, then `FILM captions <folder>` and `FILM page <folder>`.

## Scene code rules (learned the hard way)

- Time everything from the voice: `w(line, 'word', n)` (normalised lowercase alnum token, e.g. `'booking'`,
  `'com'`, `'12'`), `LN(i).start/.end`, `B(i)`. Never type absolute seconds. `FILM words <folder> [line]` lists
  tokens.
- `scene(a, b, {bg, wipe, cam:[z0,z1,cx,cy], camAt(t)?, build(), draw(ctx,t)})` covers lines a..b;
  scenes must tile every line. Scenes push in `timing.lead` before their line; alternate the `wipe` direction.
- **Pre-populate**: base elements of a scene start at `this.start - 1` so the incoming scene carries content
  during the push (it draws the scene at its start time). Only the beats animate on words.
- People (`person`, House style) enter from below or beside the frame so heads never pop in; keep feet on a
  visible ground line.
- Text: `txt` / `wrapText`; muted text `C.mute` or darker; calendar/UI text ≥ 22 px at 1080p; nothing smaller than
  what reads on a phone. One idea per scene; max ~3 labels on screen at once.
- Zooms into small UI (keypads, phones) with `camAt(t)` returning `[z, cx, cy]`, not by scaling sprites.
- Every visible action gets a foley cue: `cue(t, kind, {g, p, pan, d})`. Kinds: slide land tap thud stamp tear
  whoosh swoosh swing pop popup sticker type click tick staple button blink ding sparkle boing fan flip rustle
  confetti scribble. Wipes add whoosh + land automatically.
- Big dramatic beats (the double-booking stamp) get a hard music stop: `music.stops` (`{line, word, offset}`).

## Audio notes

- Let the final chord ring after the last word: the outro lift starts there (`mix.outro_lift.from` moves it).
- Mix defaults (film.yml `mix`): VO −18, music −24 pre-duck, foley −31 LUFS, duck 5 dB with 1.7 s hold,
  music ride, intro swell, outro lift, limiter, −14 LUFS master.

## Budget

Everything audible is paid in ElevenLabs credits: narration 1 credit per character (`FILM takes` prints the
characters), music ~15 credits per second (`FILM score --dry` prints the estimate: a 15 s Reel ≈ 225, a 30 s cut
≈ 450, a 3 min promo ≈ 2,700). With engine `hub` they come from the company's ElevenLabs account, with no per-person
cap. Before showing an estimate, call `get_voiceover_usage` (free, no prompt): `account.remaining` is the company's
credits left (`account` is null when the Hub cannot read the balance: say so) and `team_credits_used` this calendar
month's Hub spend (`credits_used` and `by_kind` are yours). Show the user the estimate next to what is left and this
month's spend, and say plainly when the estimate does not fit. Claude Code asks before every `generate_voiceover` and
`generate_music` call: the plugin never auto-approves spending. `FILM budget` explains this and shows a personal
key's credits when there is one.

- **One job at a time.** The Hub runs one generation per person at a time, so never call `generate_voiceover` or
  `generate_music` as parallel tool calls. "Another voiceover or music track of yours is still being generated" is
  not a refusal: wait for the running job, then call again.
- **Hub notices.** The Hub refuses a job up front when the company account has fewer credits left than that job
  needs, so a later take or part can be refused after earlier ones succeeded; a result carries a `warning` when less
  than 10 % is left. Show the refusal notice or the warning to the user verbatim; after a refusal, stop: no retry,
  smaller job or other engine on your own.

## Rights before publishing

- **Voice:** Hub takes come from the company's ElevenLabs account; ElevenLabs output is cleared for commercial use on
  paid plans. Voice Library voices (e.g. "Cristina", `1CeqBeXMOqCleeQjfYfO`) carry their owner's sharing terms: check them before a paid
  campaign. With a personal key, the rights follow that account's plan.
- **Music:** ElevenLabs Music output is cleared for commercial use, social posts and paid ads included, on paid plans
  (the company account through the Hub; a personal key follows its own plan). Film/TV, broadcast and large games need
  an ElevenLabs Enterprise licence. Music you bring yourself (`engine: library`) needs its own licence.
- **Cast:** Humaaans are CC0 (record in `library/humaaans/LICENSE.md`).
- **Claims:** sourced in `brief.claims` (phase 1, Claims); no real customer data on screen.
- **Record:** `FILM publish` writes these rights into the media library asset, and the Hub turns them into a paid-ads
  verdict (yes, or check first with the reasons). A Voice Library voice always gives "check first".

## Media library (`publish`)

The Hub media library (Hub → Marketing → Media library) holds the videos campaigns use: an in-app popup plays the 16x9
video, poster and WebVTT subtitles of the user's language (`update_campaign_draft` `in_app.asset_id`), an email shows
the 16x9 poster as a thumbnail (`email.asset_id`). Python cannot call the Hub, so `FILM publish` prepares everything
and you make the tool calls, in this order:

1. `FILM publish <folder> [<folder> …] [--name "…"] [--description "…"]`: one asset from one or more delivered film
   folders (one per language; `library/` goes in the first). Per format it takes the 1080p MP4 (`final/<slug>.mp4`,
   `<slug>-<fmt>.mp4`; the 720p copies stay out), its poster and, for formats without burned-in captions (16x9 by
   default), the WebVTT subtitles (made from the `.srt` when missing), measured with ffprobe. Rights come from the
   film: voice = the `voice_id` of the picked Hub takes + `voice.name` + `voice.from_voice_library`; music =
   `elevenlabs` + the composed model only when `music/composed.wav` exists (otherwise the clips or in-house cues, or
   no music; `music.licence` for engine library; the note is cut at 500 characters); visuals = the house style +
   `rights.visuals`; `rights.other`. It prints the files with sizes, the rights and `CHECK` lines, and writes
   `library/manifest.json` + `library/upload_request.json`. Show the user the name, description, files and rights,
   resolve every `CHECK` (fix `film.yml`, re-run) and get their OK.
2. Call `get_marketing_asset_upload_urls` with the contents of `library/upload_request.json` unchanged and write its
   JSON result to `library/upload_urls.json`. The URLs last 30 minutes.
3. `FILM upload <folder>`: one curl multipart POST per file (the policy fields, then the file last; storage answers
   204), then `library/publish_request.json` with the returned keys. `--dry` prints the curl commands and sends
   nothing. A failed upload stops with storage's message; a re-run skips the files already up. Expired URLs: step 2
   again. It needs only the system `python3` and `curl`.
4. Call `publish_marketing_asset` with `library/publish_request.json` exactly as written and write its result to
   `library/published.json` (`publish` then refuses a second asset from the same folder unless `--force`). Give the
   user the `hub_url` and pass the `paid_ads` verdict on word for word. Tool missing: Setup step 6.

The asset always lands as a **draft**, and only approved assets can be linked to campaigns. Approve it once the user
has watched the delivered film and says so: `manage_marketing_asset` `approve`, or
the user approves it in Hub → Marketing → Media library. Publish only films the user approved.
`list_marketing_assets` / `get_marketing_asset` show what is already in the library: check for an earlier version
before adding a duplicate. Rights, usages and archiving: `manage_marketing_asset` (`update`, `add_usage`,
`archive`), or the video's page in the Hub.

## Review

You review the visuals yourself: read every `peek` sheet and the stills of each draft render, at word times, before
showing the user; then the user watches the draft. There are no automated critics.

## Maintainers

Rebuild `hum_data.js` from the official Humaaans SVGs in a checkout of the plugin repo (never in the plugin cache):
`python3 skills/video/tools/humaaans/build_hum.py "skills/video/library/humaaans/Single Pieces" skills/video/template_flat/app/js/hum_data.js`
(the script uses `svg2canvas.py`), then bump the plugin version.
