---
title: Listing Brochure Studio
emoji: 🏠
colorFrom: blue
colorTo: green
sdk: gradio
sdk_version: 5.49.1
app_file: app.py
pinned: false
license: apache-2.0
short_description: Compass/manual listing → editable PDF brochure
tags:
  - real-estate
  - brochure
  - gradio
---

# Listing Brochure Studio

Generate a one-page PDF brochure from:

1. **Demo listing** (works immediately)
2. **Manual photos + facts**
3. **Compass listing URL** (optional — needs `RAPIDAPI_KEY` Space secret)

## Features

- Template styles: Modern / Luxury / Open House
- Editable headline, description, highlights, CTA, agent info
- Re-render edits without calling a model
- Optional LLM copy polish via Hugging Face Inference (`HF_TOKEN`)

## Space secrets

| Secret | Purpose |
|---|---|
| `RAPIDAPI_KEY` | Import Compass listing details via RapidAPI Compass Real Estate Data API |
| `RAPIDAPI_HOST` | Optional override (default `compass-com-real-estate-data-api.p.rapidapi.com`) |
| `HF_TOKEN` | Optional LLM polish for brochure copy |

## Notes

Compass does not publish a public consumer API. URL import uses a third-party RapidAPI provider when configured. Prefer Manual/Demo modes, or a licensed MLS/IDX feed for production use.
