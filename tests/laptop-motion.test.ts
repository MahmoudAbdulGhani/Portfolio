import { test } from "node:test";
import assert from "node:assert/strict";
import { PerspectiveCamera, Vector3 } from "three";
import { buildLaptopModel } from "../src/lib/laptop-model.ts";
import { LAPTOP, laptopPose } from "../src/lib/laptop-motion.ts";
test("whole laptop fits the shared plate at open and camera approach poses", () => {
    const model = buildLaptopModel(), camera = new PerspectiveCamera(40, LAPTOP.plateAspect, .1, 100);
    for (const p of [.42, .5, .58, .7, .78]) {
        const pose = laptopPose(p, false);
        model.hinge.rotation.x = pose.lidAngle;
        model.root.rotation.y = pose.rotation;
        model.root.updateMatrixWorld(true);
        camera.position.set(...pose.camera);
        camera.lookAt(new Vector3(...pose.target));
        camera.updateMatrixWorld();
        model.root.traverse(mesh => { if (!("isMesh" in mesh) || !mesh.isMesh)
            return; const positions = (mesh as import("three").Mesh).geometry.getAttribute("position"); for (let i = 0; i < positions.count; i++) {
            const point = new Vector3().fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld).project(camera);
            assert.ok(Math.abs(point.x) < 1 && Math.abs(point.y) < 1, `device vertex clips at ${p}`);
        } });
    }
    model.geometry.forEach(g => g.dispose());
    model.materials.forEach(m => m.dispose());
});
test("open hold stays steady and responsive handoff never stretches the display", () => {
    assert.deepEqual(laptopPose(.42, false), laptopPose(.58, false));
    assert.equal(laptopPose(.78, false).handoff, 0);
    assert.equal(laptopPose(.88, false).handoff, 1);
    assert.equal(LAPTOP.screenWidth / LAPTOP.screenHeight, 3.73 / 2.21);
    const forward = [0, .12, .3, .42, .58, .78, .88, 1].map(p => laptopPose(p, false));
    const reverse = [1, .88, .78, .58, .42, .3, .12, 0].map(p => laptopPose(p, false)).reverse();
    assert.deepEqual(forward, reverse);
});
