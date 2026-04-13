#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${ROOT_DIR}"

REQUIRED_NODE_MAJOR=18
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"

if [ "${NODE_MAJOR}" -lt "${REQUIRED_NODE_MAJOR}" ]; then
  echo "❌ Node.js version is too old: $(node -v)"
  echo "   Please use Node.js >= ${REQUIRED_NODE_MAJOR} (recommended: 20+)."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "📦 node_modules not found, installing dependencies with npm ci..."
  npm ci
else
  echo "📦 Reusing existing node_modules (skip npm install)."
fi

echo "🛠️ Building extension for Chrome..."
npm run build

echo "✅ Chrome build completed!"
echo "👉 Load the 'build' folder in Chrome (Extensions -> Load unpacked)."
