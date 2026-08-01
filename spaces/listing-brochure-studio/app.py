from __future__ import annotations

import json
from typing import Any

import gradio as gr
from PIL import Image

from utils.compass_client import compass_api_configured, fetch_compass_listing
from utils.copy_gen import local_copy, polish_with_llm
from utils.listing import SAMPLE_LISTING, Listing
from utils.render_brochure import collect_images, render_pdf

TEMPLATES = ["Modern", "Luxury", "Open House"]
TONES = ["warm modern", "luxury", "family-friendly", "concise"]


def _listing_to_form(listing: Listing) -> tuple:
    return (
        listing.address,
        listing.city,
        listing.state,
        listing.zip_code,
        listing.price,
        listing.beds,
        listing.baths,
        listing.sqft,
        listing.property_type,
        listing.neighborhood,
        listing.description,
        listing.headline,
        "\n".join(listing.bullets or []),
        listing.cta,
        listing.agent_name,
        listing.agent_phone,
        listing.agent_email,
        listing.brokerage,
        listing.listing_url,
        listing.accent_color,
        "\n".join(listing.photo_urls or []),
        listing.to_dict(),
    )


def _form_to_listing(
    address,
    city,
    state,
    zip_code,
    price,
    beds,
    baths,
    sqft,
    property_type,
    neighborhood,
    description,
    headline,
    bullets_text,
    cta,
    agent_name,
    agent_phone,
    agent_email,
    brokerage,
    listing_url,
    accent_color,
    photo_urls_text,
    listing_state: dict[str, Any] | None,
) -> Listing:
    base = Listing.from_dict(listing_state)
    bullets = [b.strip("-• ").strip() for b in (bullets_text or "").splitlines() if b.strip()]
    photo_urls = [u.strip() for u in (photo_urls_text or "").splitlines() if u.strip()]
    return Listing(
        address=address or base.address,
        city=city or base.city,
        state=state or base.state,
        zip_code=zip_code or base.zip_code,
        price=price or base.price,
        beds=str(beds or base.beds or ""),
        baths=str(baths or base.baths or ""),
        sqft=str(sqft or base.sqft or ""),
        property_type=property_type or base.property_type,
        neighborhood=neighborhood or base.neighborhood,
        description=description or base.description,
        headline=headline or base.headline,
        bullets=bullets or base.bullets,
        amenities=base.amenities,
        agent_name=agent_name or base.agent_name,
        agent_phone=agent_phone or base.agent_phone,
        agent_email=agent_email or base.agent_email,
        brokerage=brokerage or base.brokerage,
        listing_url=listing_url or base.listing_url,
        photo_urls=photo_urls or base.photo_urls,
        cta=cta or base.cta,
        accent_color=accent_color or base.accent_color,
    )


def load_demo():
    listing = local_copy(SAMPLE_LISTING)
    status = "Loaded demo listing. Generate a brochure, then tweak any field and re-render."
    return (*_listing_to_form(listing), status)


def import_compass(url: str):
    listing, status = fetch_compass_listing(url)
    if listing is None:
        empty = Listing()
        return (*_listing_to_form(empty), status)
    listing = local_copy(listing)
    return (*_listing_to_form(listing), status)


def generate_brochure(
    address,
    city,
    state,
    zip_code,
    price,
    beds,
    baths,
    sqft,
    property_type,
    neighborhood,
    description,
    headline,
    bullets_text,
    cta,
    agent_name,
    agent_phone,
    agent_email,
    brokerage,
    listing_url,
    accent_color,
    photo_urls_text,
    listing_state,
    uploads,
    template_name,
    tone,
    use_llm,
):
    listing = _form_to_listing(
        address,
        city,
        state,
        zip_code,
        price,
        beds,
        baths,
        sqft,
        property_type,
        neighborhood,
        description,
        headline,
        bullets_text,
        cta,
        agent_name,
        agent_phone,
        agent_email,
        brokerage,
        listing_url,
        accent_color,
        photo_urls_text,
        listing_state,
    )

    if use_llm:
        listing, copy_status = polish_with_llm(listing, tone=tone)
    else:
        listing = local_copy(listing, tone=tone)
        copy_status = "Local copy writer applied."

    images = collect_images(uploads, listing.photo_urls, max_images=4)
    if not images:
        # Keep brochure usable even without photos.
        images = [Image.new("RGB", (1600, 1000), color=(214, 209, 198))]

    pdf_path = render_pdf(listing, images, template_name=template_name)
    preview = images[0]
    status = f"{copy_status} Brochure rendered ({template_name}). Edit fields below and click Apply edits to re-render."
    form = _listing_to_form(listing)
    # form ends with listing_state; keep status + preview + pdf after form fields excluding state reuse
    return (
        *form[:-1],
        form[-1],
        status,
        preview,
        pdf_path,
    )


def apply_edits(
    address,
    city,
    state,
    zip_code,
    price,
    beds,
    baths,
    sqft,
    property_type,
    neighborhood,
    description,
    headline,
    bullets_text,
    cta,
    agent_name,
    agent_phone,
    agent_email,
    brokerage,
    listing_url,
    accent_color,
    photo_urls_text,
    listing_state,
    uploads,
    template_name,
):
    listing = _form_to_listing(
        address,
        city,
        state,
        zip_code,
        price,
        beds,
        baths,
        sqft,
        property_type,
        neighborhood,
        description,
        headline,
        bullets_text,
        cta,
        agent_name,
        agent_phone,
        agent_email,
        brokerage,
        listing_url,
        accent_color,
        photo_urls_text,
        listing_state,
    )
    images = collect_images(uploads, listing.photo_urls, max_images=4)
    if not images:
        images = [Image.new("RGB", (1600, 1000), color=(214, 209, 198))]
    pdf_path = render_pdf(listing, images, template_name=template_name)
    status = "Edits applied — brochure re-rendered (no model call)."
    return listing.to_dict(), status, images[0], pdf_path


