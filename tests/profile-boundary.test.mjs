import test from 'node:test';
import assert from 'node:assert/strict';
import { boundaryReducer as reduce, initialBoundary, proposedLocation } from '../src/components/landscape/profile-boundary-state.ts';

test('proposals and review never change saved values; explicit acceptance does', () => {
  let state = initialBoundary();
  assert.equal(reduce(state, 'accept'), state);
  state = reduce(state, 'propose');
  assert.equal(state.saved, 'Beirut');
  assert.equal(reduce(state, 'accept'), state);
  state = reduce(state, 'review');
  assert.equal(state.saved, 'Beirut');
  assert.equal(state.reviewed.saved, 'Beirut');
  state = reduce(state, 'accept');
  assert.equal(state.saved, proposedLocation);
  assert.equal(state.phase, 'accept');
  assert.equal(reduce(state, 'accept'), state);
});
test('a stale review cannot overwrite changed information and requires a fresh review', () => {
  let state = reduce(reduce(initialBoundary(), 'propose'), 'review');
  state = reduce(state, 'change-saved');
  assert.equal(state.saved, 'Byblos');
  assert.equal(state.reviewed.saved, 'Beirut');
  state = reduce(state, 'accept');
  assert.equal(state.saved, 'Byblos');
  assert.equal(state.blocked, true);
  state = reduce(state, 'review');
  assert.equal(state.reviewed.saved, 'Byblos');
  assert.equal(state.blocked, false);
  assert.equal(reduce(state, 'accept').saved, proposedLocation);
});
test('reset retires every phase and obsolete actions cannot restore proposals or writes', () => {
  for (const actions of [['propose'],['propose','review'],['propose','review','change-saved','accept'],['propose','review','accept']]) {
    const before = actions.reduce(reduce, initialBoundary());
    const reset = reduce(before, 'reset');
    assert.equal(reset.saved, 'Beirut');
    assert.equal(reset.reviewed, null);
    assert.equal(reset.phase, 'rest');
    assert.equal(reduce(reset, 'accept'), reset);
    assert.equal(reduce(reset, 'review'), reset);
  }
});
