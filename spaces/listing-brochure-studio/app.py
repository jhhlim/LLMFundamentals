from __future__ import annotations

from typing import Any

import gradio as gr
from PIL import Image

from utils.compass_client import compass_api_configured, fetch_compass_listing
from utils.copy_gen import local_copy, polish_with_llm
from utils.listing import (
    BRAND_ACCENT,
    BRAND_AGENT_NAME,
    BRAND_AGENT_PHONE,
    BRAND_BROKERAGE,
    BRAND_DRE,
    BRAND_SELL,
    BRAND_SITE,
    SAMPLE_LISTING,
    Listing,
)
from utils.render_brochure import collect_images, render_pdf

TEMPLATES = ["Modern", "Luxury", "Open House"]
TONES = ["warm modern", "luxury", "family-friendly", "concise"]

API_NOTE = (
    "Compass URL import: **enabled**."
    if compass_api_configured()
    else "Compass URL import: add Space secret `RAPIDAPI_KEY` (Demo + Manual work now)."
)

CSS = """
:root {
  --jl-ink: #0B1F33;
  --jl-accent: #1F6F78;
  --jl-soft: #E8F2F3;
}
.gradio-container {
  background: linear-gradient(160deg, #E8F2F3 0%, #F7FBFC 45%, #FFFFFF 100%) !important;
}
.main-title h1 {
  font-size: 1.85rem !important;
  color: #0B1F33 !important;
  letter-spacing: -0.02em;
}
.brand-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 0 0.25rem;
}
.status-box textarea { font-size: 0.95rem !important; }
"""


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
        listing.dre,
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
    dre,
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
        agent_name=agent_name or base.agent_name or BRAND_AGENT_NAME,
        agent_phone=agent_phone or base.agent_phone or BRAND_AGENT_PHONE,
        agent_email=agent_email or base.agent_email,
        brokerage=brokerage or base.brokerage or BRAND_BROKERAGE,
        dre=dre or base.dre or BRAND_DRE,
        listing_url=listing_url or base.listing_url,
        photo_urls=photo_urls or base.photo_urls,
        cta=cta or base.cta,
        accent_color=accent_color or base.accent_color or BRAND_ACCENT,
    )


def load_demo():
    listing = local_copy(SAMPLE_LISTING)
    status = "Loaded Willow Glen demo. Generate a brochure, edit copy, then re-render."
    return (*_listing_to_form(listing), status)


def import_compass(url: str):
    listing, status = fetch_compass_listing(url)
    if listing is None:
        return (*_listing_to_form(Listing()), status)
    # Keep Jason Lim branding on marketing materials by default.
    listing.agent_name = BRAND_AGENT_NAME
    listing.agent_phone = BRAND_AGENT_PHONE
    listing.brokerage = BRAND_BROKERAGE
    listing.dre = BRAND_DRE
    listing.accent_color = BRAND_ACCENT
    if not listing.cta:
        listing.cta = "Schedule a private showing with Jason Lim"
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
    dre,
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
        dre,
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
        images = [Image.new("RGB", (1600, 1000), color=(232, 242, 243))]

    pdf_path = render_pdf(listing, images, template_name=template_name)
    preview = images[0]
    status = (
        f"{copy_status} Brochure rendered ({template_name}). "
        "Edit fields and click Apply edits to re-render."
    )
    form = _listing_to_form(listing)
    return (*form[:-1], form[-1], status, preview, pdf_path)


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
    dre,
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
        dre,
        listing_url,
        accent_color,
        photo_urls_text,
        listing_state,
    )
    images = collect_images(uploads, listing.photo_urls, max_images=4)
    if not images:
        images = [Image.new("RGB", (1600, 1000), color=(232, 242, 243))]
    pdf_path = render_pdf(listing, images, template_name=template_name)
    return listing.to_dict(), "Edits applied — brochure re-rendered (no model call).", images[0], pdf_path


def estimate_placeholder(address: str, beds: str, baths: str, sqft: str, timeline: str):
    addr = address.strip() or "your Silicon Valley home"
    return (
        f"### Coming soon — AI estimate for {addr}\n\n"
        f"**Planned range preview:** confidence bands will appear here after the MLS adapter ships.\n\n"
        f"- Beds / baths / sqft captured: {beds or '—'} / {baths or '—'} / {sqft or '—'}\n"
        f"- Timeline: {timeline or 'flexible'}\n\n"
        "#### Planned stack\n"
        "1. Comps retrieval via MLS adapter\n"
        "2. Feature embeddings\n"
        "3. LLM narrative with confidence bands\n\n"
        "#### What you'll get\n"
        "- Instant range with confidence interval\n"
        "- Explainable comps and adjustments\n"
        "- CRM lead sync on request\n\n"
        f"Meanwhile, request a personalized CMA on the sell page: [{BRAND_SELL}]({BRAND_SELL})"
    )


