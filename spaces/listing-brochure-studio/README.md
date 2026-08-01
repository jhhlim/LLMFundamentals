---
title: Jason Lim Listing Brochure Studio
emoji: 🏠
colorFrom: blue
colorTo: green
sdk: gradio
sdk_version: 5.49.1
app_file: app.py
pinned: false
license: apache-2.0
short_description: Compass listing → branded editable PDF brochure
tags:
  - real-estate
  - brochure
  - compass
  - gradio
---

# Jason Lim · Listing Brochure Studio

Compass · DRE #02444964 · [(510) 480-7191](tel:5104807191)

Generate a branded one-page PDF brochure from:

1. **Demo listing** (works immediately)
2. **Manual photos + facts**
3. **Compass listing URL** (`homedetails/...` via RapidAPI)

Also includes an **AI Estimate (Coming Soon)** tab aligned with
[www.jasonlimrealty.com/sell](https://www.jasonlimrealty.com/sell).

## Space secrets

| Secret | Purpose |
|---|---|
| `RAPIDAPI_KEY` | Compass property import |
| `RAPIDAPI_HOST` | Optional (default `compass-com-real-estate-data-api.p.rapidapi.com`) |
| `HF_TOKEN` | Optional LLM copy polish |

## Brand

Accent `#1F6F78`, ink `#0B1F33`, soft `#E8F2F3` — matched to Jason Lim's Compass site.
