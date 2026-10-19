"""Extract original photograph pixels; never generate or retouch the person.

Install numpy, onnxruntime and Pillow outside the app environment. Supply the
ISNet general-use ONNX model from rembg's model release; no image is uploaded.
"""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageOps, ImageDraw, ImageFilter, ImageChops
import numpy as np
import onnxruntime as ort

parser = argparse.ArgumentParser()
parser.add_argument("source", type=Path)
parser.add_argument("output", type=Path)
parser.add_argument("--model-path", required=True, type=Path)
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
source_hash = hashlib.sha256(args.source.read_bytes()).hexdigest()
if source_hash != "d5449cfc03fcb2c76ba12c3c3d9ecbb7ea130e081e046e3f687304d261b0180a":
    raise ValueError("The cleanup is registered to the specified original JPEG")
original = ImageOps.exif_transpose(Image.open(args.source)).convert("RGB")
# Match rembg's ISNet normalization and mask interpolation. Inference predicts
# alpha only; the source RGB is neither resized nor processed for the asset.
if hashlib.md5(args.model_path.read_bytes()).hexdigest() != "fc16ebd8b0c10d971d3513d564d01e29":
    raise ValueError("Expected the verified ISNet general-use model")
session = ort.InferenceSession(str(args.model_path), providers=["CPUExecutionProvider"])
pixels = np.asarray(original.resize((1024, 1024), Image.Resampling.LANCZOS))
normalized = (pixels / max(float(pixels.max()), 1.0) - 0.5).transpose(2, 0, 1)[None].astype(np.float32)
pred = session.run(None, {session.get_inputs()[0].name: normalized})[0][0, 0]
pred = (pred - pred.min()) / (pred.max() - pred.min())
mask = Image.fromarray((pred * 255).astype(np.uint8)).resize(original.size, Image.Resampling.LANCZOS)
mask.save(args.output / "raw-mask.png")
cleanup = json.loads(Path(__file__).with_name("standing-portrait-alpha-cleanup.json").read_text())
if list(original.size) != cleanup["sourceSize"]:
    raise ValueError("The cleanup coordinates apply only to the supplied original")
# One native-pixel erosion removes sky/stone contamination; soft alpha remains
# along the boundary. The source-sized RGB image is never eroded or retouched.
mask = mask.filter(ImageFilter.MinFilter(3)).point(lambda value: max(0, min(255, round(
    (value - cleanup["alphaBlackPoint"]) * 255 / (cleanup["alphaWhitePoint"] - cleanup["alphaBlackPoint"])
))))
roi = Image.new("L", original.size)
ImageDraw.Draw(roi).rectangle(cleanup["roi"], fill=255)
boundary = cleanup["leftBoundary"]
scale = 4
trim = Image.new("L", (original.width * scale, original.height * scale), 255)
ImageDraw.Draw(trim).polygon([(0, boundary[0][1] * scale)] +
    [(x * scale, y * scale) for x, y in boundary] + [(0, boundary[-1][1] * scale)], fill=0)
trim = trim.resize(original.size, Image.Resampling.LANCZOS)
mask = ImageChops.darker(mask, ImageChops.darker(roi, trim))
ImageDraw.Draw(mask).rectangle((0, cleanup["floorStartsAtY"], original.width, original.height), fill=0)
mask.save(args.output / "mask.png")
rgba = original.convert("RGBA")
rgba.putalpha(mask)
rgba.save(args.output / "uncropped.png")
bounds = mask.getbbox()
crop = (max(0, bounds[0] - 8), max(0, bounds[1] - 8),
        min(original.width, bounds[2] + 8), min(original.height, bounds[3] + 8))
rgba = rgba.crop(crop)
rgba.save(args.output / "standing-original.png")
rgba.save(args.output / "standing-original.webp", lossless=True, exact=True)
rgb = np.asarray(original.crop(crop))
assert np.array_equal(rgb, np.asarray(Image.open(args.output / "standing-original.png"))[:, :, :3])
assert np.array_equal(np.asarray(rgba), np.asarray(Image.open(args.output / "standing-original.webp")))
for label, color in [("cream", "#ecebe3"), ("white", "#ffffff"), ("dark", "#171b18")]:
    bg = Image.new("RGBA", rgba.size, color)
    bg.alpha_composite(rgba)
    bg.convert("RGB").save(args.output / f"edges-{label}.png")
(args.output / "processing.json").write_text(json.dumps({
    "source_sha256": source_hash,
    "original_size": original.size, "model": "ISNet general-use, CPU ONNX", "alpha_bounds": bounds,
    "output_size": rgba.size, "rgb": "Original JPEG pixels; only alpha and crop changed",
    "crop": crop, "rgb_exact_match": True, "webp_rgba_exact_match": True,
    "alpha_cleanup": cleanup,
}, indent=2) + "\n")
