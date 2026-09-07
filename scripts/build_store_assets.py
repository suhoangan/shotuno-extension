import os
import shutil
from PIL import Image, ImageDraw, ImageFilter, ImageFont

desktop_dir = r"C:\Users\hoang\Desktop\shotuno-asset"
desktop_out = os.path.join(desktop_dir, "fixed-store-assets")
extension_dir = r"D:\projects\ai_idea\extension"
store_listing_assets = os.path.join(extension_dir, "store-listing", "assets")
store_assets_dir = os.path.join(extension_dir, "store-assets")

for d in [desktop_out, store_listing_assets, store_assets_dir]:
    os.makedirs(d, exist_ok=True)

font_regular = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 13)
font_url = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 14)
font_bold = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 14)

def save_all_destinations(img, filename):
    for target_dir in [desktop_out, store_listing_assets, store_assets_dir]:
        target_path = os.path.join(target_dir, filename)
        img.save(target_path, "PNG", optimize=True)
    print(f"Saved {filename} to all destinations.")

# ==========================================
# 0. STORE ICON (128x128)
# ==========================================
icon_src = os.path.join(extension_dir, "public", "icon-128.png")
icon_img = Image.open(icon_src).convert("RGBA")
icon_128 = icon_img.resize((128, 128), Image.Resampling.LANCZOS)
save_all_destinations(icon_128, "icon-128.png")

# ==========================================
# 1. SCREENSHOT 01: POPUP CAPTURE MODES (1280x800)
# ==========================================
s01 = Image.new("RGBA", (1280, 800), (245, 247, 250, 255))

# Background webpage (Shotuno pricing page in editor blurred)
bg_src = Image.open(os.path.join(desktop_dir, "full screen.png"))
bg_crop = bg_src.crop((0, 0, 3060, int(3060 * (724 / 1280)))).resize((1280, 724), Image.Resampling.LANCZOS)
bg_blur = bg_crop.filter(ImageFilter.GaussianBlur(5))
dim_layer = Image.new("RGBA", (1280, 724), (0, 0, 0, 35))
bg_blur = Image.alpha_composite(bg_blur.convert("RGBA"), dim_layer)
s01.paste(bg_blur, (0, 76))

# Browser Header Bar
bar = Image.new("RGBA", (1280, 76), (232, 238, 242, 255))
bdraw = ImageDraw.Draw(bar)

# macOS traffic light buttons
bdraw.ellipse([18, 30, 30, 42], fill=(255, 95, 87, 255))
bdraw.ellipse([38, 30, 50, 42], fill=(254, 188, 46, 255))
bdraw.ellipse([58, 30, 70, 42], fill=(40, 200, 64, 255))

# Active Tab
bdraw.rounded_rectangle([80, 16, 310, 76], radius=8, fill=(255, 255, 255, 255))
tab_icon = Image.open(os.path.join(extension_dir, "public", "icon-16.png")).convert("RGBA")
bar.paste(tab_icon, (92, 34), tab_icon)
bdraw.text((116, 34), "Shotuno — Capture & Annotate", font=font_regular, fill=(51, 65, 85, 255))

# Omnibox / Address Bar
bdraw.rounded_rectangle([325, 16, 1040, 64], radius=16, fill=(255, 255, 255, 255), outline=(210, 220, 225, 255), width=1)
# Small lock icon
bdraw.rectangle([342, 38, 350, 46], fill=(100, 116, 139, 255))
bdraw.arc([343, 33, 349, 41], start=180, end=0, fill=(100, 116, 139, 255), width=2)
bdraw.text((362, 32), "https://shotuno.com", font=font_url, fill=(71, 85, 105, 255))

s01.paste(bar, (0, 0), bar)

# Extension Pill (from 1-popup.png top bar)
top_bar = Image.open(os.path.join(desktop_dir, "1-popup.png")).crop((390, 0, 600, 76))
pill = top_bar.resize((185, 66), Image.Resampling.LANCZOS)
s01.paste(pill, (1060, 5))

# Popup Card
popup_raw = Image.open(os.path.join(desktop_dir, "1-popup.png"))
card_raw = popup_raw.crop((16, 76, 545, 1000))
card_h = 705
card_w = int(card_raw.size[0] * (card_h / card_raw.size[1]))
card_resized = card_raw.resize((card_w, card_h), Image.Resampling.LANCZOS)

# Drop shadow
shadow = Image.new("RGBA", (card_w + 40, card_h + 40), (0, 0, 0, 0))
sdraw = ImageDraw.Draw(shadow)
sdraw.rounded_rectangle([15, 15, card_w + 25, card_h + 25], radius=16, fill=(0, 0, 0, 65))
shadow_blur = shadow.filter(ImageFilter.GaussianBlur(14))

