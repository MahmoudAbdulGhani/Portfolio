import * as THREE from "three";
export type RigKind = "jobpilot" | "lobby" | "cedar";

// Closed, finite-thickness swept surfaces. Both skins and all four rims are real geometry.
export function sheet(
  point: (u: number, v: number) => THREE.Vector3,
  thickness = 0.035,
  nu = 44,
  nv = 22,
) {
  const vertices = [],
    indices: number[] = [];
  const epsilon = 0.0001;
  for (let side = 0; side < 2; side++)
    for (let v = 0; v <= nv; v++)
      for (let u = 0; u <= nu; u++) {
        const x = u / nu,
          y = v / nv,
          p = point(x, y);
        const du = point(Math.min(1, x + epsilon), y).sub(
          point(Math.max(0, x - epsilon), y),
        );
        const dv = point(x, Math.min(1, y + epsilon)).sub(
          point(x, Math.max(0, y - epsilon)),
        );
        const n = du
          .cross(dv)
          .normalize()
          .multiplyScalar(thickness * (side ? -0.5 : 0.5));
        p.add(n);
        vertices.push(p.x, p.y, p.z);
      }
  const stride = nu + 1,
    skin = stride * (nv + 1);
  const quad = (a: number, b: number, c: number, d: number, reverse = false) =>
    indices.push(...(reverse ? [a, c, b, a, d, c] : [a, b, c, a, c, d]));
  for (let v = 0; v < nv; v++)
    for (let u = 0; u < nu; u++) {
      const a = v * stride + u;
      quad(a, a + 1, a + stride + 1, a + stride);
      quad(a + skin, a + stride + skin, a + stride + 1 + skin, a + 1 + skin);
    }
  for (let u = 0; u < nu; u++) {
    quad(u, u + skin, u + 1 + skin, u + 1);
    const a = nv * stride + u;
    quad(a, a + 1, a + 1 + skin, a + skin);
  }
  for (let v = 0; v < nv; v++) {
    const a = v * stride,
      b = a + nu;
    quad(a, a + stride, a + stride + skin, a + skin);
    quad(b, b + skin, b + stride + skin, b + stride);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  return geo;
}
export function createRig(kind: RigKind, lowResolution = false) {
  const group = new THREE.Group(),
    joints = [];
  const materials = {
    oxide: new THREE.MeshStandardMaterial({
      color: "#A44424",
      roughness: 0.61,
      metalness: 0.06,
    }),
    paper: new THREE.MeshStandardMaterial({ color: "#E9E4D7", roughness: 0.8 }),
    forest: new THREE.MeshStandardMaterial({
      color: "#34483D",
      roughness: 0.65,
    }),
    sage: new THREE.MeshStandardMaterial({ color: "#A7B7A4", roughness: 0.72 }),
    ink: new THREE.MeshStandardMaterial({ color: "#292E2D", roughness: 0.59 }),
    metal: new THREE.MeshStandardMaterial({
      color: "#B8BBB4",
      metalness: 0.86,
      roughness: 0.22,
    }),
  };
  const mesh = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    parent = group,
  ) => {
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const pin = (parent: THREE.Group, x: number, y: number, z: number) => {
    const p = mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.32, 12),
      materials.metal,
      parent,
    );
    p.name = 'hinge-axle';
    p.rotation.x = Math.PI / 2;
    p.position.set(x, y, z);
    const cap = mesh(
      new THREE.SphereGeometry(0.055, 12, 8),
      materials.metal,
      parent,
    );
    cap.name = 'hinge-cap';
    cap.position.set(x, y, z + 0.18);
  };
  if (kind === "jobpilot") {
    const base = mesh(
      new THREE.CylinderGeometry(0.95, 1, 0.15, 64),
      materials.oxide,
    );
    base.position.y = -1.5;
    const axle = mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 3.15, 16),
      materials.metal,
    );
    axle.position.y = 0.02;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3,
        pivot = new THREE.Group();
      group.add(pivot);
      pivot.position.set(Math.sin(angle) * 0.55, -1.4, Math.cos(angle) * 0.55);
      pivot.rotation.y = angle;
      const geo = sheet(
        (u, v) => {
          // Keep neighbouring panels in separate angular sectors. The narrow
          // root meets its hinge instead of passing through the next panel.
          const a = (u - 0.5) * 0.88 + v * 0.32,
            r = 0.16 + Math.sin(v * Math.PI * 0.72) * 1.05;
          return new THREE.Vector3(
            Math.sin(a) * r,
            v * [2.6, 3.15, 2.95, 1.25, 1.55, 1.3][i] +
              (u - 0.5) * [0.9, -0.75, 0.5, -0.45, 0.6, -0.55][i] * v * v,
            Math.cos(a) * r - 0.16,
          );
        },
        0.035,
        lowResolution ? 28 : 48,
        lowResolution ? 16 : 28,
      );
      mesh(geo, i % 2 ? materials.paper : materials.oxide, pivot);
      pin(pivot, 0, 0, 0);
      joints.push({
        pivot,
        rotation: {
          x: 1.02,
          y: angle,
          z: 0,
        },
        position: {
          x: Math.sin(angle) * 0.55,
          y: -1.4,
          z: Math.cos(angle) * 0.55,
        },
        delay: i * 0.045,
      });
    }
  } else if (kind === "lobby") {
    for (let i = 0; i < 3; i++) {
      const pivot = new THREE.Group();
      group.add(pivot);
      pivot.rotation.y = (i * Math.PI) / 3;
      // Unfurl about the support rod, rather than orbiting the ribbon centre.
      // The offset preserves the accepted closed ribbon geometry exactly.
      const hinge = new THREE.Vector3(0.8, 0, 0.28);
      pivot.position.copy(hinge).applyEuler(pivot.rotation);
      const ribbon = new THREE.Group();
      ribbon.position.copy(hinge).negate();
      pivot.add(ribbon);
      const geo = sheet(
        (u, v) => {
          const a = u * Math.PI * 2;
          return new THREE.Vector3(
            Math.cos(a) * (1.35 + (v - 0.5) * 0.4),
            Math.sin(a) * 1.35 + (v - 0.5) * 0.34,
            // Offset the three ribbon paths in depth to avoid coplanar seams.
            Math.sin(a * 2 + i) * 0.3 + (v - 0.5) * 0.18 + (i - 1) * 0.24,
          );
        },
        0.035,
        lowResolution ? 56 : 96,
        lowResolution ? 6 : 8,
      );
      mesh(geo, [materials.ink, materials.sage, materials.paper][i], ribbon);
      const rod = mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 2.6, 12),
        materials.metal,
        pivot,
      );
      rod.name = 'support-rod';
      pin(pivot, 0, -1.23, 0);
      pin(pivot, 0, 1.23, 0);
      const opening = new THREE.Euler((i - 1) * 0.38, (i * Math.PI) / 3 + (i - 1) * 0.72, (i - 1) * 0.38);
      const destination = hinge.clone().applyEuler(opening).add(new THREE.Vector3((i - 1) * 2.85, i % 2 ? 0.65 : -0.1, (i - 1) * 0.6));
      joints.push({
        pivot,
        rotation: {
          x: opening.x, y: opening.y, z: opening.z,
        },
        position: {
          x: destination.x, y: destination.y, z: destination.z,
        },
        delay: i * 0.09,
      });
    }
  } else {
    const beams = [
      [-0.85, 0, 0.2, 0],
      [0.65, 0, -0.1, 0],
      [0, 1, -0.40, Math.PI / 2],
      [0, -1, 0.50, Math.PI / 2],
      [0.1, 0, 0.80, -0.72],
      [-0.4, 0.4, -0.70, 0.68],
    ];
    beams.forEach(([x, y, z, a], i) => {
      const pivot = new THREE.Group();
      group.add(pivot);
      pivot.rotation.z = a;
      const hinge = new THREE.Vector3(0, 1.12, 0);
      pivot.position.copy(new THREE.Vector3(x, y, z)).sub(hinge.clone().applyEuler(pivot.rotation));
      const beam = mesh(
        new THREE.BoxGeometry(0.31, 2.8, 0.28),
        i === 2 || i === 5 ? materials.paper : materials.forest,
        pivot,
      );
      beam.position.copy(hinge);
      pin(pivot, 0, 0, 0.15);
      pin(pivot, 0, 2.24, 0.15);
      const side = i % 2 ? 1 : -1;
      const opening = new THREE.Euler(0, side * 0.12, i < 2 ? 0 : Math.PI / 2);
      const destination = new THREE.Vector3(i < 2 ? side * 2.9 : 0, i < 2 ? 0 : i < 4 ? side * 1.8 : side * 2.15, (i - 2) * 0.12)
        .sub(hinge.clone().applyEuler(opening));
      joints.push({
        pivot,
        rotation: { x: opening.x, y: opening.y, z: opening.z },
        position: {
          x: destination.x, y: destination.y, z: destination.z,
        },
        delay: i * 0.055,
      });
    });
  }
  group.rotation.set(0.03, -0.26, 0);
  return { group, joints };
}
