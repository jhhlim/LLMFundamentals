from __future__ import annotations

import io
import os
import tempfile
from pathlib import Path
from typing import Sequence
from urllib.request import Request, urlopen

from PIL import Image as PILImage
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

from .listing import BRAND_ACCENT, BRAND_DRE, BRAND_INK, BRAND_SITE, BRAND_SOFT, Listing

ASSETS = Path(__file__).resolve().parent.parent / "assets"
HEADSHOT = ASSETS / "jason-lim-headshot.jpg"


def _hex(color: str, fallback: str = BRAND_ACCENT) -> HexColor:
    try:
        return HexColor(color or fallback)
    except Exception:
        return HexColor(fallback)


def _load_image(source) -> PILImage.Image | None:
    try:
        if source is None:
            return None
        if isinstance(source, PILImage.Image):
            return source.convert("RGB")
        if isinstance(source, dict) and source.get("path"):
            return PILImage.open(source["path"]).convert("RGB")
        if isinstance(source, (str, Path)) and os.path.exists(str(source)):
            return PILImage.open(str(source)).convert("RGB")
        if isinstance(source, str) and source.startswith("http"):
            req = Request(source, headers={"User-Agent": "ListingBrochureStudio/1.0"})
            with urlopen(req, timeout=20) as resp:
                return PILImage.open(io.BytesIO(resp.read())).convert("RGB")
    except Exception:
        return None
    return None


def collect_images(
    uploads: Sequence | None,
    photo_urls: Sequence[str] | None,
    max_images: int = 4,
) -> list[PILImage.Image]:
    images: list[PILImage.Image] = []
    for item in uploads or []:
        img = _load_image(item)
        if img is not None:
            images.append(img)
        if len(images) >= max_images:
            return images
    for url in photo_urls or []:
        img = _load_image(url)
        if img is not None:
            images.append(img)
        if len(images) >= max_images:
            break
    return images


