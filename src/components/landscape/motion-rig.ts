import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { createRig, type RigKind } from './rig-models';
import { collectionTiming } from './collection-motion';

// Opaque subject bounds measured from the unchanged 1254px photographs. Fit
// the subject, rather than transparent margins, before the first crossfade.
const artworkBounds = {
  jobpilot: { x: 0.040, y: 0.060, width: 0.953, height: 0.803 },
  lobby: { x: 0.063, y: 0.175, width: 0.931, height: 0.702 },
  cedar: { x: 0.060, y: 0.155, width: 0.886, height: 0.759 },
};

export function mountRig(host: HTMLElement, kind: RigKind, onReady: (renderer: 'webgl' | 'fallback') => void) {
  const release: Array<() => void> = [];
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    for (const cleanup of release.reverse()) cleanup();
  };
  const fallback = () => {
    if (disposed) return;
    host.dataset.renderer = 'fallback';
    host.style.opacity = '0';
    dispose();
    onReady('fallback');
  };
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
    if (!context) { fallback(); return dispose; }
    const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
    release.push(() => { renderer.dispose(); if (!context.isContextLost()) renderer.forceContextLoss(); canvas.remove(); });
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
    // Modest environment blur avoids the previous clipped 25-sample kernel.
    const environment = (() => {
      try { return pmrem.fromScene(room, 0.025); }
      finally { room.dispose(); pmrem.dispose(); }
    })();
    release.push(() => environment.dispose());
    scene.environment = environment.texture;
    scene.add(new THREE.HemisphereLight('#FFF8EB', '#747669', 0.9));
    const light = new THREE.DirectionalLight('#FFF4DE', 2);
    light.position.set(-3, 6, 5);
    light.castShadow = true;
    light.shadow.mapSize.setScalar(host.clientWidth < 720 ? 512 : 1024);
    Object.assign(light.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
    light.shadow.normalBias = 0.025;
    light.shadow.bias = -0.0002;
    light.shadow.radius = 4;
    release.push(() => light.shadow.dispose());
    scene.add(light);
    const { group, joints } = createRig(kind, host.clientWidth < 720);
    const assembly = new THREE.Group();
    assembly.add(group);
    scene.add(assembly);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.12 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.6;
    ground.receiveShadow = true;
    assembly.add(ground);
    release.push(() => {
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          for (const material of [object.material].flat()) materials.add(material);
        }
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
    });

    const start = new THREE.Vector3(), destination = new THREE.Vector3();
    const alignment = { progress: 0 };
    // Initialization/resize can measure without painting. The selection must
    // own its elapsed opening clock before the first expensive scene paint,
    // rather than waiting for a cold paint and then starting a fresh clock.
    let posed = false;
    let moving = false, needsMeasure = false;
    const originalBounds = new THREE.Box3().setFromObject(group);
    const originalSize = originalBounds.getSize(new THREE.Vector3());
    const originalCenter = originalBounds.getCenter(new THREE.Vector3());
    const closed = joints.map(({ pivot }) => ({ pivot, position: pivot.position.clone(), rotation: pivot.rotation.clone() }));
    const groupRotation = group.rotation.clone();
    joints.forEach(({ pivot, position, rotation }) => { Object.assign(pivot.position, position); Object.assign(pivot.rotation, rotation); });
    group.rotation.y = 0.12;
    const openedBounds = new THREE.Box3().setFromObject(group);
    const openedSize = openedBounds.getSize(new THREE.Vector3()), openedCenter = openedBounds.getCenter(new THREE.Vector3());
    closed.forEach(({ pivot, position, rotation }) => { pivot.position.copy(position); pivot.rotation.copy(rotation); });
    group.rotation.copy(groupRotation);
    let startScale = 1, targetScale = 1;
    const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const frame = host.parentElement?.querySelector<HTMLElement>('.selection-image-frame');
    const art = host.parentElement?.querySelector<HTMLElement>(`.${kind}-object`);
    const pointAt = (x: number, y: number, target: THREE.Vector3) => {
      const box = host.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2((x - box.left) / box.width * 2 - 1, 1 - (y - box.top) / box.height * 2), camera);
      ray.ray.intersectPlane(plane, target);
    };
    const render = () => {
      if (disposed || document.hidden || !posed || !moving) return;
      assembly.position.copy(start).lerp(destination, alignment.progress);
      assembly.scale.setScalar(THREE.MathUtils.lerp(startScale, targetScale, alignment.progress));
      try { renderer.render(scene, camera); }
      catch { fallback(); }
    };
    const size = () => {
      if (disposed || !host.clientWidth || !host.clientHeight) return;
      // The engineering panel is not part of the drawing surface. Reserve the
      // union of the existing closed subject and screenshot destination, using
      // the same camera fit/centres as before and space for the ground shadow.
      const parent = host.parentElement!.getBoundingClientRect();
      const photo = art?.getBoundingClientRect(), image = frame?.getBoundingClientRect();
      if (photo && image) {
        const subject = artworkBounds[kind];
        const closedHeight = Math.min(photo.width * subject.width / originalSize.x, photo.height * subject.height / originalSize.y) * originalSize.y;
        const centre = photo.top + photo.height * (subject.y + subject.height / 2);
        const top = Math.min(image.top, centre - closedHeight / 2) - 64;
        const bottom = Math.max(image.bottom, centre + closedHeight / 2) + 64;
        host.style.top = `${top - parent.top}px`;
        host.style.bottom = 'auto';
        host.style.height = `${bottom - top}px`;
      }
      const width = host.clientWidth, height = host.clientHeight;
      const fullWidth = host.parentElement!.clientWidth, fullHeight = host.parentElement!.clientHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio, width < 720 ? 1.25 : 1.5));
      renderer.setSize(width, height, false);
      // Crop the drawing surface, not the accepted camera projection. Keeping
      // its full-stage field preserves perspective, material lighting and the
      // existing start/destination geometry while drawing fewer pixels.
      camera.aspect = fullWidth / fullHeight;
      camera.position.z = Math.max(10, 6.8 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
      camera.setViewOffset(fullWidth, fullHeight, 0, host.getBoundingClientRect().top - parent.top, width, height);
      camera.updateProjectionMatrix(); camera.updateMatrixWorld();
      const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      if (art) {
        const photo = art.getBoundingClientRect(), subject = artworkBounds[kind];
        startScale = Math.min(photo.width * subject.width / fullHeight * viewHeight / originalSize.x,
          photo.height * subject.height / fullHeight * viewHeight / originalSize.y);
        pointAt(photo.left + photo.width * (subject.x + subject.width / 2), photo.top + photo.height * (subject.y + subject.height / 2), start);
        start.addScaledVector(originalCenter, -startScale);
      }
      if (frame) {
        const image = frame.getBoundingClientRect();
        targetScale = Math.min(image.width / fullHeight * viewHeight / openedSize.x, image.height / fullHeight * viewHeight / openedSize.y) * 0.96;
        pointAt(image.left + image.width / 2, image.top + image.height / 2, destination);
        destination.addScaledVector(openedCenter, -targetScale);
      }
      render();
    };
    size();
    if (disposed) return dispose;
    const timeline = gsap.timeline({ paused: true, onUpdate: render });
    release.push(() => timeline.kill());
    const duration = collectionTiming.articulation;
    timeline.to(alignment, { progress: 1, duration, ease: 'power3.inOut' }, 0)
      .to(group.rotation, { y: 0.12, duration, ease: 'power3.inOut' }, 0);
    joints.forEach(({ pivot, rotation, position }, index) => {
      const delay = 0.04 + index * 0.02;
      timeline.to(pivot.rotation, { ...rotation, duration: 0.64, ease: 'power3.inOut' }, delay)
        .to(pivot.position, { ...position, duration: 0.64, ease: 'power3.inOut' }, delay);
    });
    // The collection owns the only clock and sends this finite model its pose.
    // No autonomous ticker, idle render loop or disappearing close callback.
    const seek = (event: Event) => {
      if (disposed) return;
      const { progress, closing } = (event as CustomEvent<{ progress: number; closing: boolean }>).detail;
      moving = true;
      if (needsMeasure) { needsMeasure = false; size(); }
      posed = true;
      timeline.totalTime(Math.max(0, Math.min(1, progress)) * duration, false);
      host.dataset.state = closing ? 'closing' : progress >= 1 ? 'settled' : 'opening';
      moving = progress > 0 && progress < 1;
    };
    const visibility = () => { if (!document.hidden) render(); };
    const lost = (event: Event) => { event.preventDefault(); fallback(); };
    const observer = new ResizeObserver(() => {
      // A hidden, settled rig only measures again when reverse motion needs it.
      // Resize/visibility must not perform invisible scene paints or allocations.
      if (moving || !posed) size();
      else needsMeasure = true;
    });
    observer.observe(host);
    if (frame?.parentElement) observer.observe(frame.parentElement);
    host.addEventListener('rig-frame', seek);
    document.addEventListener('visibilitychange', visibility);
    canvas.addEventListener('webglcontextlost', lost);
    release.push(() => {
      observer.disconnect();
      host.removeEventListener('rig-frame', seek);
      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('webglcontextlost', lost);
    });
    host.dataset.renderer = 'webgl';
    host.dataset.model = kind;
    onReady('webgl');
    return dispose;
  } catch {
    fallback();
    return dispose;
  }
}
