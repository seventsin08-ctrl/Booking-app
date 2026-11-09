"""Generates the Staymark bookmark logo assets (black & white)."""
from PIL import Image, ImageDraw
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "images")
SS = 4  # supersampling for smooth edges


def bookmark(size, scale, fg, bg):
    s = size * SS
    img = Image.new("RGBA", (s, s), bg)
    d = ImageDraw.Draw(img)
    w = s * scale * 0.72
    h = s * scale
    x0 = (s - w) / 2
    y0 = (s - h) / 2
    x1, y1 = x0 + w, y0 + h
    r = w * 0.2
    notch = h * 0.24
    # rounded top
    d.rounded_rectangle([x0, y0, x1, y0 + 2 * r], radius=r, fill=fg)
    # body with the V-notch at the bottom
    d.polygon([(x0, y0 + r), (x1, y0 + r), (x1, y1), ((x0 + x1) / 2, y1 - notch), (x0, y1)], fill=fg)
    return img.resize((size, size), Image.LANCZOS)


def save(name, size, scale, fg, bg):
    bookmark(size, scale, fg, bg).save(os.path.join(OUT, name))


BLACK = (17, 17, 17, 255)
WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)

save("icon.png", 1024, 0.56, BLACK, WHITE)
save("adaptive-icon.png", 1024, 0.42, BLACK, CLEAR)  # inside Android safe zone
save("monochrome-icon.png", 1024, 0.42, WHITE, CLEAR)
save("splash-icon.png", 512, 0.8, BLACK, CLEAR)
save("splash-icon-dark.png", 512, 0.8, WHITE, CLEAR)
save("favicon.png", 96, 0.7, BLACK, WHITE)
print("ok")