card_x = 830
card_y = 76
s01.paste(shadow_blur, (card_x - 15, card_y - 10), shadow_blur)
s01.paste(card_resized, (card_x, card_y), card_resized if card_resized.mode == "RGBA" else None)

save_all_destinations(s01.convert("RGB"), "screenshot-01-popup.png")

# ==========================================
# 2. SCREENSHOT 02: IN-PAGE EDITOR (1280x800)
# ==========================================
# Using 1280x800.png (which is 3818x1869 high-res full workspace)
# Crop to 16:10 keeping the whole content + sidepanel
im_ws = Image.open(os.path.join(desktop_dir, "1280x800.png"))
w_ws, h_ws = im_ws.size
target_w = int(h_ws * 1.6) # 2990
# Right-aligned to include full sidepanel and un-cut "Capture. Annotate. Ship."
crop_ws = im_ws.crop((w_ws - target_w, 0, w_ws, h_ws)).resize((1280, 800), Image.Resampling.LANCZOS)
save_all_destinations(crop_ws.convert("RGB"), "screenshot-02-editor.png")

# ==========================================
# 3. SCREENSHOT 03: GRID CAPTURE (1280x800)
# ==========================================
# Source: grid capture.png (3822x2003). Remove taskbar (bottom 59px).
# Crop focused on the 3 pricing regions + "GRID CAPTURE (3 regions) - Capture All" banner
im_grid = Image.open(os.path.join(desktop_dir, "grid capture.png"))
# x: 100 to 2800 (w=2700), h: 0 to 1687 (ratio 16:10 = 2700/1687 = 1.6)
crop_grid = im_grid.crop((100, 0, 2800, 1687)).resize((1280, 800), Image.Resampling.LANCZOS)
save_all_destinations(crop_grid.convert("RGB"), "screenshot-03-grid-capture.png")

# ==========================================
# 4. SCREENSHOT 04: PINS & GALLERY SIDE PANEL (1280x800)
# ==========================================
# Docked sidepanel alongside the gradient-framed editor canvas
s04 = Image.new("RGB", (1280, 800), (240, 244, 246))

# Left: editor canvas from full screen.png (3837x1944)
im_fs = Image.open(os.path.join(desktop_dir, "full screen.png"))
webpage_crop = im_fs.crop((0, 0, 3060, 1944)).resize((800, 800), Image.Resampling.LANCZOS)
s04.paste(webpage_crop, (0, 0))

# Right: Pins & Gallery sidepanel from 2-side panel.png (768x1930)
im_sp = Image.open(os.path.join(desktop_dir, "2-side panel.png"))
sp_crop = im_sp.crop((0, 0, 768, 1380)).resize((480, 800), Image.Resampling.LANCZOS)
s04.paste(sp_crop, (800, 0))

# Clean divider line
draw_s04 = ImageDraw.Draw(s04)
draw_s04.line([(800, 0), (800, 800)], fill=(215, 222, 228), width=1)

save_all_destinations(s04, "screenshot-04-sidepanel.png")

# ==========================================
# 5. SCREENSHOT 05: EDITOR TOOLS & PALETTES (1280x800)
# ==========================================
# Source: 3- editor.png (3032x1926) showing toolbar, shapes dropdown, stickers, color pills, workspace modal
im_tools = Image.open(os.path.join(desktop_dir, "3- editor.png"))
# 3032 / 1.6 = 1895 height. Crop 31px off the bottom.
crop_tools = im_tools.crop((0, 0, 3032, 1895)).resize((1280, 800), Image.Resampling.LANCZOS)
save_all_destinations(crop_tools.convert("RGB"), "screenshot-05-tools.png")

# ==========================================
# 6. PROMO SMALL TILE (440x280)
# ==========================================
# Existing promo-small in store-listing is already 440x280.
promo_small_src = os.path.join(extension_dir, "store-listing", "assets", "promo-small-440x280.png")
if os.path.exists(promo_small_src):
    promo_small = Image.open(promo_small_src).convert("RGB").resize((440, 280), Image.Resampling.LANCZOS)
    save_all_destinations(promo_small, "promo-small-440x280.png")

# ==========================================
# 7. PROMO MARQUEE BANNER (1400x560)
# ==========================================
# Existing promo-marquee in desktop/store-listing
promo_marquee_src = os.path.join(desktop_dir, "promo-marquee-1400x560.png")
if os.path.exists(promo_marquee_src):
    promo_marquee = Image.open(promo_marquee_src).convert("RGB").resize((1400, 560), Image.Resampling.LANCZOS)
    save_all_destinations(promo_marquee, "promo-marquee-1400x560.png")

print("All Chrome Web Store assets have been successfully built and synced!")
