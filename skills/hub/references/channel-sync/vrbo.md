# VRBO

VRBO-specific patterns for channel sync investigations, including FeWo-direkt (same Expedia Group platform, German market brand). Read `channel-sync.md` first for the general approach.

> **RU docs:** `search_docs(query: "Vrbo", repo: "rentals-united-docs")` returns integration overview, connection wizard, reservation processing (Quote & Hold), fee mappings, supported currencies, and FAQs. Narrow with `"Vrbo fees"`, `"Vrbo pricing"`, etc.

---

## Sync Model

Push/pull hybrid — unlike Airbnb and Booking.com which are push-only.

**Dynamic data** (prices, availability, fees, taxes, min stay, extra guest price, discounts, same-day cutoff) — Pushed instantly by RN, also pulled by VRBO several times daily. Usually visible within 5 minutes.

**Static data** (listing name, basic info, sleeps, currency, amenities, bedrooms, description, photos, cancellation policy, down payment, damage deposit, arrival info, check-in/out times, T&C) — Pulled by VRBO once per day, meaning up to 24-48 hours lag. This delay is inherent to the platform and can only be accelerated by contacting the VRBO Account Manager.

Never syncs: fee collection timing, latest check-in time.

## Common Issues

**OTA commission not communicated** — VRBO doesn't send commission amounts to RN. Customers must set up Commission Strategies in RN (Accounting > Commission Strategies) to deduct VRBO commission from statements. This catches people off guard when reviewing payouts — they see the gross amount instead of the net.

**Static data delay** — Content changes take 24-48 hours. First-time sync is also subject to this delay. If a customer complains content isn't showing, the first question is when the change was made.

**Down payment dual setup** — Must be configured at both the rental level (Rentals > Rates/Upsells > Base Rates > Down Payment) and the account level (Distribution > VRBO > Account Settings > Custom Payment Schedule). Both must match — a mismatch causes silent payment issues.

**Onboarding delay** — New connections can take up to a week while VRBO completes onboarding. The VRBO Account Manager can speed this up.

**Pet policy default** — Listings default to "no pets." The "Pets are welcome" amenity must be explicitly added. Pet fees only sync as fixed amounts, not percentages.

## Quirks

Currency is fixed per account — all properties share the currency chosen at connection time and it can't be changed per property. Only one VRBO account per RN team. Optional fees and taxes are never sent — only mandatory. Max stay capped at 90 days. Cancelled reservations can't be restored — must create a new one. Existing bookings before connection must be manually sent to RN support for creation. The public listing link must be added in the Connections page for status tracking to work.

## Escalation

Static data not updating after 48 hours — customer contacts the VRBO Account Manager to force retrieval. Properties not visible after connection — verify the Connection Wizard was completed and the customer returned to activate. Onboarding delays — VRBO Account Manager.
