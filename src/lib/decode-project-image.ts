// A load event and a cached-image check can describe the same candidate.
// Share its decode operation; a responsive replacement owns a new operation.
const attempts = new WeakMap<HTMLImageElement, { candidate: string; promise: Promise<void> }>();
export function decodeProjectImage(image: HTMLImageElement) {
  const candidate = image.currentSrc || image.src;
  const previous = attempts.get(image);
  if (previous?.candidate === candidate) return previous.promise;
  const promise = image.decode();
  attempts.set(image, { candidate, promise });
  return promise;
}
