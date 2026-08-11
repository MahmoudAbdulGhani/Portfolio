import sys
import fitz

doc = fitz.open("cv-test.pdf")
print("PAGES:", doc.page_count)
print("=" * 60)

def rect_overlap(a, b):
    return not (b.x0 >= a.x1 or b.x1 <= a.x0 or b.y0 >= a.y1 or b.y1 <= a.y0)

for pno, page in enumerate(doc, 1):
    pw, ph = page.rect.width, page.rect.height
    words = page.get_text("words")  # x0,y0,x1,y1,word,block,line,word_no
    print(f"\n--- PAGE {pno}  size={pw:.0f}x{ph:.0f}  words={len(words)} ---")

    # 1) bounds check: any word outside printable area?
    outside = [w for w in words if w[0] < 20 or w[1] < 18 or w[2] > pw - 20 or w[3] > ph - 16]
    if outside:
        print("OUTSIDE-MARGIN WORDS:", [(round(w[0]), round(w[1]), round(w[2]), round(w[3]), w[4]) for w in outside])

    # 2) overlap check between word rects on same line region
    olaps = []
    for i in range(len(words)):
        for j in range(i + 1, len(words)):
            a, b = words[i], words[j]
            # ignore words from same line (they should not overlap horizontally)
            ra, rb = fitz.Rect(a[:4]), fitz.Rect(b[:4])
            if rect_overlap(ra, rb) and not (ra & rb).is_empty:
                area = (ra & rb).get_area()
                if area > 12 and abs(ra.y0 - rb.y0) < 3:
                    olaps.append((a[4], b[4], round(area, 1)))
    if olaps:
        print("OVERLAPS(same-line, area>12):", olaps[:20])

    # 3) reading order text dump (document order)
    txt = page.get_text("text")
    print("---- ORDERED TEXT (first 900 chars) ----")
    print(txt[:900])
    print("---- END TEXT ----")

# overall: verify key sections appear in logical order across doc
full = " ".join(page.get_text("text") for page in doc)
for key in ["Mahmoud", "Professional Summary", "Skills:", "Professional Experience", "Projects", "Education", "Certifications", "Languages", "Page"]:
    print(f"contains {key!r}:", key in full)