#!/usr/bin/env python3
"""Generate app icons in all required sizes for iOS PWA."""

from PIL import Image, ImageDraw, ImageFont
import math, os

OUT_DIR = 'www/icons'
os.makedirs(OUT_DIR, exist_ok=True)

# ── Icon Design ──
# Blue gradient background + white "AI" monogram with circuit/brain motif

def draw_icon(size):
    """Draw the app icon at given size and return PIL Image."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # ── 1. Background: rounded rectangle with gradient ──
    r = int(size * 0.225)  # corner radius (iOS style)
    # Top color: #007AFF, Bottom color: #0055CC
    for y in range(size):
        ratio = y / size
        r_val = int(0 + (0 - 0) * ratio)
        g_val = int(122 + (85 - 122) * ratio)
        b_val = int(255 + (204 - 255) * ratio)
        color = (r_val, g_val, b_val, 255)
        draw.rectangle([0, y, size, y + 1], fill=color)

    # Apply rounded corners by drawing a mask
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, size - 1, size - 1], r, fill=255)

    # Create final rounded image
    rounded = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    for y in range(size):
        for x in range(size):
            if mask.getpixel((x, y)) > 128:
                rounded.putpixel((x, y), img.getpixel((x, y)))
    img = rounded
    draw = ImageDraw.Draw(img)

    # ── 2. Draw AI text ──
    margin = int(size * 0.15)
    font_size = int(size * 0.42)

    # Try system fonts, fall back to default
    font = None
    for font_name in [
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/SFNSDisplay.ttf',
        '/System/Library/Fonts/PingFang.ttc',
        '/Library/Fonts/Arial Bold.ttf',
    ]:
        try:
            font = ImageFont.truetype(font_name, font_size)
            break
        except (OSError, IOError):
            continue

    if font is None:
        try:
            font = ImageFont.truetype('/System/Library/Fonts/STHeiti Medium.ttc', font_size)
        except:
            font = ImageFont.load_default()

    # Draw "AI" text centered
    text = 'AI'
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (size - tw) // 2
    ty = (size - th) // 2 - int(size * 0.03)

    # Text shadow
    shadow_offset = max(1, int(size * 0.015))
    draw.text((tx + shadow_offset, ty + shadow_offset), text, fill=(0, 60, 140, 80), font=font)
    # Main text
    draw.text((tx, ty), text, fill=(255, 255, 255, 255), font=font)

    # ── 3. Subtle circuit lines / dots ──
    dot_radius = max(2, int(size * 0.025))
    dot_color = (255, 255, 255, 90)

    # Top-left accent dot
    ax = int(size * 0.22)
    ay = int(size * 0.22)
    draw.ellipse([ax - dot_radius, ay - dot_radius, ax + dot_radius, ay + dot_radius], fill=dot_color)

    # Bottom-right accent dots (small neural network hint)
    bx, by = int(size * 0.75), int(size * 0.75)
    for dx, dy in [(0, 0), (int(size * 0.06), 0), (0, int(size * 0.06))]:
        draw.ellipse([bx + dx - dot_radius, by + dy - dot_radius, bx + dx + dot_radius, by + dy + dot_radius], fill=dot_color)

    return img

# ── Generate all required sizes ──
sizes = {
    'icon-72.png': 72,
    'icon-96.png': 96,
    'icon-128.png': 128,
    'icon-144.png': 144,
    'icon-152.png': 152,
    'icon-167.png': 167,
    'icon-180.png': 180,   # iOS home screen
    'icon-192.png': 192,   # Android
    'icon-384.png': 384,
    'icon-512.png': 512,   # PWA splash / store
    'icon-1024.png': 1024, # App Store
}

for filename, size in sizes.items():
    img = draw_icon(size)
    path = os.path.join(OUT_DIR, filename)
    img.save(path, 'PNG')
    print(f'  ✅ {filename} ({size}x{size})')

print(f'\n✅ Generated {len(sizes)} icons in {OUT_DIR}/')