def _cover_crop(img: PILImage.Image, target_w: float, target_h: float) -> PILImage.Image:
    """Center-crop image to target aspect ratio, then size for sharp PDF draw."""
    tw, th = max(target_w, 1), max(target_h, 1)
    target_ratio = tw / th
    iw, ih = img.size
    src_ratio = iw / ih if ih else 1
    if src_ratio > target_ratio:
        new_w = int(ih * target_ratio)
        left = max((iw - new_w) // 2, 0)
        box = (left, 0, left + new_w, ih)
    else:
        new_h = int(iw / target_ratio) if target_ratio else ih
        top = max((ih - new_h) // 2, 0)
        box = (0, top, iw, top + new_h)
    cropped = img.crop(box)
    # Upscale pixels roughly to print density (~150 dpi)
    out_w = max(int(tw * 150 / 72), 1)
    out_h = max(int(th * 150 / 72), 1)
    return cropped.resize((out_w, out_h), PILImage.Resampling.LANCZOS)


def _draw_cover_photo(c: canvas.Canvas, img: PILImage.Image, x, y, w, h):
    fitted = _cover_crop(img, w, h)
    buf = io.BytesIO()
    fitted.save(buf, format="JPEG", quality=92)
    buf.seek(0)
    c.drawImage(ImageReader(buf), x, y, width=w, height=h, preserveAspectRatio=False, mask="auto")


def render_pdf(
    listing: Listing,
    images: list[PILImage.Image],
    template_name: str = "Modern",
) -> str:
    """Render a full-bleed one-page letter PDF and return the temp file path."""
    fd, path = tempfile.mkstemp(suffix=".pdf", prefix="brochure_")
    os.close(fd)

    width, height = letter
    c = canvas.Canvas(path, pagesize=letter)
    accent = _hex(listing.accent_color or BRAND_ACCENT)
    ink = _hex(BRAND_INK, "#0B1F33")
    muted = HexColor("#5A6570")
    soft = _hex(BRAND_SOFT, "#E8F2F3")

    # Full-page soft ground
    c.setFillColor(soft)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Full-bleed header
    header_h = 0.95 * inch
    c.setFillColor(ink)
    c.rect(0, height - header_h, width, header_h, fill=1, stroke=0)
    c.setFillColor(accent)
    c.rect(0, height - header_h, width, 0.07 * inch, fill=1, stroke=0)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 10)
    brand_line = f"{listing.agent_name or 'Jason Lim'}  ·  {listing.brokerage or 'Compass'}"
    c.drawString(0.45 * inch, height - 0.32 * inch, brand_line.upper())
    c.setFont("Helvetica", 8)
    c.drawString(0.45 * inch, height - 0.48 * inch, listing.dre or BRAND_DRE)
    c.setFont("Helvetica-Bold", 13)
    c.drawRightString(width - 0.45 * inch, height - 0.38 * inch, listing.price or "")
    c.setFont("Helvetica-Bold", 18)
    c.drawString(0.45 * inch, height - 0.78 * inch, (listing.headline or "Featured Listing")[:62])

    # Full-bleed hero
    footer_h = 0.92 * inch
    hero_h = 3.85 * inch if template_name == "Luxury" else 3.55 * inch
    hero_y = height - header_h - hero_h
    c.setFillColor(HexColor("#C9D7DB"))
    c.rect(0, hero_y, width, hero_h, fill=1, stroke=0)
    if images:
        _draw_cover_photo(c, images[0], 0, hero_y, width, hero_h)
    c.setFillColor(accent)
    c.rect(0, hero_y, 0.14 * inch, hero_h, fill=1, stroke=0)

    if template_name == "Open House":
        c.setFillColor(HexColor("#C45C26"))
        c.roundRect(width - 1.9 * inch, height - header_h + 0.18 * inch, 1.5 * inch, 0.32 * inch, 4, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(width - 1.15 * inch, height - header_h + 0.28 * inch, "OPEN HOUSE")

    # Content band
    pad = 0.4 * inch
    y = hero_y - 0.28 * inch
    c.setFillColor(ink)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(pad, y, listing.full_address() or "Address available on request")
    y -= 0.18 * inch
    c.setFillColor(muted)
    c.setFont("Helvetica", 10)
    c.drawString(pad, y, listing.facts_line())

    body_top = y - 0.24 * inch
    left_x = pad
    right_x = width / 2 + 0.08 * inch
    c.setFillColor(ink)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(left_x, body_top, "About this home")
    c.drawString(right_x, body_top, "Highlights")

    desc_lines = _wrap(listing.description or "", 48)[:6]
    text = c.beginText(left_x, body_top - 0.18 * inch)
    text.setFont("Helvetica", 9.5)
    text.setFillColor(muted)
    for line in desc_lines:
        text.textLine(line)
    c.drawText(text)

    bullets = (listing.bullets or [])[:4]
    bullet_y = body_top - 0.18 * inch
    for bullet in bullets:
        c.setFillColor(accent)
        c.circle(right_x + 0.07 * inch, bullet_y + 0.03 * inch, 0.045 * inch, fill=1, stroke=0)
        c.setFillColor(muted)
        c.setFont("Helvetica", 9.5)
        for i, line in enumerate(_wrap(bullet, 42)[:2]):
            c.drawString(right_x + 0.2 * inch, bullet_y - i * 0.12 * inch, line)
        bullet_y -= 0.28 * inch

    content_bottom = min(
        body_top - 0.18 * inch - len(desc_lines) * 11,
        bullet_y + 0.08 * inch,
    ) - 0.16 * inch

    # Thumbnail strip fills remaining space to the footer (no dead band)
    extras = images[1:4]
    thumb_top = content_bottom
    thumb_h = max(1.35 * inch, thumb_top - footer_h)
    thumb_y = footer_h
    n = max(len(extras), 1)
    thumb_w = width / n
    if extras:
        for idx, img in enumerate(extras):
            x = idx * thumb_w
            c.setFillColor(HexColor("#C9D7DB"))
            c.rect(x, thumb_y, thumb_w, thumb_h, fill=1, stroke=0)
            _draw_cover_photo(c, img, x, thumb_y, thumb_w, thumb_h)
    elif images:
        _draw_cover_photo(c, images[0], 0, thumb_y, width, thumb_h)

    # Full-bleed footer
    c.setFillColor(ink)
    c.rect(0, 0, width, footer_h, fill=1, stroke=0)
    c.setFillColor(accent)
    c.rect(0, 0, 0.14 * inch, footer_h, fill=1, stroke=0)

    text_x = 0.4 * inch
    if HEADSHOT.exists():
        try:
            c.drawImage(str(HEADSHOT), 0.3 * inch, 0.18 * inch, width=0.56 * inch, height=0.56 * inch, mask="auto")
            text_x = 1.05 * inch
        except Exception:
            text_x = 0.4 * inch

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(text_x, 0.6 * inch, listing.cta or "Schedule a private showing")
    c.setFont("Helvetica", 9)
    agent_bits = [
        listing.agent_name or "Jason Lim",
        listing.brokerage or "Compass",
        listing.agent_phone,
        listing.dre or BRAND_DRE,
    ]
    c.drawString(text_x, 0.4 * inch, "  ·  ".join(b for b in agent_bits if b))
    site = listing.listing_url or BRAND_SITE
    if "vercel.app" in site or not site:
        site = BRAND_SITE
    c.setFont("Helvetica", 8.5)
    c.drawString(text_x, 0.22 * inch, site.replace("https://", "").replace("http://", "")[:70])

    c.showPage()
    c.save()
    return path


def _wrap(text: str, width: int) -> list[str]:
    words = (text or "").split()
    if not words:
        return []
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        if len(current) + 1 + len(word) <= width:
            current += " " + word
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines
