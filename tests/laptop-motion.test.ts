import { test } from "node:test";
import assert from "node:assert/strict";
import { PerspectiveCamera, Vector3 } from "three";
import { LAPTOP, laptopPose } from "../src/lib/laptop-motion.ts";

test("final live HTML screen projects exactly to all four viewport corners", () => {
  for (const [width, height] of [[310, 768], [380, 768], [430, 768], [768, 900], [1188, 860], [1800, 564]]) {
    const aspect = width / height;
    const pose = laptopPose(1, aspect, width < 1024);
    const camera = new PerspectiveCamera(40, aspect, .1, 100);
    camera.position.set(...pose.camera); camera.lookAt(new Vector3(...pose.target)); camera.updateMatrixWorld();
    for (const x of [-1, 1]) for (const y of [-1, 1]) {
      const point = new Vector3(x * pose.width / 2, LAPTOP.hingeY + LAPTOP.screenY + y * LAPTOP.screenHeight / 2, LAPTOP.hingeZ + LAPTOP.screenZ).project(camera);
      assert.ok(Math.abs(point.x - x) < 1e-6, `${width}px horizontal corner`);
      assert.ok(Math.abs(point.y - y) < 1e-6, `${width}px vertical corner`);
    }
  }
});
test("scroll reversal restores the same physical hinge and camera pose", () => {
  const forward = [0, .12, .3, .48, .7, 1].map(p => laptopPose(p, .5, true));
  const backward = [1, .7, .48, .3, .12, 0].map(p => laptopPose(p, .5, true)).reverse();
  assert.deepEqual(forward, backward);
  assert.ok(forward[0].lidAngle > 1.5); assert.ok(Math.abs(forward.at(-1)!.lidAngle) < 1e-6);
  assert.equal(forward[0].screenOpacity, 0); assert.equal(forward.at(-1)!.hardwareOpacity, 0);
});
