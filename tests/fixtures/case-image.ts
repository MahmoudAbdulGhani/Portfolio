import sharp from 'sharp';
import { screenGeometry } from '../../src/lib/project-detail-screens';

// Controlled requests use synthetic rasters with the actual source proportions.
// This fixture does not establish source quality; real-asset captures do that.
export async function caseImage(src: string) {
  const variant = src.replace(/-\d+w\.(avif|webp)$/, '.webp');
  const base = variant.replace(/.*\/projects\/complete\/([a-f0-9-]{36})\.webp$/, '$1.png');
  const { width, height } = screenGeometry({ src: base, label: 'Controlled fixture' });
  return sharp({ create: { width, height, channels: 3, background: '#dce0d5' } }).png().toBuffer();
}

export function sourceRequest(identity: string) {
  const base = identity.replace(/\.[^.]+$/, '');
  return (url: URL) => url.pathname.endsWith(identity) || url.pathname.includes(`/projects/complete/${base}-`);
}
