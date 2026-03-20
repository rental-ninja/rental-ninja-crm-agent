# Booking.com

Booking.com-specific patterns for channel sync investigations. Read `channel-sync.md` first for the general approach.

Booking.com is the most frequent source of channel sync issues in the CRM.

> **RU docs:** `search_docs(query: "Booking.com", repo: "rentals-united-docs")` returns integration overview, property settings, fee/tax mappings, amenity mappings, known errors with next actions, reservation processing, and FAQs. Narrow with `"Booking.com content"`, `"Booking.com fees"`, etc.

---

## Sync Model

Push model via RU. ARI data is sent for 729 days into the future.

**Instant sync** — Prices, availability, min stay, changeover restrictions.

**With Automatic Listing Content Update** — Also syncs address, same-day cutoff, amenities, bedrooms, photos, damage deposit, fees, taxes (excluding VAT and City Tax), extra guest price.

**Always manual-only** — Listing name/type, cancellation policy, check-in amenities, check-in/out times, min/max sleeps, surface, company profile. VAT and City Tax can only be updated via a partial manual listing update selecting only "Tax & Fees" — a full manual update won't touch these.

Never syncs: descriptions, discounts, floor number, down payment, T&C, check-in details and place.

## Common Issues

**Rate Plan not activated** — After mapping, the Rate Plan may not auto-activate. It needs manual activation in Distribution > Booking.com > listing > Manage Rates. If the rate is active but the listing still isn't bookable, check the Booking.com Extranet Calendar for an activation button. This is one of the most common "it's connected but not working" causes.

**Duplicate listing trap** — Booking.com has a strong anti-duplicate policy. Once a property is archived, the QuickConnect link persists in the background. Publishing a listing a second time is blocked unless the property name, coordinates, and address are changed first.

**QuickConnect not set** — "Check your connection to the channel" or "You have not activated the connection" means the customer hasn't set QuickConnect as connectivity provider in the Booking.com Extranet under Account > Connectivity Provider.

**Calendar reopening after unlist** — If a customer unlists on Booking.com while the RN connection is active, QuickConnect may automatically reopen the property. This surprises people who think they've taken a property offline.

**Optional fees not sent** — Optional fees are never sent to Booking.com, with three exceptions: parking fee, internet fee (always sent regardless of optional/mandatory), and pet fee (always sent).

**Extra guest price update gap** — Changing only the extra guest price doesn't trigger an automatic listing update. A manual update is required. However, if max sleeps changes, the auto-update includes extra guest price.

**Multiple rate plans** — When mapping a property with multiple BDC rate plans (non-refundable, weekly, monthly), dependent rates derived from the Standard rate must be deleted in RN, while independent rates must be handled in both RN and the BDC extranet. This is a frequent source of confusion during onboarding.

## Quirks

Occupancy-Based Pricing (OBP) pricing model must be selected in the BDC extranet before mapping. Multiple fees of the same type get summed; if both a percentage and a fixed amount exist for the same type, BDC only uses the percentage. Credit card fees are not processed. All fees and taxes are always "not included in price." Cancellation policy changes can trigger rate restrictions — requires contacting BDC via Extranet Inbox. Bedding composition must exactly match max occupancy. If the property's country isn't in the partner agreement, the customer must contact the Booking.com "Home" team to extend it.

## Escalation

Rate restricted by cancellation policy change — customer contacts BDC via Extranet Inbox with their Hotel ID. Country not in agreement — customer contacts BDC "Home" team. Duplicate rooms and data stuck uploading after 24 hours go to RU Fast Support. Connection errors — verify QuickConnect in the extranet first before escalating.
