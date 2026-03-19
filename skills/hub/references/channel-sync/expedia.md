# Expedia

Expedia-specific patterns for channel sync investigations. Read `channel-sync.md` first for the general approach.

Expedia uses the Hotel Reservation System (HRS) model, which is fundamentally different from other OTAs — properties are grouped into clusters (hotels) with room types, physical rooms, and rates.

> **RU docs:** `search_docs(query: "Expedia", repo: "rentals-united-docs")` returns integration overview, HRS model details, connection requirements, fee mappings, reservation price breakdown, and FAQs. Narrow with `"Expedia fees"`, `"Expedia price"`, etc.

---

## Sync Model

Push model via RU. Reservations are retrieved every 5 minutes. Expedia does not quote RN before accepting a reservation — it uses its own cached data, which can lead to price discrepancies.

**Instant sync** — Prices, extra guest price, availability, min stay, changeover restrictions.

**With Automatic Listing Content Update** — Also syncs property name/type, check-in/out times, licence, property size, geo-location, min/max sleeps, address, same-day cutoff, amenities, bedrooms, photos, down payment, damage deposit, cancellation policy, fees, fee collection times, taxes.

Never syncs: descriptions, discounts, optional fees, optional taxes. Floor number not included in address.

## Common Issues

**Group Contract requirement** — The most common blocker for new Expedia connections. New clients get errors on every push because they lack an API configuration profile on RU's end. The root cause: they're not under a valid Group Contract Agreement with Expedia, which requires signing the agreement and having 20+ properties. Without this, nothing works. The customer must contact their Expedia Account Manager (or go to Contact Us > My Account > My Expedia Group lodging agreement if they don't have one).

**Price calculation confusion** — Expedia applies commission first, then taxes on the reduced price. Customers expect price + fees + tax, but the reality is (price minus commission) + tax on the reduced amount + taxed fees. The "Price to you" and "Guest price" breakdown in Expedia reservations is the source of truth.

**Occupancy-based pricing** — Must be enabled in the Expedia dashboard during mapping. For pushed properties it should auto-select, but if it doesn't, all prices will be wrong.

**"Upon arrival" fees become Offline Fees** — If fee collection is set to "upon arrival," Expedia treats it as an Offline Fee. The guest sees the amount but it's not in the booking breakdown — the host must manually charge it.

**Inactive listing at hotel/cluster level** — Could mean payment issues, compliance problems, recontracting, incomplete onboarding, or renovations. Check room-level errors for specifics rather than assuming a sync problem.

## Quirks

Min stay capped at 28 days. Description must be 700+ characters. Cancellation policy must be continuous (no non-penalty gaps) with fees increasing toward check-in. Reservation modifications from RN don't sync to Expedia — only Expedia-initiated modifications sync. Expedia may cross-list properties on VRBO sites. New inventory acceptance prioritizes multi-unit US-based companies; other locations are case-by-case via RU support.

## Escalation

Group Contract and PM name errors — customer must obtain the agreement from Expedia. Inactive listings — check room-level errors, may need Expedia support for compliance or payment issues. Hotel or room deletion — customer contacts Expedia support directly before removing in RU. New connections — RU Support Team presents the case to Expedia.
