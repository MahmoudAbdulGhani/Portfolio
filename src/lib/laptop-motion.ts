export const LAPTOP = { screenHeight: 2.21, screenWidth: 3.73, hingeY: 0.16, hingeZ: -0.875, screenY: 1.29, screenZ: 0.058 } as const;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const smooth = (a: number, b: number, p: number) => { const t = Math.min(1, Math.max(0, (p - a) / (b - a))); return t * t * (3 - 2 * t); };

export function laptopPose(progress: number, aspect: number, touch: boolean) {
  const p = Math.min(1, Math.max(0, progress));
  const opening = smooth(0.12, 0.48, p), approach = smooth(0.48, 0.86, p), handoff = smooth(touch ? 0.68 : 0.78, touch ? 0.90 : 0.94, p);
  const distance = Math.max(7.2, 5 / (2 * Math.tan(Math.PI / 9) * aspect));
  const finalDistance = LAPTOP.screenHeight / (2 * Math.tan(Math.PI / 9));
  const centerY = LAPTOP.hingeY + LAPTOP.screenY, centerZ = LAPTOP.hingeZ + LAPTOP.screenZ;
  return {
    lidAngle: lerp(1.54, -0.1, opening) * (1 - approach),
    rotation: lerp(touch ? -0.12 : -0.32, 0, smooth(0.15, 0.65, p)),
    width: lerp(LAPTOP.screenWidth, LAPTOP.screenHeight * aspect, handoff),
    hardwareOpacity: 1 - handoff, screenOpacity: smooth(0.28, 0.46, p), cueOpacity: 1 - smooth(0.45, 0.7, p),
    camera: [(touch ? 1 : 2.3) * (1 - approach), lerp(3.1, centerY, approach), lerp(distance, finalDistance + centerZ, approach)] as [number, number, number],
    target: [0, lerp(0.3, centerY, approach), lerp(0.1, centerZ, approach)] as [number, number, number],
  };
}
