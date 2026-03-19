# Distribution Center — Browser Verification

How to visually verify channel distribution state using `agent-browser` when API data alone isn't enough.

> **Locale warning:** All UI text in the Distribution Center renders in the user's locale. English strings in this doc are examples only — actual button labels, tab names, and link text will differ for non-English users. When text doesn't match what you see, use `snapshot -i --json` to discover `@ref` identifiers for interactive elements and click by ref instead of by text.

---

## When to Use

- API data looks correct but the customer disagrees
- Content policy rejections — only visible on the Publishing page, not via API
- Manual Options suspected — persistent RU-side overrides that don't surface in API responses
- Need to confirm channel status badges, listing state, or markup percentages visually

## Getting the URL

Call `get_company_urls(company_id)` and use the `white_label` field. This is a direct tokenized URL — no separate login required.

**Expires after 300 seconds (5 minutes).** You can refresh the page within that window, but after expiry the URL dies. Call `get_company_urls` again for a fresh URL if needed.

```
agent-browser open "<white_label_url>"
```

## Main Page Layout

Two sections:

- **"Your sales channels"** — Connected channels (active distribution)
- **"Connect to more sales channels"** — Available but not connected channels

Each channel appears as a clickable tile with the channel logo.

## Navigating to a Channel

Channel tiles are **not picked up by `snapshot -i` or `find text`** — they only render as image tiles. Use a CSS selector with the channel's alt text:

```
agent-browser click 'img[alt="Airbnb"]'
agent-browser click 'img[alt="Booking.com"]'
agent-browser click 'img[alt="Vrbo"]'
```

## Channel Detail Page

After clicking a channel tile, the detail page shows:

- **Tabs**: PROPERTY SETTINGS, PROMOTIONS, NOTIFICATIONS, QUALITY DASHBOARD, CHANNEL SETTINGS
- **Per-property rows**: Listing ID, Connection status badge, Price/Fee markup %
- **Status badges**: Green checkmarks = OK, other colors/icons indicate issues

### Navigating back

The back link text is locale-dependent. Use `snapshot -i --json` to find the back link by position/role, then click its `@ref`:

```
agent-browser snapshot -i --json
# Identify the back/breadcrumb link near the top of the page, then:
agent-browser click @<ref>
```

## What to Look For

- **Listing/Connection status badges** — Green = active and syncing. Anything else needs investigation.
- **Error messages** — Especially on the Publishing page or Quality Dashboard tab.
- **Markup percentages** — Customer may not realize a markup is applied.
- **Property counts** — Confirm the expected number of properties are listed.
- **Quality Dashboard tab** — Shows content issues, photo requirements, policy rejections.

## Per-Listing Management (Manage / Push)

On the channel detail page, each listing row has a **Manage** link on the right side. The three-dot menu (⋮) next to each listing offers additional actions.

### Manage → Push details

1. On the channel detail page, locate the listing row
2. Click **Manage** (right side of the row) — this expands or navigates to a detail view
3. Click **Push details** to re-push rates and availability to the channel. This is safe and is the standard fix for out-of-sync data.

### Three-dot menu (⋮) actions

The ⋮ menu next to each listing offers:

- **Update Listing Content** — Selectively re-syncs content (photos, descriptions, amenities). Use this for content-specific issues rather than Push details.
- **Change Mapping** — Reassign which RN property maps to this listing
- **Remove property** — Disconnect the listing from the channel
- **Property page** — Navigate to the property's RN page

> All these labels are locale-dependent. Use `snapshot -i --json` to discover the correct `@ref` for each element rather than relying on text matching.

## Tips

- Use `screenshot` for visual verification of status badges (colors, checkmarks)
- Use `snapshot` (without `-i`) for structured data extraction — the full accessibility tree with property names, listing IDs, and status text
- `snapshot -i` only shows the search textbox on the main page — not useful here
- Work quickly within the 5-minute URL window. If you need to re-verify, call `get_company_urls` again for a fresh URL.
