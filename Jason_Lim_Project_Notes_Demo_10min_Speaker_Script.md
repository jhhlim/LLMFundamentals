# Project Notes Demo — 10-Minute VC Pitch (Speaker Script)

**Files (repo root):**
- `Jason_Lim_Project_Notes_Demo_10min_VC_Pitch.pptx` — regenerated for Keynote/PowerPoint
- `Jason_Lim_Project_Notes_Demo_10min_VC_Pitch_Keynote.pptx` — same deck (Keynote-friendly copy)
- `Jason_Lim_Project_Notes_Demo_10min_VC_Pitch.html` — open in Safari if Keynote still fails (Print → PDF)

**Live demo:** https://jasonnlim-listing-brochure-studio-jason-realty.static.hf.space  
**Hub:** https://huggingface.co/spaces/jasonnlim/listing-brochure-studio-jason-realty  

Tone: **excited, confident, product-first.** You’re a Compass agent who shipped.

---

## Timing map (~10:00)

| Time | Slide | Move |
|------|-------|------|
| 0:00–0:45 | 1 Title | Hook hard — “brochure in seconds” |
| 0:45–1:45 | 2 Problem | Word/Canva chaos; you’re in the pain |
| 1:45–2:45 | 3 Product | URL → brochure → Edit → PDF |
| **2:45–5:30** | **4 Live HF demo** | **Screen-share Space (longest block)** |
| 5:30–6:15 | 5 Architecture | Fast stack overview |
| **6:15–7:15** | **6 LangSmith trajectory** | **Trace the run path** |
| 7:15–8:00 | 7 Why win | Agent distribution moat |
| **8:00–8:50** | **8 Expand project** | Near-term / Product / Scale |
| 8:50–9:20 | 9 What’s live | Proof, not vapor |
| 9:20–9:45 | 10 Ask | Partners, LangSmith, advisors |
| 9:45–10:00 | 11 Close | Q&A; invite LangSmith walkthrough |

---

## Demo checklist (Slide 4)

1. Hard-refresh HF Space.
2. Prefer **Compass URL + RapidAPI key**; if quota is tight → **Load Willow Glen demo**.
3. Scroll hero → gallery → **Google Map** → agent CTA.
4. Open **Edit brochure** (photos + facts).
5. **Print / PDF** → remind: enable **Background graphics**.
6. Mention notice: **Compass RapidAPI only** (Zillow/Redfin need their own APIs).

---

## LangSmith talking points (Slide 6)

Trajectory to draw on whiteboard or in LangSmith UI:

`Intake → Scrape (Compass) → Extract photos/facts → Compose brochure (+ LLM polish) → Human edit → Export PDF`

What you show / claim:

- Debug empty photo arrays and failed scrapes in the trace
- Compare demo vs live URL trajectories
- Eval loop when expanding to LangGraph multi-step copy agents

*If LangSmith isn’t wired live yet:* say “instrumentation plan — next sprint wires compose/LLM steps into LangSmith projects with `@traceable` / LangChain callbacks.”

---

## Expansion slide (Slide 8) — one clear story

1. **Near-term:** LangGraph + LangSmith traces, LLM polish, MLS batch  
2. **Product:** AI Estimate narrative, seller portal, team brand kits  
3. **Scale:** Official APIs, mobile capture packs, template marketplace  

Closer line: **“Brochure is the beachhead. Listing OS is the company.”**

---

## Contact

Jason Lim · Compass · DRE #02444964  
jason.lim@compass.com · (510) 480-7191 · https://www.jasonlimrealty.com
