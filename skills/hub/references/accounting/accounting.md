# Accounting

Domain knowledge for investigating payouts, settlements, and earning strategies in Rental Ninja.

All accounting data lives in the `hub` MCP server. All accounting tools are **read-only** — they cannot modify payouts, settlements, or strategies.

---

## Domain Model

**Payee** — A person or entity who receives money (property owner, management company, cleaning service). Each payee has a *strategy* that defines how their earnings are calculated.

**Settlement** — A time period (e.g. "March 2026") that groups bookings for payout calculation. Settlements have date ranges, a currency, and flags: `on_check_out` (include bookings by checkout date vs. check-in) and `on_net_income` (calculate on net income vs. gross).

**Payout** — One payee's earnings for one settlement. Contains line items (details) showing each income/expense with its source.

**Payout Detail (line item)** — A single calculated amount. Has: `name`, `value` (positive=income, negative=expense), `type` (income/expense), `strategy` (percentage/fixed/custom), `strategy_amount`, `original_name`, `original_value`, and `rental_id`. These are the atoms of payout math.

**Booking** — The source data. Bookings feed into settlements based on date range + settlement flags. Each booking carries rental price, fees, and taxes — these are the raw inputs that strategies transform into payout line items.

## Strategy Hierarchy (3 levels, evaluated top-down)

1. **Default percentages** — Base rules per payee: "earns 80% of rental revenue, 0% of fees, 100% of taxes." Applies to all rentals unless overridden.

2. **Custom rules** — Override defaults for specific rentals or fee/tax names. Can filter by name (contains/not-contains). Example: "For Villa Rosa, earn 90% of rentals" or "For fees containing 'cleaning', earn 0%."

3. **Recurring items** — Fixed amounts added per settlement, per booking, or per rental. Example: "Management fee of -200 per settlement" or "+50 per booking for admin."

**Key insight**: Custom rules win over defaults for matching items. If a custom rule targets a specific rental, the default percentage is ignored for that rental's bookings. Recurring items stack on top of everything.

## Common Root Causes

When a payout looks wrong, the root cause is almost always one of these:

- **Strategy changed after generation** — The payee's rules were edited after the payout was created. The recalculate-preview tool reveals this instantly: it compares what the current strategy *would* produce vs. what's actually stored.

- **Booking data drifted** — A booking's price, fees, or taxes were modified after the payout was generated. Compare the settlement's booking data against the payout's `original_value` fields.

- **Name mismatch in custom rules** — A custom rule filters by fee/tax name (e.g. "contains 'cleaning'"), but the actual fee name is slightly different (e.g. "Cleaning Fee" vs "cleaning service"). Check the rule's `name_filter` against actual booking fee names.

- **Wrong settlement flags** — `on_check_out` vs check-in date, or `on_net_income` vs gross. A booking might fall into a different settlement than expected.

- **Missing or extra bookings** — The settlement's date range or rental filter doesn't capture expected bookings, or captures unexpected ones. Compare the settlement bookings list against what the user expects.

- **Recurring item scope** — A recurring item scoped to specific rentals may not apply to the rental in question. Check whether the item's rental list matches.

## Investigation Approach

Start broad, narrow down. Get the big picture first (settlement list, payout summary), then drill into the specific payout and payee strategy.

Recommended sequence:

1. Find the relevant payee with `list_payees`. If multiple and unclear which, report all.
2. Find the settlement period with `list_settlements`. If no date range given, check the last 3 months.
3. Review the earning rules with `get_payee_strategy` to understand the configuration.
4. Run `recalculate_payout_preview` to compare stored vs. recalculated amounts — this is the fastest way to spot whether something changed.
5. If mismatches found, verify input booking data with `get_settlement_bookings`.
6. For a specific payout, use `get_payout_detail` for the line-item breakdown.

## Communication

Property managers are not accountants. When explaining findings:

- Lead with the answer: "The March payout is lower because..."
- Use concrete numbers: "Villa Rosa earned 2,400 (80% of 3,000) instead of 2,700 (90% of 3,000)"
- Name the root cause plainly: "The percentage was changed from 90% to 80% on March 5th"
- If recommending action, be specific: "Re-generate the payout to apply the current strategy" or "The booking price needs to be corrected from X to Y"
- For thread notes and drafts, follow hub skill conventions (AI footer tag, match customer language for replies, English for notes)

## Safety

- The recalculation tool is a **dry-run preview** — it does not change any stored data
- When findings contradict a customer's claim, present the evidence factually — don't hedge or apologize for the math
- Report exact numbers from tools — don't round or estimate (€1,234.56, not "about €1,200")
- Financial communication with customers needs human review — produce research notes rather than customer-facing drafts for accounting topics

## Available Tools

- `list_payees(company_id, name)` — find payees (owners/managers receiving payouts)
- `get_payee_strategy(company_id, payee_id)` — earning rules, custom overrides, recurring items
- `list_settlements(company_id, date_from, date_to, rental_id)` — browse settlement periods
- `get_settlement_detail(company_id, settlement_id)` — full settlement with payouts, invoices, attachments
- `get_payout_detail(company_id, payout_id)` — single payout with line items and payment history
- `query_payout_summary(company_id, ...)` — aggregate payout amounts, group by settlement/rental/payee
- `recalculate_payout_preview(company_id, settlement_id, payout_id)` — compare stored vs. fresh calculation
- `get_settlement_bookings(company_id, settlement_id)` — bookings feeding into a settlement
