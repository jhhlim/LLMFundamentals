from __future__ import annotations

import os
import re

from .listing import Listing


def _inference_token() -> str | None:
    return (
        os.getenv("HF_TOKEN")
        or os.getenv("HUGGING_FACE_HUB_TOKEN")
        or os.getenv("HF_API_TOKEN")
    )


def local_copy(listing: Listing, tone: str = "warm modern") -> Listing:
    """Deterministic copy writer so the Space works without an LLM key."""
    place = listing.neighborhood or listing.city or "this neighborhood"
    home = listing.property_type or "home"
    price = listing.price or "an inviting price point"

    if not listing.headline:
        if "luxury" in tone.lower():
            listing.headline = f"Refined {home} in {place}"
        elif "family" in tone.lower():
            listing.headline = f"A place to grow in {place}"
        else:
            listing.headline = f"Modern living in {place}"

    if not listing.description:
        listing.description = (
            f"Discover this {listing.beds + '-bedroom ' if listing.beds else ''}"
            f"{home.lower()} in {place}. Thoughtful finishes, easy living spaces, "
            f"and a setting that makes everyday life feel special — offered at {price}."
        )

    if not listing.bullets:
        candidates = [
            f"{listing.beds} bedrooms designed for comfort" if listing.beds else "",
            f"{listing.baths} baths with a spa-inspired primary suite" if listing.baths else "",
            f"{listing.sqft} sq ft of well-planned living space" if listing.sqft else "",
            f"Located in {place}",
            "Move-in ready with standout curb appeal",
            "Ideal for entertaining indoors and out",
        ]
        listing.bullets = [c for c in candidates if c][:4]

    if not listing.cta:
        listing.cta = "Schedule a private showing"

    return listing


def polish_with_llm(listing: Listing, tone: str = "warm modern") -> tuple[Listing, str]:
    """
    Optional polish via Hugging Face Inference API.
    Falls back to local copy if no token / request fails.
    """
    listing = local_copy(listing, tone=tone)
    token = _inference_token()
    if not token:
        return listing, "Using local copy writer (set HF_TOKEN secret to enable LLM polish)."

    prompt = f"""Rewrite this real estate listing for a one-page brochure.
Tone: {tone}
Return ONLY JSON with keys: headline, description, bullets (array of 4 short strings), cta.

Address: {listing.full_address()}
Price: {listing.price}
Beds/Baths/SqFt: {listing.beds}/{listing.baths}/{listing.sqft}
Type: {listing.property_type}
Neighborhood: {listing.neighborhood}
Existing description: {listing.description}
Amenities: {', '.join(listing.amenities)}
"""

    try:
        from huggingface_hub import InferenceClient

        client = InferenceClient(token=token)
        model = os.getenv("BROCHURE_LLM_MODEL", "meta-llama/Meta-Llama-3-8B-Instruct")
        text = client.text_generation(
            prompt,
            model=model,
            max_new_tokens=400,
            temperature=0.4,
        )
    except Exception as exc:  # noqa: BLE001 — soft-fail to local copy
        return listing, f"LLM polish unavailable ({exc}). Using local copy."

    headline = _extract_field(text, "headline") or listing.headline
    description = _extract_field(text, "description") or listing.description
    cta = _extract_field(text, "cta") or listing.cta
    bullets = _extract_bullets(text) or listing.bullets

    listing.headline = headline.strip().strip('"')
    listing.description = description.strip().strip('"')
    listing.cta = cta.strip().strip('"')
    listing.bullets = bullets[:4]
    return listing, f"Copy polished with {model}."


def _extract_field(text: str, key: str) -> str | None:
    patterns = [
        rf'"{key}"\s*:\s*"([^"]+)"',
        rf"'{key}'\s*:\s*'([^']+)'",
        rf"{key}\s*:\s*(.+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip().rstrip(",")
    return None


def _extract_bullets(text: str) -> list[str]:
    block = re.search(r'"bullets"\s*:\s*\[(.*?)\]', text, flags=re.IGNORECASE | re.DOTALL)
    if not block:
        return []
    return [b.strip().strip('"').strip("'") for b in re.findall(r'"([^"]+)"', block.group(1))]