with gr.Blocks(title="Jason Lim · Listing Brochure Studio", css=CSS) as demo:
    gr.Markdown(
        f"# Jason Lim · Listing Brochure Studio\n"
        f"**Compass · {BRAND_DRE} · {BRAND_AGENT_PHONE}**  \n"
        f"Turn a Compass listing link (or photos + facts) into an editable one-page PDF brochure.  \n"
        f"[Website]({BRAND_SITE}) · [Sell / valuation]({BRAND_SELL})  \n"
        f"*{API_NOTE}*",
        elem_classes=["main-title"],
    )

    with gr.Tabs():
        with gr.Tab("Brochure Studio"):
            listing_state = gr.State({})

            with gr.Row():
                with gr.Column(scale=5):
                    with gr.Group():
                        compass_url = gr.Textbox(
                            label="Compass listing URL",
                            placeholder="https://www.compass.com/homedetails/...",
                            info="Use a full homedetails URL for best results.",
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
                        use_llm = gr.Checkbox(
                            label="Polish copy with HF Inference (needs HF_TOKEN)",
                            value=False,
                        )
                        accent_color = gr.ColorPicker(label="Accent color", value=BRAND_ACCENT)

                    with gr.Accordion("Listing facts", open=True):
                        address = gr.Textbox(label="Street address")
                        with gr.Row():
                            city = gr.Textbox(label="City")
                            state = gr.Textbox(label="State", value="CA")
                            zip_code = gr.Textbox(label="ZIP")
                        with gr.Row():
                            price = gr.Textbox(label="Price")
                            beds = gr.Textbox(label="Beds")
                            baths = gr.Textbox(label="Baths")
                            sqft = gr.Textbox(label="Sq Ft")
                        with gr.Row():
                            property_type = gr.Textbox(label="Property type", value="Single Family")
                            neighborhood = gr.Textbox(label="Neighborhood")
                        listing_url = gr.Textbox(label="Listing / site URL", value=BRAND_SITE)

                    with gr.Accordion("Brochure copy (editable)", open=True):
                        headline = gr.Textbox(label="Headline")
                        description = gr.Textbox(label="Description", lines=4)
                        bullets_text = gr.Textbox(label="Highlights (one per line)", lines=4)
                        cta = gr.Textbox(label="Call to action", value="Schedule a private showing with Jason Lim")

                    with gr.Accordion("Agent / branding", open=False):
                        agent_name = gr.Textbox(label="Agent name", value=BRAND_AGENT_NAME)
                        agent_phone = gr.Textbox(label="Agent phone", value=BRAND_AGENT_PHONE)
                        agent_email = gr.Textbox(label="Agent email")
                        brokerage = gr.Textbox(label="Brokerage", value=BRAND_BROKERAGE)
                        dre = gr.Textbox(label="License", value=BRAND_DRE)

                    with gr.Row():
                        generate_btn = gr.Button("Generate brochure", variant="primary")
                        edit_btn = gr.Button("Apply edits & re-render", variant="secondary")

                with gr.Column(scale=4):
                    status = gr.Textbox(label="Status", lines=3, elem_classes=["status-box"])
                    preview = gr.Image(label="Hero preview", height=320)
                    pdf_out = gr.File(label="Download PDF brochure")
                    gr.Markdown(
                        "### Tips\n"
                        "- Start with **Load Demo Listing**, or paste a Compass **homedetails** URL.\n"
                        "- After generate, edit headline/bullets/CTA → **Apply edits**.\n"
                        "- Embed this Space on your site with an iframe (see Embed tab)."
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
                dre,
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

        with gr.Tab("AI Estimate (Coming Soon)"):
            gr.Markdown(
                "## Coming soon — AI estimate engine\n"
                "This tab is designed to power the **Coming soon** block on "
                f"[your sell page]({BRAND_SELL}).\n\n"
                "**Planned stack:** comps retrieval via MLS adapter → feature embeddings → "
                "LLM narrative with confidence bands.\n\n"
                "- Instant range with confidence interval\n"
                "- Explainable comps and adjustments\n"
                "- CRM lead sync on request"
            )
            with gr.Row():
                est_address = gr.Textbox(label="Property address", placeholder="San Jose, CA address")
                est_timeline = gr.Dropdown(
                    ["0–3 months", "3–6 months", "6–12 months", "flexible"],
                    value="3–6 months",
                    label="Sell timeline",
                )
            with gr.Row():
                est_beds = gr.Textbox(label="Beds", value="3")
                est_baths = gr.Textbox(label="Baths", value="2")
                est_sqft = gr.Textbox(label="Sq Ft", value="1800")
            est_btn = gr.Button("Preview estimate placeholder", variant="primary")
            est_out = gr.Markdown()
            est_btn.click(
                fn=estimate_placeholder,
                inputs=[est_address, est_beds, est_baths, est_sqft, est_timeline],
                outputs=[est_out],
            )
            gr.Markdown(
                f"For a live CMA today, use **Request Home Valuation** on [{BRAND_SELL}]({BRAND_SELL})."
            )

        with gr.Tab("Embed on website"):
            gr.Markdown(
                "## Host this on your Vercel site\n"
                "Add an iframe on `/sell` (or a dedicated `/tools/brochure` page):\n\n"
                "```html\n"
                '<iframe\n'
                '  src="https://jasonnlim-listing-brochure-studio-jason-realty.hf.space"\n'
                '  style="width:100%; height:900px; border:0; border-radius:12px;"\n'
                '  title="Jason Lim Listing Brochure Studio"\n'
                "></iframe>\n"
                "```\n\n"
                "For the AI estimate block, either:\n"
                "1. Link the Coming Soon CTA to this Space's **AI Estimate** tab, or\n"
                "2. Later swap the iframe `src` to a dedicated estimate Space once the MLS adapter is live."
            )


if __name__ == "__main__":
    demo.queue().launch()
