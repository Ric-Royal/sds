"""Deterministic pricing shared by the ERP and tests. No AI calls or inferred prices."""
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

PENNY = Decimal("0.01")


class PricingError(ValueError):
    pass


def number(value, label, minimum=0):
    if value is None or isinstance(value, bool) or str(value).strip() == "":
        raise PricingError(f"{label} is required.")
    try:
        result = Decimal(str(value))
    except (InvalidOperation, TypeError) as exc:
        raise PricingError(f"{label} must be numeric.") from exc
    if not result.is_finite() or result < minimum:
        raise PricingError(f"{label} must be finite and at least {minimum}.")
    return result


def cash(value):
    return value.quantize(PENNY, rounding=ROUND_HALF_UP)


def milestone_amounts(fee,percentages):
    fee=Decimal(str(fee))
    amounts=[cash(fee*Decimal(str(p))/100) for p in percentages]
    if amounts:amounts[-1]=fee-sum(amounts[:-1],Decimal(0))
    return amounts


def cost_line(line):
    rate = number(line.get("rate"), "Loaded cost rate")
    basis = line.get("basis", "Units")
    if basis == "FTE months":
        quantity = (number(line.get("fte"), "FTE") * number(line.get("months"), "Months")
                    * number(line.get("days_per_month"), "Days per month"))
    elif basis in ("Units", "Days"):
        quantity = number(line.get("quantity"), "Quantity")
    else:
        raise PricingError("Cost basis must be Units, Days or FTE months.")
    return {"quantity": quantity, "amount": cash(quantity * rate)}


def calculate(data):
    duration = number(data.get("duration_months"), "Duration", minimum=1)
    lag = number(data.get("collection_lag_months"), "Collection lag")
    if duration != int(duration) or duration > 60 or lag != int(lag) or lag > 24:
        raise PricingError("Use whole months: duration 1–60 and collection lag 0–24.")
    overhead = number(data.get("overhead_pct"), "Overhead percentage") / 100
    reserve = number(data.get("contingency_pct"), "Contingency percentage") / 100
    margin = number(data.get("margin_pct"), "Margin percentage") / 100
    tax = number(data.get("tax_pct"), "Tax percentage") / 100
    if margin >= 1:
        raise PricingError("Margin must be below 100%.")
    if not data.get("costs"):
        raise PricingError("Add at least one cost line.")
    totals = {"Implementation": Decimal(0), "Monthly support": Decimal(0)}
    rows = []
    for row in data["costs"]:
        allocation = row.get("allocation", "Implementation")
        if allocation not in totals:
            raise PricingError("Choose Implementation or Monthly support for each cost.")
        result = cost_line(row)
        totals[allocation] += result["amount"]
        rows.append(result)
    direct = totals["Implementation"]
    overhead_cost = cash(direct * overhead)
    contingency = cash((direct + overhead_cost) * reserve)
    total_cost = direct + overhead_cost + contingency
    fee = cash(total_cost / (1 - margin))
    tax_cost = cash(fee * tax)
    support_reserve = number(data.get("support_contingency_pct"), "Support contingency") / 100
    support_cost = cash(totals["Monthly support"] * (1 + overhead) * (1 + support_reserve))
    support_fee = cash(support_cost / (1 - margin))
    shares, cashflow = [], []
    for milestone in data.get("milestones", []):
        month = number(milestone.get("month"), "Milestone month", minimum=1)
        if month != int(month) or month > duration:
            raise PricingError("Milestone months must be whole months within the implementation period.")
        share = number(milestone.get("fee_pct"), "Milestone fee percentage")
        shares.append((int(month), share / 100))
    allocation = sum((share for _, share in shares), Decimal(0))
    if shares and allocation != 1:
        raise PricingError("Milestone fee percentages must total exactly 100%.")
    scheduled=[(month,amount) for (month,_),amount in zip(shares,milestone_amounts(fee,[share*100 for _,share in shares]),strict=True)]
    balance, lowest = Decimal(0), Decimal(0)
    for month in range(1, int(duration + lag) + 1):
        invoice = sum((amount for due, amount in scheduled if due == month), Decimal(0))
        receipts = sum((amount for due, amount in scheduled if due + lag == month), Decimal(0))
        spend = cash(total_cost / duration) if month <= duration else Decimal(0)
        if month == duration:
            spend = total_cost - cash(total_cost / duration) * (duration - 1)
        balance += receipts - spend
        lowest = min(lowest, balance)
        cashflow.append({"month": month, "invoiced": invoice, "collected": receipts,
                         "cost_and_reserve": spend, "balance": balance})
    return {"costs": rows, "direct_cost": direct, "overhead_cost": overhead_cost,
            "contingency_cost": contingency, "total_cost": total_cost, "fee_before_tax": fee,
            "tax_amount": tax_cost, "total_price": fee + tax_cost,
            "contribution": fee - total_cost, "support_direct_cost": totals["Monthly support"],
            "support_cost": support_cost, "support_fee": support_fee,
            "support_contribution": support_fee - support_cost,
            "peak_funding": -lowest if shares else None, "cashflow": cashflow,
            "milestone_allocation": allocation}
