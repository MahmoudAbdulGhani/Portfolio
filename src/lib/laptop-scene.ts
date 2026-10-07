import * as THREE from "three";
import { CSS3DObject, CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildLaptopModel } from "./laptop-model";
import { LAPTOP, LAPTOP_FRAMES, laptopPose, smooth } from "./laptop-motion";
gsap.registerPlugin(ScrollTrigger);
let checked = false, gpu: THREE.WebGLRenderer | null = null, users = 0, owner: HTMLElement | null = null;
let shared: ReturnType<typeof buildLaptopModel> | null = null, scene: THREE.Scene | null = null, environment: THREE.WebGLRenderTarget | null = null;
const images = new Map<number, HTMLImageElement>();
function atlasImage(index: number) { let image = images.get(index); if (!image) {
    image = new Image();
    image.decoding = "async";
    image.src = `/projects/cinematic/laptop/atlas-${index}.webp`;
    images.set(index, image);
    if (images.size > 2) {
        const stale = [...images.keys()].find(key => key !== index && key !== index + 1);
        if (stale !== undefined)
            images.delete(stale);
    }
} return image; }
function acquire() {
    users++;
    if (checked)
        return;
    checked = true;
    const canvas = document.createElement("canvas"), context = canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "low-power" });
    if (!context)
        return;
    try {
        gpu = new THREE.WebGLRenderer({ canvas, context });
        gpu.setClearColor(0x000000, 0);
        gpu.outputColorSpace = THREE.SRGBColorSpace;
        gpu.toneMapping = THREE.ACESFilmicToneMapping;
        gpu.toneMappingExposure = 1.15;
        shared = buildLaptopModel();
        scene = new THREE.Scene();
        scene.add(shared.root);
        gpu.shadowMap.enabled = true;
        gpu.shadowMap.type = THREE.PCFSoftShadowMap;
        const floorGeometry = new THREE.PlaneGeometry(40, 40), floorMaterial = new THREE.ShadowMaterial({ opacity: .28 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -.084;
        floor.receiveShadow = true;
        scene.add(floor);
        shared.geometry.push(floorGeometry);
        shared.materials.push(floorMaterial);
        const env = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(gpu);
        environment = pmrem.fromScene(env, .04);
        scene.environment = environment.texture;
        env.dispose();
        pmrem.dispose();
        scene.add(new THREE.HemisphereLight(0xc9d8ee, 0x171c25, 1.5));
        for (const [pos, color, strength] of [[[-4, 6, 5], 0xd8e6ff, 3.0], [[5, 3, -3], 0xffc98b, 2.0], [[0, 5, -4], 0xccdfff, 1.4]] as const) {
            const light = new THREE.DirectionalLight(color, strength);
            light.position.set(pos[0], pos[1], pos[2]);
            if (pos[0] === -4) {
                light.castShadow = true;
                light.shadow.mapSize.set(1024, 1024);
                light.shadow.camera.left = -5;
                light.shadow.camera.right = 5;
                light.shadow.camera.top = 5;
                light.shadow.camera.bottom = -5;
                light.shadow.bias = -.001;
            }
            scene.add(light);
        }
        // One authored atlas for the real keyboard legends; no per-key textures.
        const atlas = document.createElement("canvas");
        atlas.width = 1024;
        atlas.height = 512;
        const ctx = atlas.getContext("2d")!;
        ctx.fillStyle = "#919baa";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const vertices: number[] = [], uvs: number[] = [], indices: number[] = [];
        shared.labels.forEach((label, i) => {
            const col = i % 14, row = Math.floor(i / 14), cw = 1024 / 14, ch = 512 / 6;
            ctx.font = `${label.text.length > 2 ? 20 : 30}px Inter, sans-serif`;
            ctx.fillText(label.text, (col + .5) * cw, (row + .5) * ch);
            const [x, y, z] = label.position, w = label.text.length > 2 ? .16 : .10, h = .085;
            const base = vertices.length / 3;
            vertices.push(x - w / 2, y + .001, z + h / 2, x + w / 2, y + .001, z + h / 2, x + w / 2, y + .001, z - h / 2, x - w / 2, y + .001, z - h / 2);
            uvs.push(col / 14, 1 - (row + 1) / 6, (col + 1) / 14, 1 - (row + 1) / 6, (col + 1) / 14, 1 - row / 6, col / 14, 1 - row / 6);
            indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
        });
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        const map = new THREE.CanvasTexture(atlas);
        map.colorSpace = THREE.SRGBColorSpace;
        const mat = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false });
        shared.root.add(new THREE.Mesh(geometry, mat));
        shared.geometry.push(geometry);
        shared.materials.push(mat);
    }
    catch {
        gpu?.dispose();
        gpu = null;
    }
}
function release() { users--; if (users > 0)
    return; owner = null; shared?.geometry.forEach(g => g.dispose()); shared?.materials.forEach(m => { if (m instanceof THREE.MeshBasicMaterial)
    m.map?.dispose(); m.dispose(); }); shared = null; environment?.dispose(); environment = null; scene?.traverse(object => { if (object instanceof THREE.DirectionalLight)
    object.shadow.dispose(); }); scene = null; gpu?.dispose(); gpu?.forceContextLoss(); gpu = null; checked = false; images.clear(); }
