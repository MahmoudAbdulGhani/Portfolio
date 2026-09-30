#!/usr/bin/env python3
"""Compare a generated application CV against the reference PDF.

Reports per-line text mismatches and per-span geometry drift so the renderer
can be tuned until the two documents agree.

Usage:
    python scripts/cv-diff.py <reference.pdf> <candidate.pdf> [--tolerance 1.0] [--runs]
"""

import argparse
import json
import sys

import pymupdf

# Substitutes are metric clones; accept the clone name for the original.
FONT_ALIASES = {
    "carlito": "calibri",
    "caladea": "cambria",
}

# PDFKit writes subset names without separators (e.g. "Carlito-Bold").
FACE_ALIASES = {
    "calibri": "calibri",
    "calibriregular": "calibri",
    "calibribold": "calibri-bold",
    "calibrii": "calibri-italic",
    "calibriitalic": "calibri-italic",
    "calibriz": "calibri-bolditalic",
    "calibribolditalic": "calibri-bolditalic",
    "cambria": "cambria",
    "cambriaregular": "cambria",
    "cambriabold": "cambria-bold",
    "cambriai": "cambria-italic",
    "cambriaz": "cambria-bolditalic",
    "symbolmt": "symbol",
}

# Word renders the list bullet from SymbolMT; Carlito supplies the same glyph.
BULLET_FONTS = {"symbol"}


def normalize_font(name):
    key = name.lower().replace(" ", "").replace("-", "").replace("_", "")
    # PDFKit emits subset names like "Carlito-Bold"; map the family prefix first.
    for alias, real in FONT_ALIASES.items():
        if key.startswith(alias):
            key = real + key[len(alias) :]
            break
    return FACE_ALIASES.get(key, key)


