import copy
import unittest
from decimal import Decimal
from sds_ops.pricing import calculate, PricingError


def institutional_example():
    data=dict(duration_months=10,collection_lag_months=2,overhead_pct=8,contingency_pct=12,
        margin_pct=25,tax_pct=0,support_contingency_pct=10,costs=[],milestones=[])
    for fte,rate in [(1,500),(1,600),(1,400),(1,350),(.5,400),(.6,300),(.1,650),(.2,300)]:
        data['costs'].append(dict(basis='FTE months',allocation='Implementation',fte=fte,months=10,days_per_month=20,rate=rate))
    for rate in [24000,12000,10000,8000]:
        data['costs'].append(dict(basis='Units',allocation='Implementation',quantity=1,rate=rate))
    for quantity,rate in [(2,400),(4,300),(6,250),(1,500)]:
        data['costs'].append(dict(basis='Units',allocation='Monthly support',quantity=quantity,rate=rate))
    data['milestones']=[dict(month=m,fee_pct=s) for m,s in [(1,10),(2,15),(4,15),(6,20),(8,20),(10,20)]]
    return data


class PricingTests(unittest.TestCase):
    def test_workbook_parity(self):
        r=calculate(institutional_example())
        self.assertEqual(r['direct_cost'],Decimal('525000.00'))
        self.assertEqual(r['fee_before_tax'],Decimal('846720.00'))
        self.assertEqual(r['support_fee'],Decimal('6336.00'))
        self.assertEqual(r['peak_funding'],Decimal('127008.00'))
        self.assertEqual(sum(row['cost_and_reserve'] for row in r['cashflow']),r['total_cost'])

    def test_receipt_lag_and_no_advance(self):
        data=institutional_example();r=calculate(data)
        self.assertEqual(r['cashflow'][0]['collected'],0)
        data['collection_lag_months']=0
        self.assertEqual(calculate(data)['cashflow'][0]['collected'],Decimal('84672.00'))

    def test_margin_is_margin_not_markup(self):
        data=institutional_example();data['margin_pct']=0
        self.assertEqual(calculate(data)['fee_before_tax'],Decimal('635040.00'))
        data['margin_pct']=100
        with self.assertRaises(PricingError):calculate(data)

    def test_missing_and_nonfinite_costs_are_rejected(self):
        for value in [None,'',float('nan'),float('inf'),-1]:
            data=institutional_example();data['costs'][0]['rate']=value
            with self.subTest(value=value),self.assertRaises(PricingError):calculate(data)

    def test_invalid_milestone_profile(self):
        data=institutional_example();data['milestones'][0]['fee_pct']=11
        with self.assertRaises(PricingError):calculate(data)
        data=institutional_example();data['milestones'][0]['month']=11
        with self.assertRaises(PricingError):calculate(data)

    def test_no_schedule_is_not_zero_funding(self):
        data=institutional_example();data['milestones']=[]
        self.assertIsNone(calculate(data)['peak_funding'])

    def test_rounding_does_not_lose_cost(self):
        data=institutional_example();data['costs'][0]['rate']='500.01';data['duration_months']=11
        r=calculate(data)
        self.assertEqual(sum(row['cost_and_reserve'] for row in r['cashflow']),r['total_cost'])

    def test_milestone_rounding_reconciles_full_contract_value(self):
        data=institutional_example()
        data['costs']=[dict(basis='Units',allocation='Implementation',quantity=1,rate='1.01')]
        data['margin_pct']=0;data['overhead_pct']=0;data['contingency_pct']=0
        data['milestones']=[dict(month=month,fee_pct=share) for month,share in [(1,'33.33'),(2,'33.33'),(3,'33.34')]]
        r=calculate(data)
        self.assertEqual(sum(row['invoiced'] for row in r['cashflow']),r['fee_before_tax'])
        self.assertEqual(sum(row['collected'] for row in r['cashflow']),r['fee_before_tax'])


if __name__=='__main__':unittest.main()
