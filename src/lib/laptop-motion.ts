export const LAPTOP = { screenHeight: 2.21, screenWidth: 3.73, hingeY: .16, hingeZ: -.875, screenY: 1.29, screenZ: .067, plateAspect: 1.6 } as const;
export const smooth = (a: number, b: number, p: number) => { const t = Math.min(1, Math.max(0, (p - a) / (b - a))); return t * t * (3 - 2 * t); };
export const LAPTOP_FRAMES = [0, .06, .12, ...Array.from({ length: 24 }, (_, i) => .12 + (i + 1) * .3 / 24), .58, ...Array.from({ length: 16 }, (_, i) => .58 + (i + 1) * .2 / 16), .88, 1];
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** Fixed-aspect device. Responsive content is a separate, untransformed layer. */
export function laptopPose(progress: number, touch: boolean, flagship = true, index = 0) {
    const p = Math.min(1, Math.max(0, progress));
    const opening = smooth(flagship ? .12 : 0, flagship ? .42 : .65, p);
    const approach = flagship ? smooth(.58, .78, p) : 0;
    const handoff = flagship ? smooth(.78, .88, p) : 0;
    return {
        lidAngle: lerp(1.54, -.16, opening),
        rotation: lerp(index % 2 ? .10 : -.10, 0, smooth(.12, .42, p)),
        camera: [lerp(1.2, touch ? 1.1 : .55, approach), lerp(2.9, touch ? 2.8 : 2.6, approach), lerp(6, touch ? 5.8 : 5.5, approach)] as [
            number,
            number,
            number
        ],
        target: [0, .72, -.04] as [
            number,
            number,
            number
        ],
        hardwareOpacity: 1 - handoff, screenOpacity: smooth(.24, .42, p), handoff,
    };
}
