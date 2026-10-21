#!/usr/bin/env python3
"""Encode the accepted speaking take with restrained, edge-only cyan despill.

Offline authoring tool. Requires ffmpeg with libvpx and Python numpy/scipy.
Never reshapes the face, changes alpha, retimes speech, or synthesizes features.
Usage: python scripts/refine-profile-introduction.py SOURCE.webm AUDIO.webm OUTDIR
The AUDIO input is the previously approved website WebM; its audio is copied.
"""
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from scipy.ndimage import binary_erosion


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    source, audio, output = map(Path, sys.argv[1:4])
    output.mkdir(parents=True, exist_ok=True)
    width, height, rate = 720, 1272, 25
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', str(source)]))['streams'][0]
    assert (probe['width'], probe['height'], probe['r_frame_rate']) == (width, height, '25/1')
    frames = changed = interior_changes = 0
    with tempfile.TemporaryDirectory(prefix='portrait-encode-') as temp:
        intermediate = Path(temp) / 'edge-cleaned.mkv'
        decode = subprocess.Popen(['ffmpeg', '-v', 'error', '-c:v', 'libvpx-vp9', '-i', str(source), '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1'], stdout=subprocess.PIPE)
        encode = subprocess.Popen(['ffmpeg', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{width}x{height}', '-r', str(rate), '-i', 'pipe:0', '-c:v', 'ffv1', '-level', '3', '-pix_fmt', 'bgra', '-y', str(intermediate)], stdin=subprocess.PIPE)
        while data := decode.stdout.read(width * height * 4):
            assert len(data) == width * height * 4
            original = np.frombuffer(data, dtype=np.uint8).reshape(height, width, 4)
            pixels = original.copy()
            visible = pixels[:, :, 3] > 8
            interior = binary_erosion(visible, iterations=2)
            edge = visible & ~interior
            rgb = pixels[:, :, :3].astype(np.int16)
            # Only shared blue/green excess over red, within two silhouette
            # pixels. No skin grading, global desaturation or alpha erosion.
            spill = np.minimum(rgb[:, :, 1], rgb[:, :, 2]) - rgb[:, :, 0]
            correction = np.where(edge & (spill > 10), (spill - 10) // 2, 0)
            for channel in (1, 2):
                pixels[:, :, channel] = np.clip(rgb[:, :, channel] - correction, 0, 255)
            # Invisible RGB contains the removed scenery in the source export.
            # Zero it only where alpha is exactly zero; this reduces bandwidth
            # without changing any composited pixel or the alpha channel.
            pixels[pixels[:, :, 3] == 0, :3] = 0
            assert np.array_equal(pixels[:, :, 3], original[:, :, 3])
            interior_changes += int(np.count_nonzero(np.any(pixels[interior] != original[interior], axis=1)))
            changed += int(np.count_nonzero(correction))
            encode.stdin.write(pixels.tobytes())
            frames += 1
        decode.stdout.close()
        encode.stdin.close()
        assert decode.wait() == encode.wait() == 0
        assert frames == 300 and interior_changes == 0
        outputs = {}
        for target in (480, 720):
            path = output / f'mahmoud-introduction-{target}.webm'
            subprocess.run(['ffmpeg', '-v', 'error', '-i', str(intermediate), '-i', str(audio), '-map', '0:v:0', '-map', '1:a:0', '-vf', f'scale={target}:-2:flags=lanczos,format=yuva420p', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-deadline', 'good', '-cpu-used', '2', '-row-mt', '1', '-auto-alt-ref', '0', '-g', '50', '-c:a', 'copy', '-y', str(path)], check=True)
            outputs[path.name] = {'bytes': path.stat().st_size, 'sha256': digest(path)}
        manifest = {'source_sha256': digest(source), 'audio_container_sha256': digest(audio), 'frames': frames, 'frame_rate': rate, 'edge_pixels_adjusted': changed, 'interior_pixels_changed_before_encode': interior_changes, 'alpha_unchanged_before_encode': True, 'outputs': outputs}
        (output / 'processing.json').write_text(json.dumps(manifest, indent=2) + '\n')
        print(json.dumps(manifest, indent=2))


if __name__ == '__main__':
    main()
