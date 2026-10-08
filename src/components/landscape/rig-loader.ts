let engine: Promise<typeof import("./motion-rig")> | undefined;
export function warmRig() {
  return (engine ??= import("./motion-rig").catch((error) => {
    engine = undefined;
    throw error;
  }));
}
