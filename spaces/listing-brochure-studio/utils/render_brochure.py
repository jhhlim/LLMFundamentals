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

from .listing import Listing

ASSETS = Path(__file__).resolve().parent.parent / "assets"


def _hex(color: str, fallback: str = "#1F4E5F") -> HexColor:
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


def _draw_cover_photo(c: canvas.Canvas, img: PILImage.Image, x, y, w, h):
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    buf.seek(0)
    c.drawImage(ImageReader(buf), x, y, width=w, height=h, preserveAspectRatio=True, anchor="c", mask="auto")


def render_pdf(
    listing: Listing,
    images: list[PILImage.Image],
    template_name: str = "Modern",
) -> str:
    """Render a one-page letter PDF and return the temp file path."""
    fd, path = tempfile.mkstemp(suffix=".pdf", prefix="brochure_")
    os.close(fd)

    width, height = letter
    c = canvas.Canvas(path, pagesize=letter)
    accent = _hex(listing.accent_color)
    ink = HexColor("#1A1A1A")
    muted = HexColor("#5A6570")
    soft = HexColor("#F3F1EC")

    # Atmosphere band
    c.setFillColor(soft)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    c.setFillColor(accent)
    c.rect(0, height - 1.15 * inch, width, 1.15 * inch, fill=1, stroke=0)

    # Brand + price
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(0.6 * inch, height - 0.45 * inch, (listing.brokerage or "BROCHURE STUDIO").upper())
    c.setFont("Helvetica", 10)
    c.drawRightString(width - 0.6 * inch, height - 0.45 * inch, listing.price or "")

    c.setFont("Helvetica-Bold", 22)
    headline = listing.headline or "Featured Listing"
    c.drawString(0.6 * inch, height - 0.9 * inch, headline[:58])

    # Hero image
    hero_h = 3.35 * inch if template_name != "Luxury" else 3.7 * inch
    hero_y = height - 1.35 * inch - hero_h
    c.setFillColor(HexColor("#D9D4CB"))
    c.rect(0.5 * inch, hero_y, width - 1.0 * inch, hero_h, fill=1, stroke=0)
    if images:
        _draw_cover_photo(c, images[0], 0.5 * inch, hero_y, width - 1.0 * inch, hero_h)
        c.setFillColor(accent)
        c.rect(0.5 * inch, hero_y, 0.12 * inch, hero_h, fill=1, stroke=0)

    # Address + facts
    y = hero_y - 0.35 * inch
    c.setFillColor(ink)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(0.6 * inch, y, listing.full_address() or "Address available on request")
    y -= 0.22 * inch
    c.setFillColor(muted)
    c.setFont("Helvetica", 10)
    c.drawString(0.6 * inch, y, listing.facts_line())

    # Two-column body
    left_x = 0.6 * inch
    right_x = 4.35 * inch
    col_width = 3.4 * inch
    body_top = y - 0.35 * inch

    c.setFillColor(ink)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(left_x, body_top, "About this home")
    text = c.beginText(left_x, body_top - 0.22 * inch)
    text.setFont("Helvetica", 9.5)
    text.setFillColor(muted)
    for line in _wrap(listing.description or "", 52)[:8]:
        text.textLine(line)
    c.drawText(text)

    c.setFillColor(ink)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(right_x, body_top, "Highlights")
    bullet_y = body_top - 0.22 * inch
    for bullet in (listing.bullets or [])[:5]:
        c.setFillColor(accent)
        c.circle(right_x + 0.08 * inch, bullet_y + 0.04 * inch, 0.05 * inch, fill=1, stroke=0)
        c.setFillColor(muted)
        c.setFont("Helvetica", 9.5)
        for i, line in enumerate(_wrap(bullet, 40)[:2]):
            c.drawString(right_x + 0.22 * inch, bullet_y - i * 0.14 * inch, line)
        bullet_y -= 0.34 * inch

    # Secondary photo strip
    strip_y = 1.55 * inch
    thumb_w = 2.35 * inch
    thumb_h = 1.45 * inch
    extras = images[1:4]
    if extras:
        for idx, img in enumerate(extras):
            x = 0.55 * inch + idx * (thumb_w + 0.15 * inch)
            c.setFillColor(HexColor("#D9D4CB"))
            c.roundRect(x, strip_y, thumb_w, thumb_h, 6, fill=1, stroke=0)
            _draw_cover_photo(c, img, x, strip_y, thumb_w, thumb_h)

    # Footer / CTA
    c.setFillColor(accent)
    c.roundRect(0.5 * inch, 0.45 * inch, width - 1.0 * inch, 0.9 * inch, 8, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(0.75 * inch, 0.95 * inch, listing.cta or "Schedule a private showing")
    c.setFont("Helvetica", 9.5)
    agent_bits = [listing.agent_name, listing.agent_phone, listing.agent_email]
    c.drawString(0.75 * inch, 0.7 * inch, "  ·  ".join(b for b in agent_bits if b) or listing.brokerage)
    if listing.listing_url:
        c.setFont("Helvetica", 8)
        c.drawString(0.75 * inch, 0.55 * inch, listing.listing_url[:90])

    if template_name == "Open House":
        c.setFillColor(HexColor("#C45C26"))
        c.roundRect(width - 2.4 * inch, height - 1.05 * inch, 1.8 * inch, 0.35 * inch, 4, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(width - 1.5 * inch, height - 0.93 * inch, "OPEN HOUSE")

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
