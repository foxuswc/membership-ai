import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from engine import decide

def order(price=65,**kwargs):return {'price':price,'provided':True,'eligible':True,'state':'available',**kwargs}
def req(query='看电影',member='vip',orders=None,**kw):return {'query':query,'member':member,'qualified':True,'orders':orders or {'movie':order()},**kw}
class EngineTests(unittest.TestCase):
 def test_movie(self):self.assertEqual(decide(req())['saving'],5)
 def test_expired(self):self.assertEqual(decide(req(orders={'movie':order(state='expired')}))['action'],'silent')
 def test_used(self):self.assertEqual(decide(req(orders={'movie':order(state='used')}))['saving'],0)
 def test_unclaimed(self):self.assertEqual(decide(req(orders={'movie':order(state='unclaimed')}))['items'][0]['state'],'claim')
 def test_new_movie(self):self.assertEqual(decide(req(member='normal'))['action'],'silent')
 def test_threshold(self):self.assertEqual(decide(req(orders={'movie':order(5)}))['saving'],0)
 def test_missing(self):self.assertEqual(decide(req(orders={'movie':{}}))['action'],'verify')
 def test_covered(self):self.assertEqual(decide(req(member='normal',orders={'movie':order(covered=True)}))['saving'],0)
 def test_worse(self):self.assertEqual(decide(req(orders={'movie':order(worse=True)}))['action'],'silent')
 def test_unknown(self):self.assertEqual(decide(req(orders={'movie':order(state='unknown')}))['action'],'verify')
 def test_trip(self):
  x=decide(req('酒店早餐，晚上看电影，预算600',orders={'hotel':order(606,alternative=498,covered_people=1),'movie':order()}));self.assertEqual((x['saving'],x['after'],x['action']),(113,558,'use'))
 def test_budget(self):
  x=decide(req('酒店早餐，晚上看电影，预算600',member='normal',orders={'hotel':order(606,alternative=498,covered_people=1),'movie':order()}));self.assertEqual((x['net'],x['after'],x['action']),(25,646,'adjust_budget'))
 def test_breakfast_not_needed(self):self.assertEqual(decide(req('住酒店不需要早餐',orders={'hotel':order(606,alternative=498)}))['saving'],0)
 def test_coverage_people(self):self.assertEqual(decide(req('两人住酒店需要早餐',orders={'hotel':order(606,alternative=498,covered_people=1)}))['action'],'verify')
 def test_refund(self):self.assertEqual(decide(req('机票退票',orders={'refund':order(1000)}))['saving'],120)
 def test_refund_new(self):self.assertEqual(decide(req('机票退票',member='normal',orders={'refund':order(1000)}))['action'],'verify')
 def test_open_qualified(self):self.assertEqual(decide(req('机票退票',member='normal',orders={'refund':order(1000,new_eligible=True)}))['action'],'open')
 def test_unknown_qualification(self):self.assertEqual(decide(req(member='normal',qualified=False))['action'],'verify')
 def test_no_intent(self):self.assertEqual(decide(req('你好'))['action'],'no_intent')
 def test_food(self):self.assertEqual(decide(req('点外卖',orders={'food':order(35)}))['saving'],5)
class ModelBoundaryTests(unittest.TestCase):
 def test_model_fallback(self):
  from unittest.mock import patch
  with patch('engine.parse_llm',side_effect=RuntimeError('offline')):
   x=decide(req(mode='llm'));self.assertTrue(x['warning']);self.assertIn('规则基线',x['intent']['source']);self.assertEqual(x['saving'],5)
 def test_model_intent_cannot_override_money(self):
  from unittest.mock import patch
  with patch('engine.parse_llm',return_value={'scenes':['movie'],'breakfast':False,'budget':100,'people':1,'source':'模拟模型输出','saving':999}):
   x=decide(req(mode='llm'));self.assertEqual(x['saving'],5)
if __name__=='__main__':unittest.main()
