# SDS / Data and reporting review

SYNTHETIC SAMPLE / NO CLIENT DATA

Generated: 2026-10-14T14:48:51.637Z
Input SHA-256: ba297d2a3968d4292b81f225aa234a0d7061e86b04fcf56fe5058d1e185c3111

Rows: 8. Duplicate rows: 1. Missing cells: 3.

| Field | Missing | Observed types |
| --- | ---: | --- |
| amount_kes | 1 | number, string |
| customer_id | 0 | string |
| plan | 1 | string |
| renewal_date | 1 | string |
| subscription_id | 0 | string |

## Recommended review

- Review duplicate records against the intended record key before removing them.
- Review missing fields against business requirements.
- This assessment reports structure and completeness; it does not verify factual accuracy.

## Limits

- Duplicate rows require a business-key review before removal.
- CSV values remain strings; mixed-type checks are most useful with typed JSON.
- This assessment does not test financial reconciliation, customer churn, accuracy or causation.
- A paid assessment also requires agreed business rules, source checks and a reviewed action plan.
