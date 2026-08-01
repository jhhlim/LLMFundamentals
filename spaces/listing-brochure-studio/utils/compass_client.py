from __future__ import annotations

import os
import re
from typing import Any

import requests

from .listing import Listing

# Optional third-party Compass listing API (RapidAPI / PullAPI style).
# Set RAPIDAPI_KEY as a Hugging Face Space secret to enable URL import.
RAPIDAPI_HOST = os.getenv(
    "RAPIDAPI_HOST", "compass-com-real-estate-data-api.p.rapidapi.com"
)
PROPERTY_PATH = os.getenv("COMPASS_PROPERTY_PATH", "/compass/property")


def _rapidapi_key() -> str | None:
    return os.getenv("RAPIDAPI_KEY") or os.getenv("COMPASS_API_KEY")


def is_compass_url(url: str) -> bool:
    return bool(url) and "compass.com" in url.lower()


def compass_api_configured() -> bool:
    return bool(_rapidapi_key())


def _dig(data: dict[str, Any], *paths: str, default: Any = None) -> Any:
    for path in paths:
        cur: Any = data
        ok = True
        for part in path.split("."):
            if isinstance(cur, dict) and part in cur:
                cur = cur[part]
            else:
                ok = False
                break
        if ok and cur not in (None, ""):
            return cur
    return default


def _format_price(value: Any) -> str:
    if value is None or value == "":
        return ""
    if isinstance(value, str):
        if value.strip().startswith("$"):
            return value.strip()
        digits = re.sub(r"[^\d.]", "", value)
        if not digits:
            return value
        value = float(digits) if "." in digits else int(digits)
    try:
        return f"${int(value):,}"
    except (TypeError, ValueError):
        return str(value)


def _as_list(value: Any) -> list[str]:
    if not value:
        return []
    if isinstance(value, list):
        out = []
        for item in value:
            if isinstance(item, str):
                out.append(item)
            elif isinstance(item, dict):
                url = item.get("url") or item.get("href") or item.get("src")
                if url:
                    out.append(str(url))
                else:
                    text = item.get("name") or item.get("title") or item.get("text")
                    if text:
                        out.append(str(text))
        return out
    if isinstance(value, str):
        return [v.strip() for v in re.split(r"[\n|;]", value) if v.strip()]
    return [str(value)]


def normalize_compass_payload(payload: dict[str, Any]) -> Listing:
    data = payload.get("data") if isinstance(payload.get("data"), dict) else payload
    if isinstance(data.get("property"), dict):
        data = data["property"]
    if isinstance(data.get("listing"), dict):
        data = data["listing"]

    photos = (
        _as_list(_dig(data, "photos", "images", "photo_urls", "media"))
        or _as_list(_dig(data, "image_urls"))
    )
    amenities = _as_list(_dig(data, "amenities", "features", "highlights"))
    agent = _dig(data, "agent", "listing_agent", "agents.0", default={}) or {}
    if isinstance(agent, list) and agent:
        agent = agent[0]

    address = str(
        _dig(data, "address", "street", "street_address", "formatted_address", default="")
        or ""
    )
    city = str(_dig(data, "city", "address.city", default="") or "")
    state = str(_dig(data, "state", "address.state", default="") or "")
    zip_code = str(_dig(data, "zip", "zip_code", "postalCode", "address.zip", default="") or "")
    neighborhood = str(_dig(data, "neighborhood", "area", "subdivision", default="") or "")
    description = str(_dig(data, "description", "remarks", "public_remarks", default="") or "")
    price = _format_price(_dig(data, "price", "list_price", "listPrice", "asking_price"))

    beds = _dig(data, "beds", "bedrooms", "beds_total")
    baths = _dig(data, "baths", "bathrooms", "baths_total")
    sqft = _dig(data, "sqft", "living_area", "square_feet", "size")
    property_type = str(
        _dig(data, "property_type", "home_type", "type", default="Single Family") or "Single Family"
    )

    agent_name = str(
        _dig(agent if isinstance(agent, dict) else {}, "name", "full_name", default="")
        or _dig(data, "agent_name", default="")
        or ""
    )
    agent_phone = str(
        _dig(agent if isinstance(agent, dict) else {}, "phone", "mobile", default="")
        or _dig(data, "agent_phone", default="")
        or ""
    )
    agent_email = str(
        _dig(agent if isinstance(agent, dict) else {}, "email", default="")
        or _dig(data, "agent_email", default="")
        or ""
    )

    bullets = amenities[:4] if amenities else []
    if description and not bullets:
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", description) if s.strip()]
        bullets = sentences[:4]

    return Listing(
        address=address,
        city=city,
        state=state,
        zip_code=zip_code,
        price=price,
        beds=str(beds) if beds is not None else "",
        baths=str(baths) if baths is not None else "",
        sqft=f"{int(sqft):,}" if isinstance(sqft, (int, float)) else str(sqft or ""),
        property_type=property_type,
        neighborhood=neighborhood,
        description=description,
        headline=f"{'Stunning home' if not neighborhood else f'Welcome to {neighborhood}'}",
        bullets=bullets,
        amenities=amenities[:8],
        agent_name=agent_name,
        agent_phone=agent_phone,
        agent_email=agent_email,
        brokerage=str(_dig(data, "brokerage", "office", default="Compass") or "Compass"),
        listing_url=str(_dig(data, "url", "listing_url", default="") or ""),
        photo_urls=photos[:12],
        cta="Schedule a private showing",
    )


def fetch_compass_listing(url: str) -> tuple[Listing | None, str]:
    """
    Fetch listing details for a Compass URL via RapidAPI if configured.
    Returns (listing, status_message).
    """
    url = (url or "").strip()
    if not url:
        return None, "Paste a Compass listing URL, or use Manual / Demo mode."
    if not is_compass_url(url):
        return None, "URL should be a compass.com listing link."

    key = _rapidapi_key()
    if not key:
        return None, (
            "Compass URL import needs a Space secret: RAPIDAPI_KEY "
            "(RapidAPI Compass listing API). Use Manual entry or Load Demo for now."
        )

    endpoint = f"https://{RAPIDAPI_HOST}{PROPERTY_PATH}"
    headers = {
        "x-rapidapi-key": key,
        "x-rapidapi-host": RAPIDAPI_HOST,
    }
    try:
        resp = requests.get(endpoint, headers=headers, params={"url": url}, timeout=45)
    except requests.RequestException as exc:
        return None, f"Compass API request failed: {exc}"

    if resp.status_code == 401:
        return None, "Compass API rejected the key (401). Check RAPIDAPI_KEY in Space secrets."
    if resp.status_code == 429:
        return None, "Compass API rate limit hit. Try again shortly, or use Manual mode."
    if resp.status_code >= 400:
        return None, f"Compass API error {resp.status_code}: {resp.text[:300]}"

    try:
        payload = resp.json()
    except ValueError:
        return None, "Compass API returned non-JSON. Check provider response format."

    listing = normalize_compass_payload(payload)
    listing.listing_url = listing.listing_url or url
    if not listing.address and not listing.photo_urls and not listing.price:
        return None, "API responded but listing fields were empty. Try Manual mode or another URL."
    return listing, "Loaded listing from Compass API."