export function createLaptopScene(root: HTMLElement, host: HTMLElement, display: HTMLElement, touch: boolean, flagship: boolean, onFailure: () => void) {
    acquire();
    root.dataset.engine = gpu ? "webgl" : "rendered";
    const source = display.parentElement!, plate = document.createElement("div");
    plate.className = "laptop-render-plate";
    host.append(plate);
    const raster = document.createElement("canvas");
    raster.className = "laptop-rendered-frame";
    raster.width = 704;
    raster.height = 440;
    plate.append(raster);
    const paint = raster.getContext("2d")!;
    const css = new CSS3DRenderer();
    css.domElement.className = "laptop-css3d";
    plate.append(css.domElement);
    const htmlScene = new THREE.Scene(), htmlRoot = new THREE.Group(), htmlHinge = new THREE.Group(), htmlScreen = new CSS3DObject(display);
    htmlRoot.add(htmlHinge);
    htmlHinge.position.set(0, LAPTOP.hingeY, LAPTOP.hingeZ);
    htmlHinge.add(htmlScreen);
    htmlScreen.position.set(0, LAPTOP.screenY, LAPTOP.screenZ);
    htmlScreen.scale.set(LAPTOP.screenWidth / 1024, LAPTOP.screenHeight / (1024 * LAPTOP.screenHeight / LAPTOP.screenWidth), 1);
    htmlScene.add(htmlRoot);
    const camera = new THREE.PerspectiveCamera(40, LAPTOP.plateAspect, .1, 100), target = new THREE.Vector3();
    display.style.width = "1024px";
    display.style.height = `${1024 * LAPTOP.screenHeight / LAPTOP.screenWidth}px`;
    let frame = 0, refreshFrame = 0, disposed = false, width = 1, height = 1, lastImage = -1, displayedFrame = 27, pointerX = 0, pointerY = 0;
    const state = { progress: 0 };
    const updateSemantic = (handoff: number) => { const panel = root.querySelector<HTMLElement>(".laptop-content-panel"); panel?.setAttribute("aria-hidden", handoff < .5 ? "true" : "false"); };
    function render() {
        frame = 0;
        if (disposed || document.hidden)
            return;
        const rect = host.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight)
            return;
        const p = Math.max(0, Math.min(1, state.progress)), mapped = flagship ? p : .12 + Math.min(p, .8) * .575;
        // Both rendering paths use the same fixed-aspect camera and source geometry.
        const livePose = laptopPose(mapped, false);
        const oldRect = owner?.getBoundingClientRect();
        const canOwn = Boolean(gpu && (!owner || owner === host || !oldRect || oldRect.bottom <= 0 || oldRect.top >= window.innerHeight));
        const i = LAPTOP_FRAMES.reduce((best, value, index) => Math.abs(value - mapped) < Math.abs(LAPTOP_FRAMES[best] - mapped) ? index : best, 0);
        const atlas = atlasImage(Math.floor(i / 8));
        const drawFrame = () => { if (!disposed && lastImage === i) {
            displayedFrame = i;
            root.dataset.ready = "true";
            paint.clearRect(0, 0, 704, 440);
            paint.drawImage(atlas, (i % 4) * 704, Math.floor((i % 8) / 4) * 440, 704, 440, 0, 0, 704, 440);
            request();
        } };
        if (i !== lastImage) {
            lastImage = i;
            if (atlas.complete && atlas.naturalWidth)
                drawFrame();
            else {
                atlas.addEventListener("load", drawFrame, { once: true });
                atlas.addEventListener("error", onFailure, { once: true });
            }
            if (!gpu)
                atlasImage(Math.min(5, Math.floor(i / 8) + 1));
        }
        const pose = canOwn ? livePose : laptopPose(LAPTOP_FRAMES[displayedFrame], false);
        camera.position.set(...pose.camera);
        target.set(...pose.target);
        camera.lookAt(target);
        htmlRoot.rotation.y = pose.rotation;
        htmlHinge.rotation.x = pose.lidAngle;
        if (canOwn && gpu && shared && scene) {
            owner = host;
            if (gpu.domElement.parentElement !== plate)
                plate.prepend(gpu.domElement);
            gpu.domElement.className = "laptop-webgl";
            gpu.setPixelRatio(Math.min(window.devicePixelRatio, touch ? 1.25 : 1.75));
            gpu.setSize(width, height);
            shared.root.rotation.y = pose.rotation;
            shared.hinge.rotation.x = pose.lidAngle;
            gpu.render(scene, camera);
            root.dataset.ready = "true";
            raster.style.visibility = "hidden";
        }
        else
            raster.style.visibility = "visible";
        plate.style.transform = `translate(-50%,-50%) perspective(1200px) rotateX(${pointerY}deg) rotateY(${pointerX}deg)`;
        plate.style.opacity = `${livePose.hardwareOpacity}`;
        display.style.opacity = `${pose.screenOpacity}`;
        root.style.setProperty("--laptop-handoff", `${livePose.handoff}`);
        root.style.setProperty("--laptop-detail-opacity", `${flagship ? 1 : smooth(.35, .75, p)}`);
        root.dataset.progress = p.toFixed(3);
        updateSemantic(livePose.handoff);
        css.render(htmlScene, camera);
    }
    const request = () => { if (!frame && !disposed)
        frame = requestAnimationFrame(render); };
    const resize = () => { const w = host.clientWidth, h = host.clientHeight; const fit = Math.min(w * .97, h * LAPTOP.plateAspect); width = Math.max(1, fit); height = width / LAPTOP.plateAspect; plate.style.width = `${width}px`; plate.style.height = `${height}px`; css.setSize(width, height); request(); };
    const tween = gsap.to(state, { progress: 1, ease: "none", onUpdate: request, scrollTrigger: { trigger: flagship ? root.querySelector(".laptop-runway") : root, start: flagship ? "top 92px" : "top 88%", end: flagship ? () => `+=${window.innerHeight * (touch ? .7 : 1.4)}` : "top 28%", scrub: touch ? .14 : .3, invalidateOnRefresh: true, onRefresh: resize, onToggle: request } });
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    const lost = (event: Event) => { event.preventDefault(); if (owner === host) {
        owner = null;
        gpu?.dispose();
        gpu = null;
        root.dataset.engine = "rendered";
        raster.style.visibility = "visible";
        request();
    } };
    const canvas = gpu?.domElement;
    canvas?.addEventListener("webglcontextlost", lost);
    const pointerMove = (event: PointerEvent) => { if (touch || flagship || event.pointerType !== "mouse" || state.progress < .8)
        return; const rect = host.getBoundingClientRect(); pointerX = ((event.clientX - rect.left) / rect.width - .5) * 4; pointerY = -((event.clientY - rect.top) / rect.height - .5) * 4; pointerX = Math.max(-2, Math.min(2, pointerX)); pointerY = Math.max(-2, Math.min(2, pointerY)); request(); };
    const pointerLeave = () => { pointerX = 0; pointerY = 0; request(); };
    root.addEventListener("pointermove", pointerMove);
    root.addEventListener("pointerleave", pointerLeave);
    document.addEventListener("visibilitychange", request);
    resize();
    refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { disposed = true; cancelAnimationFrame(frame); cancelAnimationFrame(refreshFrame); observer.disconnect(); tween.scrollTrigger?.kill(); tween.kill(); document.removeEventListener("visibilitychange", request); root.removeEventListener("pointermove", pointerMove); root.removeEventListener("pointerleave", pointerLeave); canvas?.removeEventListener("webglcontextlost", lost); source.append(display); display.removeAttribute("style"); plate.remove(); if (owner === host)
        owner = null; root.style.removeProperty("--laptop-handoff"); root.style.removeProperty("--laptop-detail-opacity"); delete root.dataset.progress; delete root.dataset.engine; delete root.dataset.ready; updateSemantic(1); release(); };
}