API_NOTE = (
    "Compass URL import: **enabled** (RAPIDAPI_KEY found)."
    if compass_api_configured()
    else "Compass URL import: **needs RAPIDAPI_KEY** Space secret. Demo + Manual modes work now."
)


CSS = """
.main-title h1 { font-size: 1.9rem !important; letter-spacing: -0.02em; }
.status-box textarea { font-size: 0.95rem !important; }
"""


with gr.Blocks(title="Listing Brochure Studio") as demo:
    gr.Markdown(
        "# Listing Brochure Studio\n"
        "Turn a Compass listing link (or photos + facts) into an editable one-page PDF brochure.\n\n"
        f"*{API_NOTE}*",
        elem_classes=["main-title"],
    )

    listing_state = gr.State({})

    with gr.Row():
        with gr.Column(scale=5):
            with gr.Group():
                compass_url = gr.Textbox(
                    label="Compass listing URL",
                    placeholder="https://www.compass.com/listing/...",
                )
                with gr.Row():
                    import_btn = gr.Button("Import from Compass", variant="secondary")
                    demo_btn = gr.Button("Load Demo Listing", variant="primary")

            uploads = gr.File(
                label="Or upload listing photos",
                file_count="multiple",
                file_types=["image"],
                type="filepath",
            )
            photo_urls_text = gr.Textbox(
                label="Photo URLs (one per line)",
                lines=3,
                placeholder="https://...",
            )

            with gr.Row():
                template_name = gr.Dropdown(TEMPLATES, value="Modern", label="Template")
                tone = gr.Dropdown(TONES, value="warm modern", label="Copy tone")
                use_llm = gr.Checkbox(label="Polish copy with HF Inference (needs HF_TOKEN)", value=False)
                accent_color = gr.ColorPicker(label="Accent color", value="#1F4E5F")

            with gr.Accordion("Listing facts", open=True):
                address = gr.Textbox(label="Street address")
                with gr.Row():
                    city = gr.Textbox(label="City")
                    state = gr.Textbox(label="State")
                    zip_code = gr.Textbox(label="ZIP")
                with gr.Row():
                    price = gr.Textbox(label="Price")
                    beds = gr.Textbox(label="Beds")
                    baths = gr.Textbox(label="Baths")
                    sqft = gr.Textbox(label="Sq Ft")
                with gr.Row():
                    property_type = gr.Textbox(label="Property type", value="Single Family")
                    neighborhood = gr.Textbox(label="Neighborhood")
                listing_url = gr.Textbox(label="Listing URL")

            with gr.Accordion("Brochure copy (editable)", open=True):
                headline = gr.Textbox(label="Headline")
                description = gr.Textbox(label="Description", lines=4)
                bullets_text = gr.Textbox(label="Highlights (one per line)", lines=4)
                cta = gr.Textbox(label="Call to action")

            with gr.Accordion("Agent / branding", open=False):
                agent_name = gr.Textbox(label="Agent name")
                agent_phone = gr.Textbox(label="Agent phone")
                agent_email = gr.Textbox(label="Agent email")
                brokerage = gr.Textbox(label="Brokerage", value="Compass")

            with gr.Row():
                generate_btn = gr.Button("Generate brochure", variant="primary")
                edit_btn = gr.Button("Apply edits & re-render", variant="secondary")

        with gr.Column(scale=4):
            status = gr.Textbox(label="Status", lines=3, elem_classes=["status-box"])
            preview = gr.Image(label="Hero preview", height=320)
            pdf_out = gr.File(label="Download PDF brochure")
            gr.Markdown(
                "### Tips\n"
                "- Start with **Load Demo Listing** to see the full loop.\n"
                "- After generate, edit headline/bullets/CTA and hit **Apply edits**.\n"
                "- For live Compass imports, add Space secret `RAPIDAPI_KEY` "
                "(RapidAPI Compass Real Estate Data API).\n"
                "- Optional: `HF_TOKEN` for LLM copy polish."
            )

    form_fields = [
        address,
        city,
        state,
        zip_code,
        price,
        beds,
        baths,
        sqft,
        property_type,
        neighborhood,
        description,
        headline,
        bullets_text,
        cta,
        agent_name,
        agent_phone,
        agent_email,
        brokerage,
        listing_url,
        accent_color,
        photo_urls_text,
        listing_state,
    ]

    demo_btn.click(fn=load_demo, outputs=[*form_fields, status])
    import_btn.click(fn=import_compass, inputs=[compass_url], outputs=[*form_fields, status])

    generate_btn.click(
        fn=generate_brochure,
        inputs=[*form_fields, uploads, template_name, tone, use_llm],
        outputs=[*form_fields, status, preview, pdf_out],
    )
    edit_btn.click(
        fn=apply_edits,
        inputs=[*form_fields, uploads, template_name],
        outputs=[listing_state, status, preview, pdf_out],
    )

if __name__ == "__main__":
    demo.queue().launch()
