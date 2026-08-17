#!/usr/bin/env bash
# Requires Hugging Face Pro (Gradio Spaces are paid on free accounts as of 2026).
# Usage: HF_TOKEN=... ./deploy_gradio_when_pro.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
SPACE_ID="${SPACE_ID:-jasonnlim/listing-brochure-studio-jason-realty}"

hf repos create "$SPACE_ID" --type space --sdk gradio --public --exist-ok || true
hf upload "$SPACE_ID" "$ROOT" . --repo-type space \
  --commit-message "Deploy Gradio Listing Brochure Studio" \
  --exclude "static/**" --exclude "deploy_gradio_when_pro.sh"

if [[ -n "${RAPIDAPI_KEY:-}" ]]; then
  hf spaces secret add "$SPACE_ID" RAPIDAPI_KEY="$RAPIDAPI_KEY"
fi
if [[ -n "${HF_TOKEN:-}" ]]; then
  hf spaces secret add "$SPACE_ID" HF_TOKEN="$HF_TOKEN"
fi

echo "Space: https://huggingface.co/spaces/${SPACE_ID}"
