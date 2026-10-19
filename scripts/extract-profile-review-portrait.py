"""Local, deterministic photo extraction. ONNX predicts alpha, never RGB.

Use Pillow, numpy and onnxruntime outside the frontend environment. This recipe
is registered to the supplied 1000689121.jpg; no face or clothing synthesis.
"""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageOps, ImageFilter, ImageDraw, ImageChops

parser = argparse.ArgumentParser()
parser.add_argument("source", type=Path)
parser.add_argument("output", type=Path)
parser.add_argument("--model-path", required=True, type=Path)
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
source_hash = hashlib.sha256(args.source.read_bytes()).hexdigest()
if source_hash != "a7e497a5ac66f10f3c48030ae4e248fa6e8705c4c036572bc8de98154d35791e":
    raise ValueError("Recipe coordinates require the confirmed original 1000689121.jpg")
if hashlib.md5(args.model_path.read_bytes()).hexdigest() != "fc16ebd8b0c10d971d3513d564d01e29":
    raise ValueError("Expected the verified ISNet general-use model")
original = ImageOps.exif_transpose(Image.open(args.source)).convert("RGB")
assert original.size == (1536, 2048)
shutil.copyfile(args.source, args.output / "1000689121.jpg")
session = ort.InferenceSession(str(args.model_path), providers=["CPUExecutionProvider"])
pixels = np.asarray(original.resize((1024, 1024), Image.Resampling.LANCZOS))
normalized = (pixels / max(float(pixels.max()), 1.0) - 0.5).transpose(2, 0, 1)[None].astype(np.float32)
pred = session.run(None, {session.get_inputs()[0].name: normalized})[0][0, 0]
pred = (pred - pred.min()) / (pred.max() - pred.min())
mask = Image.fromarray((pred * 255).astype(np.uint8)).resize(original.size, Image.Resampling.LANCZOS)
mask.save(args.output / "raw-mask.png")
# Remove the outer mixed background pixel, retaining a soft antialiased edge.
mask = mask.filter(ImageFilter.MinFilter(3)).point(lambda v: max(0, min(255, round((v - 25) * 255 / 205))))
# ISNet mistakes pale sleeve texture for background. A registered manual
# interior trace restores opacity without changing a single clothing pixel.
cleanup = json.loads(Path(__file__).with_name("profile-review-alpha-cleanup.json").read_text())
assert list(original.size) == cleanup["sourceSize"]
fill = Image.new("L", (original.width * 4, original.height * 4))
ImageDraw.Draw(fill).polygon([(x * 4, y * 4) for x, y in cleanup["leftSleeveInterior"]], fill=255)
fill = fill.resize(original.size, Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
# Extend the opaque interior to two pixels inside the inferred outer contour;
# the raw model has the right outline but low confidence across this sleeve.
alpha = np.asarray(mask).copy()
interior = np.asarray(fill)
for y in range(850, 1854):
    outline = np.flatnonzero(alpha[y, 210:505] > 8)
    filled = np.flatnonzero(interior[y, 210:505] > 250)
    if len(outline) and len(filled):
        alpha[y, 210 + int(outline[0]) + 2:210 + int(filled[-1]) + 1] = 255
mask = Image.fromarray(alpha)
mask = ImageChops.lighter(mask, fill)
# Native-resolution crop ends on jeans below BOTH hands, not through fingers.
crop = (210, 330, 1170, 2026)
mask = mask.crop(crop)
mask.save(args.output / "alpha-mask.png")
# A single mild monotonic tone curve lifts existing shadows. No local face
# replacement, denoising, sharpening, resampling or geometry transformation.
curve = [round(255 * (v / 255) ** 0.92) for v in range(256)]
edited = original.point(curve * 3).crop(crop).convert("RGBA")
edited.putalpha(mask)
edited.save(args.output / "profile-original-hands.png")
edited.save(args.output / "profile-original-hands.webp", lossless=True, exact=True, method=6)
png = np.asarray(Image.open(args.output / "profile-original-hands.png"))
assert np.array_equal(png, np.asarray(Image.open(args.output / "profile-original-hands.webp")))
expected = np.asarray(original.point(curve * 3).crop(crop))
assert np.array_equal(png[:, :, :3], expected)
assert hashlib.sha256((args.output / "1000689121.jpg").read_bytes()).hexdigest() == source_hash
for label, color in [("cream", "#ecebe3"), ("white", "#ffffff"), ("dark", "#171b18")]:
    bg = Image.new("RGBA", edited.size, color)
    bg.alpha_composite(edited)
    bg.convert("RGB").save(args.output / f"edges-{label}.png")
# Equal native-scale crops share the exact same source rectangle.
face = (550, 330, 905, 810)
face_original = original.crop(face)
face_edited = Image.new("RGBA", edited.size, "#ecebe3")
face_edited.alpha_composite(edited)
face_edited = face_edited.crop((face[0]-crop[0], face[1]-crop[1], face[2]-crop[0], face[3]-crop[1])).convert("RGB")
sheet = Image.new("RGB", (face_original.width * 2 + 24, face_original.height + 40), "#ecebe3")
draw = ImageDraw.Draw(sheet)
draw.text((12, 12), "Original: native pixels", fill="#252b26")
draw.text((face_original.width + 36, 12), "Edited: same scale; tone + alpha only", fill="#252b26")
sheet.paste(face_original, (0, 40)); sheet.paste(face_edited, (face_original.width + 24, 40))
sheet.save(args.output / "likeness-inspection.png")
width = 480
height = round(edited.height * width / edited.width)
edges = Image.new("RGB", (width * 3, height + 40), "#ecebe3")
draw = ImageDraw.Draw(edges)
for index, label in enumerate(["cream", "white", "dark"]):
    draw.text((index * width + 12, 12), label, fill="#252b26")
    edges.paste(Image.open(args.output / f"edges-{label}.png").resize((width, height), Image.Resampling.LANCZOS), (index * width, 40))
edges.save(args.output / "edges-contact-sheet.png")
(args.output / "processing.json").write_text(json.dumps({
    "source": "1000689121.jpg", "source_sha256": source_hash, "source_size": original.size,
    "model": "ISNet general-use, CPU ONNX; alpha inference only",
    "model_md5": "fc16ebd8b0c10d971d3513d564d01e29",
    "crop": crop, "output_size": edited.size, "face_comparison_source_rect": face,
    "tone_curve": "round(255 * (channel / 255) ** 0.92)",
    "alpha_cleanup": "One native-pixel minimum erosion; black/white points 25/230; soft alpha; registered opaque sleeve interior extended to two pixels inside inferred outline",
    "registered_cleanup": cleanup,
    "backpack": "Retained. No convincing clothing-only reconstruction available in this deterministic matting workflow.",
    "face_or_clothing_generation": False, "sharpening_or_upscaling": False,
    "png_rgb_matches_original_plus_documented_curve": True, "webp_rgba_exact_match": True,
    "original_bytes_preserved": True,
}, indent=2) + "\n")
print(json.dumps({"size": edited.size, "alpha_bounds": mask.getbbox(), "output": str(args.output)}))
