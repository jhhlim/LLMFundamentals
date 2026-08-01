from __future__ import annotations

import os
import re
from typing import Any

import requests

from .listing import Listing

RAPIDAPI_HOST = os.getenv(
    "RAPIDAPI_HOST", "compass-com-real-estate-data-api.p.rapidapi.com"
)
PROPERTY_PATH = os.getenv("COMPASS_PROPERTY_PATH", "/compass/property")
SEARCH_PATH = os.getenv("COMPASS_SEARCH_PATH", "/compass/search")


def _rapidapi_key() -> str | None:
    return os.getenv("RAPIDAPI_KEY") or os.getenv("COMPASS_API_KEY")


def is_compass_url(url: str) -> bool:
    return bool(url) and "compass.com" in url.lower()


def compass_api_configured() -> bool:
    return bool(_rapidapi_key())


def _headers() -> dict[str, str]:
    return {
        "x-rapidapi-key": _rapidapi_key() or "",
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/json",
    }


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


def _as_str_list(value: Any) -> list[str]:
    if not value:
        return []
    if isinstance(value, list):
        out: list[str] = []
        for item in value:
            if isinstance(item, str) and item.strip():
                out.append(item.strip())
            elif isinstance(item, dict):
                for key in ("url", "href", "src", "name", "title", "text"):
                    if item.get(key):
                        out.append(str(item[key]))
                        break
        return out
    if isinstance(value, str):
        return [v.strip() for v in re.split(r"[\n|;]", value) if v.strip()]
    return [str(value)]


def normalize_compass_payload(payload: dict[str, Any]) -> Listing:
    data = payload.get("data") if isinstance(payload.get("data"), dict) else payload
    if isinstance(data.get("property"), dict):
        data = data["property"]

    photos = _as_str_list(data.get("photos")) or _as_str_list(data.get("image_url"))
    amenities = _as_str_list(data.get("amenities"))
    agents = data.get("agents") or []
    agent = agents[0] if isinstance(agents, list) and agents else {}
    if not isinstance(agent, dict):
        agent = {}

    street = str(data.get("street_address") or data.get("address") or data.get("name") or "")
    city = str(data.get("city") or "")
    state = str(data.get("state") or "")
    zip_code = str(data.get("zip_code") or data.get("zip") or "")
    neighborhood = str(data.get("neighborhood") or "")
    description = str(data.get("description") or "")
    price = _format_price(data.get("price"))
    beds = data.get("beds")
    baths = data.get("baths")
    sqft = data.get("sqft")
    property_type = str(data.get("property_type") or "Single Family")

    bullets = amenities[:4]
    if description and not bullets:
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", description) if s.strip()]
        bullets = sentences[:4]

    place = neighborhood or city or "this neighborhood"
    return Listing(
        address=street,
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
        headline=f"Welcome to {place}",
        bullets=bullets,
        amenities=amenities[:10],
        agent_name=str(agent.get("name") or ""),
        agent_phone=str(agent.get("phone") or ""),
        agent_email=str(agent.get("email") or ""),
        brokerage=str(agent.get("company") or "Compass"),
        listing_url=str(data.get("url") or ""),
        photo_urls=photos[:12],
        cta="Schedule a private showing with Jason Lim",
        accent_color="#1F6F78",
    )


def fetch_compass_listing(url: str) -> tuple[Listing | None, str]:
    url = (url or "").strip()
    if not url:
        return None, "Paste a Compass listing URL (homedetails/…), or use Manual / Demo mode."
    if not is_compass_url(url):
        return None, "URL should be a compass.com listing link."

    if not _rapidapi_key():
        return None, (
            "Compass URL import needs Space secret RAPIDAPI_KEY. "
            "Use Manual entry or Load Demo for now."
        )

    endpoint = f"https://{RAPIDAPI_HOST}{PROPERTY_PATH}"
    try:
        resp = requests.get(endpoint, headers=_headers(), params={"url": url}, timeout=60)
    except requests.RequestException as exc:
        return None, f"Compass API request failed: {exc}"

    if resp.status_code == 401:
        return None, "Compass API rejected the key (401). Check RAPIDAPI_KEY."
    if resp.status_code == 429:
        return None, "Compass API rate limit hit. Try again shortly, or use Manual mode."
    if resp.status_code >= 400:
        return None, f"Compass API error {resp.status_code}: {resp.text[:300]}"

    try:
        payload = resp.json()
    except ValueError:
        return None, "Compass API returned non-JSON."

    if payload.get("success") is False:
        return None, f"Compass API: {payload.get('error') or 'request failed'}"

    listing = normalize_compass_payload(payload)
    listing.listing_url = listing.listing_url or url
    if not listing.address and not listing.photo_urls and not listing.price:
        return None, "API responded but listing fields were empty. Try another URL or Manual mode."
    return listing, "Loaded listing from Compass."


def search_compass_listings(
    location: str,
    listing_type: str = "for_sale",
    beds: str | int | None = None,
    min_price: str | int | None = None,
    max_price: str | int | None = None,
) -> tuple[list[dict[str, Any]], str]:
    if not _rapidapi_key():
        return [], "Search needs RAPIDAPI_KEY Space secret."
    location = (location or "").strip()
    if not location:
        return [], "Enter a city or neighborhood to search."

    params: dict[str, Any] = {"location": location, "listing_type": listing_type or "for_sale", "page": 1}
    if beds:
        params["beds"] = beds
    if min_price:
        params["min_price"] = min_price
    if max_price:
        params["max_price"] = max_price

    endpoint = f"https://{RAPIDAPI_HOST}{SEARCH_PATH}"
    try:
        resp = requests.get(endpoint, headers=_headers(), params=params, timeout=60)
        payload = resp.json()
    except Exception as exc:  # noqa: BLE001
        return [], f"Search failed: {exc}"

    if resp.status_code >= 400:
        return [], f"Search error {resp.status_code}: {resp.text[:200]}"

    data = payload.get("data") if isinstance(payload, dict) else None
    results = (data or {}).get("results") if isinstance(data, dict) else []
    if not results:
        return [], "No search results returned (API may be sparse). Paste a Compass homedetails URL instead."
    return results, f"Found {len(results)} listings."
