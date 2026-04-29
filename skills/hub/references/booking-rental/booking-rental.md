# Bookings & Rentals

Domain knowledge for investigating bookings, rentals, guests, and channel distribution in Rental Ninja.

All entity data lives in the `hub` MCP server.

---

## Entity Model

**Booking** — A reservation with pricing, payment status, guest info, pre-check-in state, and notes. Bookings originate from direct input or OTA channels (Airbnb, Booking.com, VRBO, etc.). Each booking belongs to a rental and a company.

**Rental** — A property listing with amenities, legal details, Wi-Fi credentials, door codes, and channel connections. Rentals can be distributed across multiple OTAs via Rentals United.

**Guest** — A person associated with one or more bookings. Has contact info and booking history.

**Channel** — An OTA connection on a rental (Airbnb, Booking.com, VRBO, etc.) with sync status. Channel issues manifest as wrong prices, missing availability, or failed pushes.

## Investigation Approach

To investigate an entity question, resolve the entities mentioned (booking references, rental names, guest names, dates) and fetch their data:

- **Booking lookup**: Use `search_bookings` to find by reference or guest name, then `get_booking_detail` for full details (pricing, payments, pre-check-in, notes).
- **Rental lookup**: Use `list_company_rentals` for an overview, then `get_rental_detail` for specifics (amenities, legal, Wi-Fi, door codes, channels).
- **Booking authorisations / door codes**: Use `get_booking_door_codes` to retrieve smartlock authorisations (door key codes) for a specific booking. "Booking authorisations" and "smartlock authorisations" both refer to door codes.
- **Pricing / availability**: Use `get_rental_rate_calendar` for daily pricing, min-stay, extra-guest fee, changeover, and availability. Default window is today + 90 days (cap 180). Leave `include_daily_details=false` for a quick scan — `daily_segments` collapses consecutive days with the same tuple. Opt into `include_daily_details=true` only when you need per-day rows with the `strategy` vs `manual` `breakdown`. Read `pricing_model_explainer` first — it tells you whether prices come from seasonal rules (`season`), Wheelhouse (`smartPricing`), Rentals United (`external`), the public API (`api`), or are not actively priced (`closed`), and whether manual overrides survive sync.
- **Channel distribution**: Use `list_company_rentals(include_channels=true)` to see all channel connections and sync status.
- **Guest lookup**: Use `search_guests` by name, then `get_guest_detail` for contact info and booking history.
- **Admin access**: Use `get_company_urls` for all navigation URLs (Nova admin, setup wizard, white label, distribution center, Airbnb hosts).
- **RU dashboard**: Use `login_rentals_united` for a direct RU distribution center login URL (slow, ~30s — only when needed for channel/distribution issues).

Cross-reference findings with what the customer claims in the thread — discrepancies between claimed and actual data are common (wrong prices, misremembered dates, inactive channels believed to be active).

### Rate calendar debugging cheatsheet

- **"Why is this day priced at X?"** → check `pricing_model_explainer.price_source`, then `breakdown.strategy` vs `breakdown.manual` to see which layer wins on that day.
- **"Why can't a guest check in / out on this day?"** → use `effective_changeover` (folds in `preparation_day.after_checkout` / `before_checkin`), not raw `changeover`.
- **"Why was a manual override lost?"** → if `pricing_model` is `external`, every RU sync wipes `manual_*`. Confirm via `pricing_model_explainer.manual_overrides`.
- **"Why is min_stay weird on a `smartPricing` rental?"** → Wheelhouse only writes price; min_stay still comes from seasonal rules. Check the season covering the date (`season_id`, `season_name` on the daily row, or `seasonal_rules` at the top level).

## Available Tools

- `search_bookings(company_id, query)` — find bookings by reference or guest name
- `get_booking_detail(company_id, booking_id)` — full booking with pricing, payments, pre-check-in, notes
- `list_company_rentals(company_id, include_channels)` — list properties with channel distribution
- `get_rental_detail(company_id, rental_id)` — full rental with amenities, legal details, Wi-Fi, door codes, channels
- `get_rental_rate_calendar(company_id, rental_id, from_date?, to_date?, include_seasonal_rules?, include_daily_details?)` — daily pricing, min_stay, extra-guest fee, changeover, availability. Returns `pricing_model_explainer`, `rental_defaults`, `seasonal_rules` (when applicable), `daily_segments`, and optional `daily_details[]` with `strategy`/`manual` breakdown.
- `search_guests(company_id, query)` — search guests by name
- `get_guest_detail(company_id, guest_id)` — guest with contact info, booking history
- `get_booking_door_codes(company_id, booking_id)` — smartlock authorisations (door key codes) for a booking. Also known as "booking authorisations"
- `get_company_urls(company_id)` — all navigation URLs (Nova admin, setup wizard, white label/distribution center, Airbnb hosts)
- `login_rentals_united(company_id)` — direct login URL for the RU distribution center dashboard (slow, ~30s)
