#!/usr/bin/env bash
# Downloads the Vosk small English model (~40 MB) for offline voice card entry.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/models"
ARCHIVE="$DEST/vosk-model-small-en-us.tar.gz"

mkdir -p "$DEST"

if [[ -f "$ARCHIVE" ]]; then
  echo "Model already present: $ARCHIVE"
  exit 0
fi

TMP="$DEST/.vosk-dl"
rm -rf "$TMP"
mkdir -p "$TMP"

echo "Downloading Vosk small English model..."
wget -q --show-progress -O "$TMP/model.zip" \
  "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"

echo "Packing model..."
unzip -q "$TMP/model.zip" -d "$TMP"
MODEL_DIR="$(find "$TMP" -maxdepth 1 -type d -name 'vosk-model*' | head -1)"
tar czf "$ARCHIVE" -C "$MODEL_DIR" .
rm -rf "$TMP"

echo "Done: $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"
