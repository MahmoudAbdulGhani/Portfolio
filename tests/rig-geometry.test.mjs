import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createRig, sheet } from '../src/components/landscape/rig-models.ts';

test('swept panels have finite thickness and two closed skins with all rims', () => {
  const geometry = sheet((u, v) => new THREE.Vector3(u, v, 0), 0.035, 4, 4);
  const vertices = geometry.getAttribute('position'), indices = geometry.index.array;
  const edges = new Map();
  for (let i = 0; i < indices.length; i += 3) for (let edge = 0; edge < 3; edge++) {
    const a = indices[i + edge], b = indices[i + (edge + 1) % 3];
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    edges.set(key, (edges.get(key) ?? 0) + 1);
  }
  assert.ok([...edges.values()].every(count => count === 2), 'missing or duplicated rim');
  assert.ok([...vertices.array].every(Number.isFinite));
  assert.ok(Math.abs(geometry.boundingBox.max.z - geometry.boundingBox.min.z - 0.035) < 1e-7);
});

test('each sculpture keeps its own articulation with hinges attached to its physical parts', () => {
  for (const kind of ['jobpilot', 'lobby', 'cedar']) {
    const { group, joints } = createRig(kind);
    assert.equal(joints.length, kind === 'lobby' ? 3 : 6);
    for (const { pivot, rotation } of joints) {
      if (kind === 'lobby') {
        const rod = pivot.children.find(child => child.name === 'support-rod');
        assert.equal(rod.position.x, 0); assert.equal(rod.position.z, 0);
        assert.ok(pivot.children.some(child => child.name === 'hinge-axle' && child.position.y > 0));
      } else {
        const hinge = pivot.children.find(child => child.name === 'hinge-axle' && child.position.y === 0);
        assert.ok(hinge, 'pivot does not meet its hinge');
        if (kind === 'jobpilot') assert.equal(rotation.x, 1.02);
        else assert.ok(rotation.z === 0 || rotation.z === Math.PI / 2);
      }
    }
    group.traverse(object => {
      if (object instanceof THREE.Mesh) assert.ok([...object.geometry.attributes.position.array].every(Number.isFinite));
    });
  }
});

test('closed Cedar beams have clearance in depth instead of intersecting at their crossings', () => {
  const { group, joints } = createRig('cedar');
  group.updateMatrixWorld(true);
  const boxes = joints.map(({ pivot }) => {
    const beam = pivot.children.find(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry);
    beam.geometry.computeBoundingBox();
    return beam.geometry.boundingBox.clone().applyMatrix4(beam.matrix).applyMatrix4(pivot.matrix);
  });
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    const clearance = Math.max(a.min.z - b.max.z, b.min.z - a.max.z);
    assert.ok(clearance > 0.015, `beams ${i}/${j} overlap or have insufficient clearance`);
  }
});
