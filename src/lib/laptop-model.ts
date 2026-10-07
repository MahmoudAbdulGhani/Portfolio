import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
/** Original, unbranded laptop. Shared by the GPU scene and offline rendered frames. */
export function buildLaptopModel() {
    const root = new THREE.Group(), hinge = new THREE.Group();
    const geometry: THREE.BufferGeometry[] = [], materials: THREE.Material[] = [];
    const metal = new THREE.MeshStandardMaterial({ color: 0x424a56, metalness: .72, roughness: .32 });
    const edge = new THREE.MeshStandardMaterial({ color: 0x8c96a3, metalness: .8, roughness: .24 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x11151c, metalness: .1, roughness: .44 });
    const key = new THREE.MeshStandardMaterial({ color: 0x20252d, roughness: .48 });
    const glass = new THREE.MeshStandardMaterial({ color: 0x080d15, roughness: .16, metalness: .15 });
    const legend = new THREE.MeshBasicMaterial({ color: 0x89919c });
    materials.push(metal, edge, dark, key, glass, legend);
    function box(parent: THREE.Group, name: string, size: [
        number,
        number,
        number
    ], at: [
        number,
        number,
        number
    ], mat: THREE.Material, radius = .02) {
        const g = new RoundedBoxGeometry(...size, 2, radius);
        geometry.push(g);
        const mesh = new THREE.Mesh(g, mat);
        mesh.name = name;
        mesh.position.set(...at);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
    }
    box(root, "lower-case", [4.1, .075, 2.64], [0, -.036, .45], dark, .035);
    box(root, "satin-deck", [4.1, .09, 2.64], [0, .03, .45], metal, .045);
    box(root, "deck-edge", [4.02, .016, 2.56], [0, .071, .45], edge, .025);
    box(root, "keyboard-recess", [3.51, .012, 1.44], [0, .083, -.06], dark, .045);
    box(root, "trackpad-outline", [1.43, .008, .75], [0, .085, 1.15], dark, .04);
    box(root, "trackpad", [1.40, .009, .72], [0, .09, 1.15], metal, .035);
    box(root, "opening-notch", [.48, .012, .028], [0, .038, 1.773], dark, .01);
    const labels: {
        text: string;
        position: [
            number,
            number,
            number
        ];
        size: number;
    }[] = [];
    const rows: [
        string[],
        number[]
    ][] = [
        [["esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "◦"], Array(14).fill(1)],
        [["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "−", "=", "delete"], [...Array(13).fill(1), 1.7]],
        [["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"], [1.5, ...Array(12).fill(1), 1.2]],
        [["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "return"], [1.7, ...Array(11).fill(1), 2]],
        [["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"], [2.2, ...Array(10).fill(1), 2.5]],
        [["fn", "ctrl", "opt", "cmd", "", "cmd", "opt", "←", "↑", "↓", "→"], [1, 1, 1, 1.3, 5, 1.3, 1, 1, 1, 1, 1]],
    ];
    rows.forEach(([names, weights], row) => {
        const available = 3.38, gap = .031, unit = (available - gap * (weights.length - 1)) / weights.reduce((a, b) => a + b, 0);
        let x = -available / 2;
        names.forEach((text, i) => {
            const w = unit * weights[i];
            const z = -.64 + row * .23;
            const h = row === 0 ? .14 : .184;
            box(root, `key-${row}-${i}`, [w, .027, h], [x + w / 2, .103, z], key, .016);
            if (text)
                labels.push({ text, position: [x + w / 2, .118, z], size: text.length > 2 ? .041 : .062 });
            x += w + gap;
        });
    });
    // Tiny perforations on both sides of the keyboard, built from actual mesh geometry.
    const holeGeometry = new THREE.CircleGeometry(.009, 6);
    geometry.push(holeGeometry);
    for (const side of [-1, 1])
        for (let r = 0; r < 21; r++)
            for (let c = 0; c < 3; c++) {
                const mesh = new THREE.Mesh(holeGeometry, dark);
                mesh.rotation.x = -Math.PI / 2;
                mesh.position.set(side * (1.86 + c * .032), .081, -.63 + r * .06);
                root.add(mesh);
            }
    for (const side of [-1, 1]) {
        box(root, "usb-c-port", [.018, .025, .16], [side * 2.049, .004, -.44], dark, .005);
        box(root, "rear-port", [.018, .025, .16], [side * 2.049, .004, -.1], dark, .005);
    }
    const cylinder = new THREE.CylinderGeometry(.062, .062, 3.55, 20);
    geometry.push(cylinder);
    const bar = new THREE.Mesh(cylinder, dark);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, .096, -.875);
    root.add(bar);
    hinge.name = "physical-hinge";
    hinge.position.set(0, .16, -.875);
    root.add(hinge);
    box(hinge, "lid", [4.1, 2.55, .062], [0, 1.275, 0], metal, .045);
    box(hinge, "lid-rim", [4.01, 2.46, .016], [0, 1.275, .037], edge, .026);
    box(hinge, "black-bezel", [3.96, 2.4, .012], [0, 1.275, .049], dark, .025);
    box(hinge, "display-glass", [3.73, 2.21, .008], [0, 1.29, .06], glass, .007);
    const lensG = new THREE.CircleGeometry(.015, 16);
    geometry.push(lensG);
    const lens = new THREE.Mesh(lensG, glass);
    lens.position.set(0, 2.457, .064);
    hinge.add(lens);
    const ringG = new THREE.RingGeometry(.017, .022, 16);
    geometry.push(ringG);
    const ring = new THREE.Mesh(ringG, edge);
    ring.position.copy(lens.position);
    hinge.add(ring);
    return { root, hinge, labels, geometry, materials };
}
