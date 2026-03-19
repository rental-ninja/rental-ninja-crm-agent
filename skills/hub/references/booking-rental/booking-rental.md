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
- **Pricing / availability**: Use `get_rental_rate_calendar` for daily pricing, min-stay, and availability over a date range.
- **Channel distribution**: Use `list_company_rentals(include_channels=true)` to see all channel connections and sync status.
- **Guest lookup**: Use `search_guests` by name, then `get_guest_detail` for contact info and booking history.
- **Admin access**: Use `get_company_urls` for all navigation URLs (Nova admin, setup wizard, white label, distribution center, Airbnb hosts).
- **RU dashboard**: Use `login_rentals_united` for a direct RU distribution center login URL (slow, ~30s — only when needed for channel/distribution issues).

Cross-reference findings with what the customer claims in the thread — discrepancies between claimed and actual data are common (wrong prices, misremembered dates, inactive channels believed to be active).

## Available Tools

- `search_bookings(company_id, query)` — find bookings by reference or guest name
- `get_booking_detail(company_id, booking_id)` — full booking with pricing, payments, pre-check-in, notes
- `list_company_rentals(company_id, include_channels)` — list properties with channel distribution
- `get_rental_detail(company_id, rental_id)` — full rental with amenities, legal details, Wi-Fi, door codes, channels
- `get_rental_rate_calendar(company_id, rental_id, date_from, date_to)` — daily pricing, min_stay, availability
- `search_guests(company_id, query)` — search guests by name
- `get_guest_detail(company_id, guest_id)` — guest with contact info, booking history
- `get_company_urls(company_id)` — all navigation URLs (Nova admin, setup wizard, white label/distribution center, Airbnb hosts)
- `login_rentals_united(company_id)` — direct login URL for the RU distribution center dashboard (slow, ~30s)
