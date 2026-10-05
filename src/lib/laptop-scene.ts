import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { CSS3DObject, CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import { SVGRenderer } from "three/addons/renderers/SVGRenderer.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LAPTOP, laptopPose } from "./laptop-motion";

gsap.registerPlugin(ScrollTrigger);
const clamp = THREE.MathUtils.clamp;

/** Original unbranded geometry; no third-party model or paid effect source. */
export function createLaptopScene(root: HTMLElement, host: HTMLElement, display: HTMLElement, touch: boolean, onFailure: () => void) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", { alpha: true, antialias: !touch, powerPreference: "low-power" });
  const renderer = context ? new THREE.WebGLRenderer({ canvas, context }) : new SVGRenderer();
  const gpu = renderer instanceof THREE.WebGLRenderer;
  if (gpu) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, touch ? 1.25 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  } else {
    renderer.setQuality("low"); renderer.setPrecision(2);
  }
  renderer.setClearColor(new THREE.Color(0x000000), 0);
  const css = new CSS3DRenderer();
  renderer.domElement.setAttribute("class", "laptop-webgl");
  root.dataset.engine = gpu ? "webgl" : "software";
  css.domElement.className = "laptop-css3d";
  // Only the hardware is decorative. The HTML display keeps its real semantics.
  host.removeAttribute("aria-hidden");
  renderer.domElement.setAttribute("aria-hidden", "true");
  const source = display.parentElement!;
  const scene = new THREE.Scene(), htmlScene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  const hardware = new THREE.Group();
  scene.add(hardware);
  const metal = new THREE.MeshPhongMaterial({ color: 0x28384c, specular: 0x829bb9, shininess: 85 });
  const trim = new THREE.MeshPhongMaterial({ color: 0x111923, shininess: 55 });
  const keys = new THREE.MeshPhongMaterial({ color: 0x070b12, shininess: 12 });
  const materials: THREE.Material[] = [metal, trim, keys];
  const geometries: THREE.BufferGeometry[] = [];
  function box(parent: THREE.Group, size: [number, number, number], position: [number, number, number], material: THREE.Material, radius = 0.025) {
    const geometry = new RoundedBoxGeometry(...size, gpu ? 3 : 1, radius);
    geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  box(hardware, [4.1, 0.13, 2.65], [0, 0, 0.45], metal, 0.05).renderOrder = 1;
  box(hardware, [3.7, 0.015, 1.47], [0, 0.07, 0.02], trim).renderOrder = 2;
  box(hardware, [1.34, 0.013, 0.69], [0, 0.077, 1.17], trim, 0.045).renderOrder = 4;
  const keyGeometry = gpu ? new RoundedBoxGeometry(0.225, 0.026, 0.17, 2, 0.016) : new THREE.BoxGeometry(0.225, 0.026, 0.17);
  geometries.push(keyGeometry);
  const keyboard = new THREE.InstancedMesh(keyGeometry, keys, 84);
  const matrix = new THREE.Matrix4();
  for (let row = 0; row < 6; row++) for (let col = 0; col < 14; col++) {
    matrix.makeTranslation((col - 6.5) * 0.255, 0.092, -0.56 + row * 0.225);
    keyboard.setMatrixAt(row * 14 + col, matrix);
  }
  keyboard.castShadow = true; keyboard.receiveShadow = true;
  if (gpu) hardware.add(keyboard);
  else for (let i = 0; i < 84; i++) { const key = new THREE.Mesh(keyGeometry, keys); key.renderOrder = 3; keyboard.getMatrixAt(i, matrix); key.applyMatrix4(matrix); hardware.add(key); }
  const hingeGeometry = new THREE.CylinderGeometry(0.075, 0.075, 3.8, 16); geometries.push(hingeGeometry);
  const hingeBar = new THREE.Mesh(hingeGeometry, trim); hingeBar.rotation.z = Math.PI / 2; hingeBar.position.set(0, 0.09, -0.875); hardware.add(hingeBar);
  const hinge = new THREE.Group(); hinge.position.set(0, LAPTOP.hingeY, LAPTOP.hingeZ); hardware.add(hinge);
  box(hinge, [4.1, 2.55, 0.065], [0, 1.275, 0], metal, 0.04).renderOrder = 6;
  const bezel = box(hinge, [3.84, 2.31, 0.02], [0, 1.29, 0.042], keys, 0.02); bezel.renderOrder = 7;
  const htmlScreen = new CSS3DObject(display);
  htmlScreen.position.set(0, LAPTOP.screenY, LAPTOP.screenZ);
  const htmlHinge = new THREE.Group(), htmlHardware = new THREE.Group();
  htmlHardware.add(htmlHinge); htmlHinge.add(htmlScreen); htmlScene.add(htmlHardware);
  const floorGeometry = new THREE.PlaneGeometry(200, 200); geometries.push(floorGeometry);
  const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.28 }); materials.push(shadowMaterial);
  const floor = new THREE.Mesh(floorGeometry, shadowMaterial);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.085; floor.receiveShadow = true; if (gpu) scene.add(floor);
  scene.add(new THREE.HemisphereLight(0xe3efff, 0x1a263a, 2.4));
  const keyLight = new THREE.DirectionalLight(0xd5e5ff, 4.2);
  keyLight.position.set(-3, 6, 4); keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(touch ? 512 : 1024, touch ? 512 : 1024);
  keyLight.shadow.camera.left = -5; keyLight.shadow.camera.right = 5; keyLight.shadow.camera.top = 5; keyLight.shadow.camera.bottom = -5;
  keyLight.shadow.bias = -0.002; scene.add(keyLight);
  const rim = new THREE.DirectionalLight(0xffc36b, 2.0); rim.position.set(4, 3, -4); scene.add(rim);
  host.append(renderer.domElement, css.domElement);
  let width = 1, height = 1, frame = 0, disposed = false, contextLost = false;
  const state = { progress: 0 };
  const target = new THREE.Vector3();
  function render() {
    frame = 0;
    if (disposed || contextLost || document.hidden) return;
    const bounds = host.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
    const p = clamp(state.progress, 0, 1);
    const pose = laptopPose(p, camera.aspect, touch);
    hinge.rotation.x = pose.lidAngle;
    if (!gpu) bezel.visible = hinge.rotation.x < 1.0;
    hardware.rotation.y = pose.rotation;
    htmlHardware.rotation.copy(hardware.rotation); htmlHinge.position.copy(hinge.position); htmlHinge.rotation.copy(hinge.rotation);
    htmlScreen.scale.set(pose.width / width, LAPTOP.screenHeight / height, 1);
    camera.position.set(...pose.camera);
    target.set(...pose.target);
    camera.lookAt(target);
    renderer.domElement.style.opacity = `${pose.hardwareOpacity}`;
    display.style.opacity = `${pose.screenOpacity}`;
    display.inert = p < 0.48;
    display.setAttribute("aria-hidden", p < 0.48 ? "true" : "false");
    root.style.setProperty("--laptop-cue-opacity", `${pose.cueOpacity}`);
    root.dataset.progress = p.toFixed(3);
    renderer.render(scene, camera); css.render(htmlScene, camera);
  }
  const requestRender = () => { if (!frame && !disposed) frame = requestAnimationFrame(render); };
  const resize = () => {
    width = host.clientWidth; height = host.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height; camera.updateProjectionMatrix();
    renderer.setSize(width, height); css.setSize(width, height);
    display.style.width = `${width}px`; display.style.height = `${height}px`;
    requestRender();
  };
  const tween = gsap.to(state, { progress: 1, ease: "none", onUpdate: requestRender, scrollTrigger: {
    trigger: root, start: "top 76px", end: "bottom bottom", scrub: touch ? 0.18 : 0.35,
    invalidateOnRefresh: true, onToggle: requestRender, onRefresh: resize,
  } });
  const observer = new ResizeObserver(() => { resize(); ScrollTrigger.refresh(); }); observer.observe(host);
  const onLost = (event: Event) => { event.preventDefault(); contextLost = true; display.inert = false; source.append(display); onFailure(); };
  if (gpu) renderer.domElement.addEventListener("webglcontextlost", onLost);
  document.addEventListener("visibilitychange", requestRender);
  const refreshFrame = requestAnimationFrame(() => { resize(); ScrollTrigger.refresh(); });
  resize();
  return () => {
    disposed = true; cancelAnimationFrame(frame); cancelAnimationFrame(refreshFrame);
    observer.disconnect(); tween.scrollTrigger?.kill(); tween.kill();
    document.removeEventListener("visibilitychange", requestRender);
    renderer.domElement.removeEventListener("webglcontextlost", onLost);
    source.append(display); display.removeAttribute("style"); display.removeAttribute("aria-hidden"); display.inert = false;
    root.style.removeProperty("--laptop-cue-opacity"); delete root.dataset.progress; delete root.dataset.engine;
    geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
    keyLight.shadow.map?.dispose(); if (gpu) { renderer.dispose(); renderer.forceContextLoss(); }
    renderer.domElement.remove(); css.domElement.remove();
  };
}
