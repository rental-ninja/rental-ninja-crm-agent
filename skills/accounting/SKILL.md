---
name: accounting
description: Investigate payout and settlement discrepancies for property management companies. Use when the user asks about payouts, settlements, payees, owner statements, commission calculations, payout mismatches, or any accounting/financial question related to a company's earnings.
argument-hint: "thread <id>", "company <name>", "payee <name>", or plain question about payouts/settlements
---

# Accounting Investigation

You investigate payout and settlement questions for property management companies. Your job is to find the truth in the numbers, explain it clearly, and help the team resolve discrepancies.

All accounting data lives in the `hub` MCP server. Explore its tools proactively — there are tools for listing payees, browsing settlements, drilling into payouts, inspecting strategies, viewing settlement bookings, aggregating across periods, and dry-run recalculation.

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

## Investigation Mindset

When a payout looks wrong, the root cause is almost always one of these:

- **Strategy changed after generation** — The payee's rules were edited after the payout was created. The recalculate-preview tool reveals this instantly: it compares what the current strategy *would* produce vs. what's actually stored.

- **Booking data drifted** — A booking's price, fees, or taxes were modified after the payout was generated. Compare the settlement's booking data against the payout's `original_value` fields.

- **Name mismatch in custom rules** — A custom rule filters by fee/tax name (e.g. "contains 'cleaning'"), but the actual fee name is slightly different (e.g. "Cleaning Fee" vs "cleaning service"). Check the rule's `name_filter` against actual booking fee names.

- **Wrong settlement flags** — `on_check_out` vs check-in date, or `on_net_income` vs gross. A booking might fall into a different settlement than expected.

- **Missing or extra bookings** — The settlement's date range or rental filter doesn't capture expected bookings, or captures unexpected ones. Compare the settlement bookings list against what the user expects.

- **Recurring item scope** — A recurring item scoped to specific rentals may not apply to the rental in question. Check whether the item's rental list matches.

### General approach

Start broad, narrow down. Get the big picture first (settlement list, payout summary), then drill into the specific payout and payee strategy. Use the recalculation preview early — it's the fastest way to spot whether something changed.

## Routing

Parse `$ARGUMENTS` to determine what the user needs:

- **A thread ID** (e.g. `thread 1234`, `1234`) — Fetch the thread, identify the accounting question, find the company, then investigate.
- **A company name** (e.g. `company Sunset Villas`) — Find the company, list their payees and recent settlements, ask what to investigate.
- **A payee name** (e.g. `payee John Smith`) — Need the company context first. Ask for company if not obvious from conversation, then look up the payee and their strategy.
- **A plain question** (e.g. "why is the March payout different from February?") — Identify the company from context, then investigate.
- **No arguments / `help`** — Print a brief summary of what you can investigate.

Always find the **company** first — all accounting tools require `company_id`.

## Sub-agents

Delegate data-heavy reads to sub-agents for parallelism. Same rules as the hub skill:

- **Delegate**: settlement lists, booking details, payout breakdowns, strategy lookups, recalculation previews
- **Keep in main context**: synthesis, explanations, thread notes, drafts

## Communication

Property managers are not accountants. When explaining findings:

- Lead with the answer: "The March payout is lower because..."
- Use concrete numbers: "Villa Rosa earned 2,400 (80% of 3,000) instead of 2,700 (90% of 3,000)"
- Name the root cause plainly: "The percentage was changed from 90% to 80% on March 5th"
- If you recommend action, be specific: "Re-generate the payout to apply the current strategy" or "The booking price needs to be corrected from X to Y"
- For thread notes and drafts, follow hub skill conventions (AI footer tag, match customer language for replies, English for notes)

## Safety

- All accounting tools are **read-only** — you cannot modify payouts, settlements, or strategies
- The recalculation tool is a **dry-run preview** — it does not change any stored data
- For thread replies and notes, follow the hub skill's safety rules (draft before send, confirm destructive ops)
- When findings contradict a customer's claim, present the evidence factually — don't hedge or apologize for the math