def extract_lines(page):
    """Flatten a page into visually-ordered lines of spans."""
    lines = []
    data = page.get_text("dict")
    for block in data["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            spans = []
            for span in line["spans"]:
                if not span["text"].strip():
                    continue
                x0, y0, x1, y1 = span["bbox"]
                spans.append(
                    {
                        "text": span["text"],
                        "font": normalize_font(span["font"]),
                        "size": round(span["size"], 2),
                        "x0": round(x0, 2),
                        "y0": round(y0, 2),
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                    }
                )
            if spans:
                lines.append(
                    {
                        "y0": round(min(s["y0"] for s in spans), 2),
                        "x0": round(min(s["x0"] for s in spans), 2),
                        "x1": round(max(s["x1"] for s in spans), 2),
                        "spans": spans,
                        "text": "".join(s["text"] for s in spans),
                    }
                )
    lines.sort(key=lambda l: (l["y0"], l["x0"]))
    return merge_bullets(coalesce(lines))


def coalesce(lines):
    """Merge lines that share a baseline into one visual line.

    Word groups a right-aligned date into the paragraph it belongs to, while
    PDFKit emits it separately. Normalising both documents to visual lines keeps
    the comparison about position and content rather than span grouping.
    """
    merged = []
    for line in lines:
        if merged and abs(line["y0"] - merged[-1]["y0"]) <= 1.0:
            host = merged[-1]
            spans = host["spans"] + line["spans"]
            spans.sort(key=lambda s: s["x0"])
            host["spans"] = spans
            host["text"] = "".join(s["text"] for s in spans)
            host["x0"] = round(min(s["x0"] for s in spans), 2)
            host["x1"] = round(max(s["x1"] for s in spans), 2)
        else:
            merged.append(line)
    return merged


def merge_bullets(lines):
    """Fold a standalone bullet glyph into the text line it belongs to.

    Word emits the bullet as its own span on a slightly higher baseline, so
    PyMuPDF reports it as a separate line. Both documents are normalized the
    same way before comparison.
    """
    merged = []
    for position, line in enumerate(lines):
        span = line["spans"][0] if len(line["spans"]) == 1 else None
        is_bullet = bool(
            span
            and (span["x1"] - span["x0"]) < 8
            and not span["text"].strip(" \u00a0\u2022\uf0b7\ufffd")
        )
        if is_bullet:
            # The bullet glyph sits ~1.5pt above the text it introduces; pair it
            # with the next line, which may not have been emitted yet.
            target = next(
                (
                    candidate
                    for candidate in lines[position + 1 :]
                    if 0 < candidate["y0"] - line["y0"] <= 4
                ),
                None,
            )
            if target is not None:
                target["spans"] = line["spans"] + target["spans"]
                target["text"] = line["text"] + target["text"]
                target["x0"] = min(target["x0"], line["x0"])
                target["y0"] = min(target["y0"], line["y0"])
                continue
        merged.append(line)
    merged.sort(key=lambda l: (l["y0"], l["x0"]))
    return merged


def extract_rules(page):
    rules = []
    for drawing in page.get_drawings():
        for item in drawing["items"]:
            if item[0] == "re":
                x0, y0, x1, y1 = item[1]
                rules.append(
                    {
                        "x0": round(x0, 2),
                        "y0": round(y0, 2),
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "h": round(y1 - y0, 2),
                    }
                )
            elif item[0] == "l":
                p0, p1 = item[1], item[2]
                rules.append(
                    {
                        "x0": round(p0.x, 2),
                        "y0": round(p0.y, 2),
                        "x1": round(p1.x, 2),
                        "y1": round(p1.y, 2),
                        "h": round(abs(p1.y - p0.y), 2),
                    }
                )
    rules.sort(key=lambda r: (r["y0"], r["x0"]))
    return rules


def norm_text(value):
    """Compare text as a letter stream, ignoring all spacing and separators.

    Word pads right-aligned runs with spaces and splits runs at style changes,
    so raw span concatenation differs between the two documents for reasons
    that have nothing to do with content. Geometry is checked separately.
    """
    kept = [c for c in value if not c.isspace() and c not in "|\u00b7"]
    return "".join(kept)


def compare(ref_page, cand_page, tolerance, check_runs=False):
    ref_lines = extract_lines(ref_page)
    cand_lines = extract_lines(cand_page)
    ref_rules = extract_rules(ref_page)
    cand_rules = extract_rules(cand_page)

    report = {
        "pageSize": {
            "reference": [round(v, 2) for v in (ref_page.rect.width, ref_page.rect.height)],
            "candidate": [round(v, 2) for v in (cand_page.rect.width, cand_page.rect.height)],
        },
        "counts": {
            "referenceLines": len(ref_lines),
            "candidateLines": len(cand_lines),
            "referenceRules": len(ref_rules),
            "candidateRules": len(cand_rules),
        },
        "textMismatches": [],
        "geometryDrift": [],
        "ruleDrift": [],
    }

    # Pair lines by vertical position; tolerate small y offsets by nearest match.
    used = set()
    pairs = []
    for rl in ref_lines:
        best, best_dy = None, None
        for idx, cl in enumerate(cand_lines):
            if idx in used:
                continue
            dy = abs(cl["y0"] - rl["y0"])
            if dy <= 12 and (best_dy is None or dy < best_dy):
                best, best_dy = idx, dy
        if best is None:
            pairs.append((rl, None))
        else:
            used.add(best)
            pairs.append((rl, cand_lines[best]))

    for rl, cl in pairs:
        if cl is None:
            report["textMismatches"].append(
                {"y0": rl["y0"], "reason": "missing", "reference": rl["text"]}
            )
            continue
        if norm_text(rl["text"]) != norm_text(cl["text"]):
            report["textMismatches"].append(
                {
                    "y0": rl["y0"],
                    "reason": "text",
                    "reference": rl["text"],
                    "candidate": cl["text"],
                }
            )
        dy = round(cl["y0"] - rl["y0"], 2)
        # Word pads right-aligned runs with leading spaces, which shifts the
        # span origin without moving the text. Compare the trailing edge then.
        padded = rl["text"][:1].isspace()
        dx = round((cl["x1"] if padded else cl["x0"]) - (rl["x1"] if padded else rl["x0"]), 2)
        ref_w = round(rl["x1"] - rl["x0"], 2)
        cand_w = round(cl["x1"] - cl["x0"], 2)
        dw = round(cand_w - ref_w, 2)
        if abs(dy) > tolerance or abs(dx) > tolerance:
            entry = {"y0": rl["y0"], "dx": dx, "dy": dy, "text": rl["text"][:60]}
            # A centered run drifts on both edges when the substituted font sets
            # it slightly wider or narrower, so report the width delta too.
            if abs(dw) > tolerance:
                entry["widthDelta"] = dw
            report["geometryDrift"].append(entry)
        previous_dx = None
        for rs, cs in zip(rl["spans"], cl["spans"]):
            is_bullet_span = rs["font"] in BULLET_FONTS
            if is_bullet_span and cs["font"] == "calibri":
                # Carlito supplies the bullet glyph in place of SymbolMT.
                continue
            if rs["font"] != cs["font"]:
                report["geometryDrift"].append(
                    {
                        "y0": rl["y0"],
                        "reason": "font",
                        "reference": rs["font"],
                        "candidate": cs["font"],
                        "text": rs["text"][:40],
                    }
                )
            elif abs(rs["size"] - cs["size"]) > 0.05:
                report["geometryDrift"].append(
                    {
                        "y0": rl["y0"],
                        "reason": "size",
                        "reference": rs["size"],
                        "candidate": cs["size"],
                        "text": rs["text"][:40],
                    }
                )
            elif check_runs:
                # Per-run origin check, opt-in via --runs. Word and PDFKit split
                # lines into spans differently and a substituted font shifts
                # every run on a line slightly, so positional pairing is only
                # trustworthy for coarse runs. It is a diagnostic aid, not the
                # default gate; the line-level extents above are the gate.
                sx = round(cs["x0"] - rs["x0"], 2)
                sy = round(cs["y0"] - rs["y0"], 2)
                # Word pads right-aligned runs with leading spaces, which moves
                # the span origin without moving any glyph.
                if rs["text"][:1].isspace():
                    sx = round(cs["x1"] - rs["x1"], 2)
                if abs(sx) > tolerance or abs(sy) > tolerance:
                    report["geometryDrift"].append(
                        {
                            "y0": rl["y0"],
                            "reason": "run",
                            "dx": sx,
                            "dy": sy,
                            "text": rs["text"][:40],
                        }
                    )
                previous_dx = sx

    for idx, cl in enumerate(cand_lines):
        if idx not in used:
            report["textMismatches"].append(
                {"y0": cl["y0"], "reason": "extra", "candidate": cl["text"]}
            )

    used_rules = set()
    for rr in ref_rules:
        best, best_d = None, None
        for idx, cr in enumerate(cand_rules):
            if idx in used_rules:
                continue
            d = abs(cr["y0"] - rr["y0"]) + abs(cr["x0"] - rr["x0"])
            if d <= 8 and (best_d is None or d < best_d):
                best, best_d = idx, d
        if best is None:
            report["ruleDrift"].append({"reason": "missing", "reference": rr})
        else:
            used_rules.add(best)
            cr = cand_rules[best]
            if (
                abs(cr["x0"] - rr["x0"]) > tolerance
                or abs(cr["x1"] - rr["x1"]) > tolerance
                or abs(cr["y0"] - rr["y0"]) > tolerance
            ):
                report["ruleDrift"].append(
                    {"reason": "drift", "reference": rr, "candidate": cr}
                )
    for idx, cr in enumerate(cand_rules):
        if idx not in used_rules:
            report["ruleDrift"].append({"reason": "extra", "candidate": cr})

    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("reference")
    parser.add_argument("candidate")
    parser.add_argument("--tolerance", type=float, default=1.0)
    parser.add_argument(
        "--runs",
        action="store_true",
        help="also compare each run origin; diagnostic only, since a substituted "
        "font shifts every run on a line slightly",
    )
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--limit", type=int, default=25)
    args = parser.parse_args()

    ref = pymupdf.open(args.reference)
    cand = pymupdf.open(args.candidate)
    if len(ref) != len(cand):
        print(
            f"PAGE COUNT MISMATCH: reference={len(ref)} candidate={len(cand)}",
            file=sys.stderr,
        )
        return 1

    total_issues = 0
    for index in range(len(ref)):
        report = compare(ref[index], cand[index], args.tolerance, args.runs)
        if args.json:
            print(json.dumps({"page": index + 1, **report}, indent=2))
        else:
            ps = report["pageSize"]
            print(f"=== page {index + 1} ===")
            print(f"page size  reference={ps['reference']}  candidate={ps['candidate']}")
            counts = report["counts"]
            print(
                f"lines      reference={counts['referenceLines']}  "
                f"candidate={counts['candidateLines']}"
            )
            print(
                f"rules      reference={counts['referenceRules']}  "
                f"candidate={counts['candidateRules']}"
            )
            for key, label in (
                ("textMismatches", "TEXT"),
                ("geometryDrift", "GEOMETRY"),
                ("ruleDrift", "RULES"),
            ):
                items = report[key]
                total_issues += len(items)
                print(f"\n{label} issues: {len(items)}")
                for item in items[: args.limit]:
                    print("  " + json.dumps(item, ensure_ascii=False))
                if len(items) > args.limit:
                    print(f"  ... {len(items) - args.limit} more")

    print(f"\nTOTAL ISSUES: {total_issues}")
    return 0 if total_issues == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
