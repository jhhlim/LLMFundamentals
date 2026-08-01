from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any

# Brand defaults aligned with https://www.jasonlimrealty.com
BRAND_AGENT_NAME = "Jason Lim"
BRAND_AGENT_PHONE = "(510) 480-7191"
BRAND_AGENT_EMAIL = ""
BRAND_BROKERAGE = "Compass"
BRAND_DRE = "DRE #02444964"
BRAND_ACCENT = "#1F6F78"
BRAND_INK = "#0B1F33"
BRAND_SOFT = "#E8F2F3"
BRAND_SITE = "https://www.jasonlimrealty.com"
BRAND_SELL = "https://www.jasonlimrealty.com/sell"


@dataclass
class Listing:
    address: str = ""
    city: str = ""
    state: str = ""
    zip_code: str = ""
    price: str = ""
    beds: str = ""
    baths: str = ""
    sqft: str = ""
    property_type: str = "Single Family"
    neighborhood: str = ""
    description: str = ""
    headline: str = ""
    bullets: list[str] = field(default_factory=list)
    amenities: list[str] = field(default_factory=list)
    agent_name: str = BRAND_AGENT_NAME
    agent_phone: str = BRAND_AGENT_PHONE
    agent_email: str = BRAND_AGENT_EMAIL
    brokerage: str = BRAND_BROKERAGE
    dre: str = BRAND_DRE
    listing_url: str = ""
    photo_urls: list[str] = field(default_factory=list)
    cta: str = "Schedule a private showing"
    accent_color: str = BRAND_ACCENT

    def full_address(self) -> str:
        parts = [self.address, self.city, self.state, self.zip_code]
        return ", ".join(p for p in parts if p)

    def facts_line(self) -> str:
        bits = []
        if self.beds:
            bits.append(f"{self.beds} Beds")
        if self.baths:
            bits.append(f"{self.baths} Baths")
        if self.sqft:
            bits.append(f"{self.sqft} Sq Ft")
        if self.property_type:
            bits.append(self.property_type)
        return "  ·  ".join(bits)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> "Listing":
        if not data:
            return cls()
        known = {f.name for f in cls.__dataclass_fields__.values()}  # type: ignore[attr-defined]
        cleaned = {k: v for k, v in data.items() if k in known}
        return cls(**cleaned)


SAMPLE_LISTING = Listing(
    address="1287 Willow Glen Way",
    city="San Jose",
    state="CA",
    zip_code="95125",
    price="$1,895,000",
    beds="4",
    baths="3",
    sqft="2,450",
    property_type="Single Family",
    neighborhood="Willow Glen",
    description=(
        "Light-filled Willow Glen home with an open living plan, chef-ready kitchen, "
        "and a private backyard suited for Silicon Valley entertaining. Thoughtful "
        "updates throughout keep the classic neighborhood feel while delivering modern comfort."
    ),
    headline="Modern living in Willow Glen",
    bullets=[
        "Open-concept living with abundant natural light",
        "Chef's kitchen with island seating and quartz surfaces",
        "Primary suite with spa bath and walk-in closet",
        "Landscaped backyard with covered patio",
    ],
    amenities=["Hardwood floors", "Two-car garage", "EV charger ready", "Smart home wiring"],
    agent_name=BRAND_AGENT_NAME,
    agent_phone=BRAND_AGENT_PHONE,
    brokerage=BRAND_BROKERAGE,
    dre=BRAND_DRE,
    listing_url=BRAND_SITE,
    photo_urls=[
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600",
    ],
    cta="Book a private tour with Jason Lim",
    accent_color=BRAND_ACCENT,
)
