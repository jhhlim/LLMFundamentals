from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


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
    agent_name: str = ""
    agent_phone: str = ""
    agent_email: str = ""
    brokerage: str = "Compass"
    listing_url: str = ""
    photo_urls: list[str] = field(default_factory=list)
    cta: str = "Schedule a private showing"
    accent_color: str = "#1F4E5F"

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
    address="2147 Maple Grove Lane",
    city="Austin",
    state="TX",
    zip_code="78703",
    price="$1,285,000",
    beds="4",
    baths="3.5",
    sqft="2,840",
    property_type="Single Family",
    neighborhood="Tarrytown",
    description=(
        "Light-filled modern home on a quiet tree-lined street. Open living spaces, "
        "chef's kitchen, and a private backyard oasis perfect for entertaining."
    ),
    headline="Modern Living in Tarrytown",
    bullets=[
        "Open-concept living with floor-to-ceiling windows",
        "Chef's kitchen with quartz counters and island seating",
        "Primary suite with spa bath and walk-in closet",
        "Landscaped backyard with covered patio",
    ],
    amenities=["Hardwood floors", "Two-car garage", "Smart home wiring", "EV charger ready"],
    agent_name="Alex Rivera",
    agent_phone="(512) 555-0142",
    agent_email="alex.rivera@example.com",
    brokerage="Compass",
    listing_url="https://www.compass.com/",
    photo_urls=[
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
    ],
    cta="Book your private tour this weekend",
    accent_color="#1F4E5F",
)
