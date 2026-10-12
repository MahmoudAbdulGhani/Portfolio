import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {calculateCedarFigures, cedarReducer as reduce, initialCedar, sampleFigures} from '../src/components/landscape/cedar-boundary-state.ts';
const fixture=JSON.parse(await readFile(new URL('./fixtures/cedar-advisor-calculations.json',import.meta.url),'utf8'));
test('calculation matches the inspected Python/Decimal source fixtures, including boundaries',()=>{
  for(const row of fixture.cases){
    const figures=calculateCedarFigures(row.contract,row.actual,row.progress);
    assert.equal(figures.total.toFixed(2),row.total);
    assert.equal(figures.margin.toFixed(2)+'%',row.margin);
    assert.equal(figures.costRatio.toFixed(2)+'%',row.costRatio);
    assert.ok(figures.total>=row.actual);
  }
});
test('local sample rejects invalid amounts rather than producing unreadable values',()=>{
  for(const row of [[NaN,40000,50],[100000,Infinity,50],[100000,40000,NaN],[-1,40000,50],[100000,-1,50]])assert.throws(()=>calculateCedarFigures(...row),RangeError);
});
test('interpretation reads figures without changing them; changing an input preserves the old text until refresh',()=>{
  let state=initialCedar();const before=sampleFigures(state.progress);
  state=reduce(state,{type:'interpret'});
  assert.deepEqual(sampleFigures(state.progress),before);
  const old=state.interpretation;
  state=reduce(state,{type:'change',progress:25});
  assert.equal(sampleFigures(state.progress).total,160000);
  assert.equal(state.interpretation,old);
  assert.equal(old.progress,50);
  state=reduce(state,{type:'interpret'});
  assert.equal(state.interpretation.progress,25);
  assert.match(state.interpretation.text,/160,000\.00/);
  assert.equal(sampleFigures(state.progress).total,160000);
});
test('reset clears every teaching phase and invalid/no-op input actions cannot restore obsolete text',()=>{
  for(const actions of [[{type:'interpret'}],[{type:'change',progress:0}],[{type:'interpret'},{type:'change',progress:25}],[{type:'change',progress:75},{type:'interpret'}]]){
    const state=actions.reduce(reduce,initialCedar());
    const reset=reduce(state,{type:'reset'});
    assert.equal(reset.progress,50);assert.equal(reset.interpretation,null);assert.equal(reset.phase,'inspect');
    assert.equal(reduce(reset,{type:'change',progress:NaN}),reset);
    assert.equal(reduce(reset,{type:'change',progress:50}),reset);
  }
});
test('zero-progress sample explains the source fallback without pretending it is a completion prediction',()=>{
  const state=reduce(reduce(initialCedar(),{type:'change',progress:0}),{type:'interpret'});
  assert.equal(sampleFigures(0).total,40000);
  assert.match(state.interpretation.text,/does not extrapolate/);
  assert.match(state.interpretation.text,/not evidence/);
});
