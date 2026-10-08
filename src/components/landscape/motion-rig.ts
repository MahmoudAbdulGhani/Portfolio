import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { createRig, type RigKind } from "./rig-models";

export function mountRig(
  host: HTMLElement,
  kind: RigKind,
  onReady: (renderer: string) => void,
) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  if (!context) {
    host.dataset.renderer = "fallback";
    onReady("fallback");
    return () => {};
  }
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context,
    alpha: true,
    antialias: true,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60);
  camera.position.set(0, 2.1, 10);
  camera.lookAt(0, 0, 0);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(room, 0.05);
  scene.environment = env.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight("#FFF8EB", "#747669", 0.9));
  const light = new THREE.DirectionalLight("#FFF4DE", 2);
  light.position.set(-3, 6, 5);
  light.castShadow = true;
  const shadowSize = host.clientWidth < 720 ? 512 : 1024;
  light.shadow.mapSize.set(shadowSize, shadowSize);
  Object.assign(light.shadow.camera, {
    left: -6,
    right: 6,
    top: 6,
    bottom: -6,
  });
  light.shadow.normalBias = 0.025;
  light.shadow.bias = -0.0002;
  light.shadow.radius = 4;
  scene.add(light);
  const { group, joints } = createRig(kind);
  const assembly = new THREE.Group();
  assembly.add(group);
  scene.add(assembly);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShadowMaterial({ opacity: 0.12 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.6;
  ground.receiveShadow = true;
  assembly.add(ground);
  let disposed = false;
  let hidden = document.hidden;
  const startPosition = new THREE.Vector3();
  const imagePosition = new THREE.Vector3();
  const alignment = { progress: 0 };
  const imageFrame = host.parentElement?.querySelector<HTMLElement>(
    ".selection-image-frame",
  );
  const imageRay = new THREE.Raycaster();
  const imagePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const render = () => {
    if (!disposed && !hidden) {
      assembly.position
        .copy(startPosition)
        .lerp(imagePosition, alignment.progress);
      renderer.render(scene, camera);
    }
  };
  const size = () => {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h || disposed) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, w < 720 ? 1.25 : 1.5));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = Math.max(
      10,
      6.8 /
        (2 *
          Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
          camera.aspect),
    );
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    if (imageFrame) {
      // Measure the reserved, untransformed frame, not the entering screenshot.
      // Recompute on resize so the articulated mesh meets the real image center.
      const image = imageFrame.getBoundingClientRect();
      const stage = host.getBoundingClientRect();
      imageRay.setFromCamera(
        new THREE.Vector2(
          ((image.left + image.width / 2 - stage.left) / w) * 2 - 1,
          1 - ((image.top + image.height / 2 - stage.top) / h) * 2,
        ),
        camera,
      );
      imageRay.ray.intersectPlane(imagePlane, imagePosition);
    }
    render();
  };
  size();
  const art = host.parentElement?.querySelector(`.${kind}-object`);
  if (art) {
    const frame = art.getBoundingClientRect(),
      stage = host.getBoundingClientRect();
    const box = new THREE.Box3().setFromObject(group);
    const viewHeight =
      2 *
      camera.position.z *
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const scale = Math.min(
      1.7,
      (((frame.height * 0.85) / stage.height) * viewHeight) /
        (box.max.y - box.min.y),
    );
    assembly.scale.setScalar(scale);
    assembly.position.set(
      ((frame.left + frame.width / 2 - stage.left - stage.width / 2) /
        stage.height) *
        viewHeight,
      (-(frame.top + frame.height / 2 - stage.top - stage.height / 2) /
        stage.height) *
        viewHeight,
      0,
    );
  }
  startPosition.copy(assembly.position);
  host.dataset.renderer = "webgl";
  host.dataset.model = kind;
  const timeline = gsap.timeline({ onUpdate: render });
  timeline.to(
    alignment,
    { progress: 1, duration: 0.9, ease: "power3.inOut" },
    0,
  );
  timeline.to(
    assembly.scale,
    { x: 1, y: 1, z: 1, duration: 0.9, ease: "power3.inOut" },
    0,
  );
  timeline.fromTo(host, { opacity: 0 }, { opacity: 1, duration: 0.18 }, 0);
  timeline.to(
    group.rotation,
    { y: 0.12, duration: 1.35, ease: "power2.inOut" },
    0.12,
  );
  for (const { pivot, rotation, position, delay } of joints) {
    timeline.to(
      pivot.rotation,
      { ...rotation, duration: 1.12, ease: "power3.inOut" },
      0.18 + delay,
    );
    timeline.to(
      pivot.position,
      { ...position, duration: 1.12, ease: "power3.inOut" },
      0.18 + delay,
    );
  }
  timeline.to(
    host,
    {
      opacity: 0,
      duration: 0.46,
      ease: "power2.in",
      onComplete: () => {
        host.dataset.state = "settled";
      },
    },
    1.35,
  );
  const reverse = () => {
    timeline.time(1.35).reverse();
    host.dataset.state = "closing";
  };
  const observer = new ResizeObserver(size);
  observer.observe(host);
  if (imageFrame?.parentElement) observer.observe(imageFrame.parentElement);
  const visibility = () => {
    hidden = document.hidden;
    if (hidden) timeline.pause();
    else if (timeline.progress() > 0 && timeline.progress() < 1) {
      timeline.resume();
      render();
    }
  };
  const lost = (event: Event) => {
    event.preventDefault();
    timeline.kill();
    host.dataset.renderer = "fallback";
    host.style.opacity = "0";
    onReady("fallback");
  };
  host.addEventListener("rig-close", reverse);
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", lost);
  onReady("webgl");
  return () => {
    disposed = true;
    timeline.kill();
    observer.disconnect();
    host.removeEventListener("rig-close", reverse);
    document.removeEventListener("visibilitychange", visibility);
    canvas.removeEventListener("webglcontextlost", lost);
    const geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        for (const material of [object.material].flat())
          materials.add(material);
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    light.shadow.dispose();
    env.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
