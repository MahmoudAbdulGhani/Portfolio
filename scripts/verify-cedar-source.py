"""Isolated source-function checks: no Django startup, database or provider."""
import ast
import json
import sys
import subprocess
from decimal import Decimal, InvalidOperation
from pathlib import Path
from types import SimpleNamespace

root = Path(next((arg for arg in sys.argv[1:] if not arg.startswith('--')), '.motion-preview/cedar-source'))
revision = subprocess.check_output(['rtk', 'git', '-C', str(root), 'rev-parse', 'HEAD'], text=True).strip()
assert revision == 'ab4aff541fb46b6c54831f16a4352657369c1063', 'Inspect the pinned source checkout, not a moving branch.'
tree = ast.parse((root / 'apps/projects/advisor.py').read_text())
names = {'_to_decimal', '_format_money', '_format_percent', '_project_progress_ratio', '_risk_level', '_build_explanation', '_build_groq_summary', 'get_project_risk_forecast'}
settings = SimpleNamespace(GROQ_API_KEY='')
ns = {'Decimal': Decimal, 'InvalidOperation': InvalidOperation, 'settings': settings, 'Avg': lambda field: field, '_time_progress_percent': lambda project: None, 'get_active_budget': lambda id: None}
exec(compile(ast.Module(body=[node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name in names], type_ignores=[]), 'inspected-advisor.py', 'exec'), ns)
class Phases:
    def __init__(self, progress): self.progress = progress
    def aggregate(self, **kwargs): return {'avg_progress': self.progress}
    def exists(self): return self.progress is not None
cases = []
for contract, cost, progress in [(100000,40000,50),(100000,40000,25),(100000,40000,75),(100000,40000,100),(100000,40000,0),(100000,0,50),(0,40000,50),(100000,40000,-10),(100000,40000,110)]:
    project = SimpleNamespace(id='fictional', code='SAMPLE', name='Fictional project', contract_value=Decimal(contract), phases=Phases(Decimal(progress)))
    ns['get_project_financial_summary'] = lambda project, cost=cost: {'expenses': {'invoiced': str(cost)}}
    result = ns['get_project_risk_forecast'](project)
    cases.append({'contract':contract,'actual':cost,'progress':progress,'total':result['forecast']['estimated_total_cost'],'margin':result['forecast']['estimated_margin'],'costRatio':result['forecast']['cost_to_contract_ratio']})
    assert 'not a prediction' in result['explanation']

args = ('Deterministic fallback', project, 'HEALTHY', Decimal(100000), Decimal(40000), Decimal(80000), Decimal(20), Decimal(40))
summary = ns['_build_groq_summary']
assert summary(*args) == args[0]  # No key: no import/request.
settings.GROQ_API_KEY = 'offline fixture; never sent'
sys.modules['groq'] = None
assert summary(*args) == args[0]  # Missing SDK.
requests = []
class FakeGroq:
    def __init__(self, **kwargs): self.chat = SimpleNamespace(completions=self)
    def create(self, **kwargs):
        requests.append(kwargs)
        if self.failure: raise RuntimeError('offline provider failure')
        return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=self.content))])
FakeGroq.failure = True
sys.modules['groq'] = SimpleNamespace(Groq=FakeGroq)
assert summary(*args) == args[0]
FakeGroq.failure = False
for content in ['', '   ', None, {'not':'text'}]:
    FakeGroq.content = content
    assert summary(*args) == args[0]
FakeGroq.content = '  Sample provider text  '
assert summary(*args) == 'Sample provider text'
assert all('tools' not in request for request in requests)
payload = requests[-1]['messages'][1]['content']
assert "'actual_cost': '40000.00'" in payload and "'estimated_total_cost': '80000.00'" in payload
assert "'invoices'" not in payload and "'phase_progress'" not in payload
fixture = {'sourceRevision':'ab4aff541fb46b6c54831f16a4352657369c1063','sourcePath':'apps/projects/advisor.py','cases':cases}
target = Path('tests/fixtures/cedar-advisor-calculations.json')
if '--emit-fixture' in sys.argv:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(fixture, indent=2)+'\n')
else:
    assert json.loads(target.read_text()) == fixture
print('9 source calculation fixtures and 8 isolated narration/fallback checks passed; no database or network calls')
