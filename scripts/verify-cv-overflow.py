"""Validate actual PDF text placement, separate from generator coordinates."""
import sys
import pymupdf

document = pymupdf.open(sys.argv[1])
assert len(document) == 1, "Long-summary application CV must retain one Letter page"
page = document[0]
assert (page.rect.width, page.rect.height) == (612, 792)
assert " ".join(sys.argv[2].split()) in " ".join(page.get_text().split()), "Summary text must be preserved"
blocks = page.get_text("dict")["blocks"]
lines = [line for block in blocks if "lines" in block for line in block["lines"]]
text = lambda line: "".join(span["text"] for span in line["spans"])
summary_heading = next(line for line in lines if text(line) == "PROFESSIONAL SUMMARY")
experience_heading = next(line for line in lines if text(line) == "PROFESSIONAL EXPERIENCE")
summary_lines = lines[lines.index(summary_heading) + 1:lines.index(experience_heading)]
assert len(summary_lines) >= 5, "Fixture must exercise a genuinely long summary"
assert max(line["bbox"][3] for line in summary_lines) + 5 < experience_heading["bbox"][1], "Summary overlaps the next section"
assert max(line["bbox"][3] for line in lines) < 780, "Text must stay inside the Letter page"
assert all("Carlito" in span["font"] for line in lines for span in line["spans"]), "Application fonts must remain Carlito"
print("Rendered long-summary CV: preserved text, separated sections, Letter bounds and Carlito passed.")
