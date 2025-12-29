#!/usr/bin/env bash
set -euo pipefail

# Run from frontend project root
FRONTEND_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_ROOT="$FRONTEND_ROOT/../nostalgia-backend"

DIST_DIR="$FRONTEND_ROOT/dist"
TARGET_DIR="$BACKEND_ROOT/static"

echo "Frontend: $FRONTEND_ROOT"
echo "Backend:  $BACKEND_ROOT"
echo "Building Vite..."
cd "$FRONTEND_ROOT"
npm run build

if [ ! -d "$DIST_DIR" ]; then
  echo "ERROR: dist folder not found at $DIST_DIR"
  exit 1
fi

echo "Copying dist -> $TARGET_DIR"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -R "$DIST_DIR"/. "$TARGET_DIR"/

echo "✅ Done. Frontend compiled output copied to: $TARGET_DIR"
