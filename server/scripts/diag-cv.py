import fitz

doc = fitz.open("cv-test.pdf")
page = doc[0]
pw, ph = page.rect.width, page.rect.height
words = page.get_text("words")
print("page size", pw, ph)
print("\n-- TOP 26 words (contact/header area) --")
for w in words[:26]:
    print(f"  ({w[0]:6.1f},{w[1]:6.1f})-({w[2]:6.1f},{w[3]:6.1f})  {w[4]!r}")
print("\n-- words containing 'Stack' / 'Demo' / 'SMTP' / 'GameZone' --")
for w in words:
    if any(k in w[4].lower() for k in ("stack", "demo", "smtp", "gamezone", "source", "nodemailer")):
        print(f"  ({w[0]:6.1f},{w[1]:6.1f})-({w[2]:6.1f},{w[3]:6.1f})  {w[4]!r}")