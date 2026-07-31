# Rental Ninja product knowledge (snapshot)

Baseline of what Rental Ninja actually does, sourced from the Help Center docs
(`ninja-docs`) via the Hub MCP `search_docs` tool.

**This is a snapshot, not the source of truth.** The product changes; the Hub
tools do not go stale. Use this to know *which* features exist and what they are
called, then verify any claim you are about to publish with `search_docs` /
`search_changelog`. When the two disagree, the live tools win — and update this
file. Mirrors `src/lib/cms/product-knowledge.ts` in `ninja-tanstack`; re-verify
every few months.

**Rental Ninja Product Knowledge (verified — cite these, don't invent beyond them):**

**Channel Manager (Airbnb, Booking.com, and other OTAs)**
- Two sync levels: Limited sync (availability, rates, minimum stay only) and Full/Complete sync (adds damage deposit, same-day booking cutoff, fees & taxes, extra guest price, discounts, property content, photos, cancellation policy).
- Rates, availability and minimum stay sync instantly. Other content updates are pushed on a 4-hour cycle and are usually visible on the channel within 24 hours.
- Some fields (listing name/type, cancellation policy, check-in amenities, check-in/out times, min/max sleeps, VAT & city tax) only update via a manual "Update listing content" trigger — never automatically.
- Some fields never sync at all with Booking.com (e.g. descriptions, discounts, floor number, down payment, terms & conditions).
- Only one channel manager can be connected per Airbnb account at a time.

**Direct Booking Website & Booking Engine**
- Property managers can launch their own branded direct-booking website (Distribution > Websites) using their own domain/subdomain.
- Rental Ninja charges a small commission (around 0.5%) on bookings made through that website.
- The direct booking website supports Instant Booking only — no "Request to Book" flow.
- Includes a "Magic Write" AI tool to help draft the website's marketing texts in multiple languages.

**Guest Module (Pre-Check-in Form + Online Guest Portal)**
- Automated Pre-Check-in Form emailed to guests before arrival (up to 3 reminders), with an optional SMS reminder (SMS has a small extra cost per message).
- Collects arrival details (ETA, transport), contact info, and optionally passport/ID details + a photo of the document.
- After completing the form, guests get access to the Online Guest Portal: property address/map, contact & WiFi info, self check-in code/instructions, live booking payment status, and a Welcome Book/Guide (text, images, video, links) with house rules and how to use the property.
- The self check-in (lockbox) code can be configured to stay hidden until check-in time and/or until the booking is fully paid.
- Guests can also skip the form entirely and be given portal access directly via a QR code or a Guest Login Code (found inside each booking).
- There's a companion Guest mobile app; once a guest has logged in once, portal info stays available offline.

**Ninja Smart Pricing (dynamic pricing)**
- Automatically adjusts nightly rates based on a base price plus min/max limits, weekend and seasonality strategies, last-minute discounts, and real occupancy pace — instead of manual night-by-night rate editing.
- Calculated prices can be previewed before being applied; any date can still be manually overridden afterward.
- Channel markup guidance: most managers run in the 16–25% range, and markup should offset a channel's actual promotions/discounts (e.g. Booking Genius, mobile deals) rather than just being a hidden price hike — an excessive, uncompensated markup mainly just hurts occupancy.
- Supports custom seasonality periods and dedicated long-stay pricing rules layered on top of minimum-stay settings.

**Accounting (Statements, Payments/Payouts)**
- A Statement summarizes booking income for a chosen period and set of properties (based on check-in date).
- Payments/Payouts are calculated by applying each Recipient's Strategy (e.g. the agency, a rental owner, the cleaning company) to a Statement's income — this is what determines who gets paid what.
- Statements/Payments can be automated on a schedule (Scheduled Statements & Payments) instead of created manually each time.
- Exportable outputs include a Booking Breakdown, a General Income summary, Invoices per Recipient, and a Net Income per Recipient report (PDF/Excel).

**Task Module (Scheduled Jobs & Recurring Jobs — automations)**
- Scheduled Jobs are tied to bookings — e.g. a cleaning job is auto-created around check-out, with a default 48-hour completion window that automatically tightens if the gap to the next booking is shorter.
- Recurring Jobs are NOT tied to any booking (daily/weekly/monthly cadence) — used for things like pool/office cleaning or periodic admin checks.
- Both use reusable Job Templates (checklists) and can be assigned to one person or to an entire Team Role, where anyone with that role and rental access can claim the job.
- An optional "Inspector" can approve or reject a completed job; a rejected job reopens on the assignee's list.
- Team members get push notifications when jobs are created or their timing changes.

**Team Roles & Permissions**
- Roles: Team Owner, Administrator, Rental Manager, Rental Owner, Cleaning Staff, Check-in Agent, Maintenance Staff, Member.
- Only the Team Owner can manage the subscription; Administrators manage billing/payment method and invoices.
- The Team Owner has access to all rentals by default; per-rental access is configurable for Administrators and Rental Managers.
- Lower roles (Rental Owner, Cleaning Staff, Check-in Agent, Maintenance Staff, Member) cannot see the team-wide Jobs list, cannot inspect jobs, and can only claim jobs assigned to their role.
- Accounting access is all-or-nothing once granted to a team member — it can't be scoped to specific rentals.
- Every permission can still be fine-tuned manually per team member beyond the role's defaults.

**Triggers (automation engine)**
- Can automatically fire a Guest SMS, a Guest message (via the OTA inbox or email), a fixed-recipient SMS/Email, a team notification, or add a Tag to a booking — based on booking events.
- SMS-based automations carry a small extra cost per message sent.
