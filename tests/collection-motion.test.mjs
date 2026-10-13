import test from 'node:test';
import assert from 'node:assert/strict';
import {createCollectionMotion} from '../src/components/landscape/collection-motion.ts';

test('photographic recovery retires GPU ownership and ignores late readiness',()=>{
  const motion=createCollectionMotion(true,false,false);
  assert.equal(motion.fallback(),true);
  const recovered=motion.snapshot();
  assert.equal(recovered.phase,'active');
  assert.equal(recovered.renderer,'fallback');
  assert.equal(recovered.allowGPU,false);
  motion.rendererReady('webgl');
  assert.equal(motion.snapshot(),recovered);
  assert.equal(motion.open(),false);
});

test('recovery cancels pending opening without reopening a closing or restored selection',()=>{
  const motion=createCollectionMotion(true,false,false);
  motion.rendererReady('webgl');
  assert.equal(motion.open(),true);
  assert.equal(motion.fallback(),true);
  motion.activate();
  assert.equal(motion.snapshot().renderer,'fallback');
  assert.equal(motion.close(),true);
  const closing=motion.snapshot();
  assert.equal(motion.fallback(),false);
  motion.rendererReady('webgl');
  assert.equal(motion.snapshot(),closing);
  const restored=createCollectionMotion(true,false,true);
  assert.equal(restored.fallback(),false);
  restored.rendererReady('webgl');
  assert.equal(restored.snapshot().renderer,'photographic');
  assert.equal(restored.snapshot().phase,'active');
});

test('readiness from one retired selection cannot change another selection',()=>{
  const previous=createCollectionMotion(true,false,false);
  previous.close();
  const next=createCollectionMotion(true,false,false);
  next.rendererReady('webgl');
  next.open();
  previous.rendererReady('fallback');
  previous.activate();
  assert.equal(previous.snapshot().phase,'closing');
  assert.equal(next.snapshot().phase,'opening');
  assert.equal(next.snapshot().renderer,'webgl');
});
