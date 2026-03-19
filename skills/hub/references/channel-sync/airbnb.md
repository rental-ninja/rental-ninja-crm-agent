# Airbnb

Airbnb-specific patterns for channel sync investigations. Read `channel-sync.md` first for the general approach.

> **RU docs:** `search_docs(query: "Airbnb", repo: "rentals-united-docs")` returns integration overview, sync model (Limited vs Full), fee/tax mappings (v1/v2/v3), amenity mappings, connection requirements, and FAQs. Narrow with `"Airbnb sync"`, `"Airbnb fees"`, etc.

---

## Sync Model

Airbnb uses a push model with two modes per listing (set per listing, not per account):

**Limited Sync** — Only availability, rates, and min stay. This is the default after mapping. Fees, taxes, photos, amenities, descriptions, and all other content are excluded.
**Full Sync (Sync Everything)** — Everything Limited syncs, plus fees, taxes, damage deposit, extra guest price, discounts, basic info, content, photos, amenities, cancellation policy, and check-in/out times.

Content updates via Full Sync take up to 24 hours to appear (4-hour push cycle plus Airbnb processing time).

Never syncs: property size, floor number, down payment, payment methods, T&C, preparation time, maximum stay.

## Common Issues

**Fees and taxes silently dropped** — If any fee uses an invalid charge type (like per-person/per-night), the entire fee and tax payload fails silently. No individual fees get sent at all. The customer sees zero fees on Airbnb and doesn't know why. The root cause is buried in the push XML response.
**API Update Lock** — Airbnb locks attributes that a host edits directly after they were pushed via API. Lockable attributes include name, property type, amenities, address, wifi details, and descriptions. Once locked, API updates are silently ignored. The host must re-enable channel manager updates under Airbnb > Hosting > Management Tools > API Connection.
**Content policy rejections** — Airbnb silently rejects listings that don't meet content requirements: minimum 5 amenities, 3+ high-quality photos (800x500 min), 30+ days availability in the next 12 months, property name at least 8 characters, and accessibility photo requirements. These errors appear on the Distribution Publishing page but aren't visible via API — this is one of the cases where browser verification adds value.
**Data out of sync / manual push** — Rates, availability, or content on Airbnb don't match RN. Common triggers: newly mapped property where initial push didn't complete, host edited data directly on Airbnb, or sync got stuck. Symptoms: listing appears locked, prices don't match, availability is wrong. Fix: Distribution Center → Airbnb → find listing → click **Manage** → **Push details**. This is safe — it mainly re-pushes rates and availability. For content-specific issues (photos, descriptions, amenities), use the three-dot menu (⋮) → **Update Listing Content** instead — this selectively re-syncs content areas. See `distribution-center.md` for browser navigation steps. This is what RU refers to as "manually push".
**Co-host connection trap** — Must connect via the listing owner's account, not a co-host. Co-host connections prevent property mapping entirely.
**Only one channel manager per Airbnb account** — If another CM was previously connected, the new connection silently fails. The host must remove previous access under Account > Privacy & Sharing > Services.
**Duplicate listings** — The property was pushed to the wrong Airbnb account. Must stop sync and permanently deactivate in the incorrect account before reconnecting to the correct one.

## Quirks

Damage deposit is informational only — shown to the guest but never auto-charged. Extra guest price doesn't support seasonal variation — RN sends the average across all seasons. Italian hosts must choose a cancellation policy with the "(IT)" suffix or synchronization breaks. Luxe listings only support Limited Sync. Currency mismatches cause Airbnb to convert with a potential 3% fee for rare currencies.

## Escalation

Account-level errors and duplicate listing problems go to RU Fast Support. API lock issues are self-service — the host re-enables updates in their Airbnb settings. Another CM still connected is also self-service — the host removes it in their Airbnb account.
