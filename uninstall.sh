#!/usr/bin/env bash
# ──────────────────────────────────────────────
# oh-my-slides uninstaller for Claude Code
# ──────────────────────────────────────────────
set -euo pipefail

PLUGIN_NAME="oh-my-slides"
MARKETPLACE_NAME="oh-my-slides-local"
CLAUDE_DIR="${HOME}/.claude"
MARKETPLACE_DIR="${CLAUDE_DIR}/plugins/marketplaces/${MARKETPLACE_NAME}"
SETTINGS_FILE="${CLAUDE_DIR}/settings.json"

echo "🗑  Uninstalling oh-my-slides plugin..."

# Remove from settings.json
if [ -f "${SETTINGS_FILE}" ]; then
  node -e "
  const fs = require('fs');
  const f = '${SETTINGS_FILE}';
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (d.enabledPlugins) delete d.enabledPlugins['${PLUGIN_NAME}@${MARKETPLACE_NAME}'];
  if (d.extraKnownMarketplaces) delete d.extraKnownMarketplaces['${MARKETPLACE_NAME}'];
  fs.writeFileSync(f, JSON.stringify(d, null, 2));
  "
  echo "   ✓ Plugin disabled"
fi

# Remove from installed_plugins.json
INSTALLED_FILE="${CLAUDE_DIR}/plugins/installed_plugins.json"
if [ -f "${INSTALLED_FILE}" ]; then
  node -e "
  const fs = require('fs');
  const f = '${INSTALLED_FILE}';
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (d.plugins) delete d.plugins['${PLUGIN_NAME}@${MARKETPLACE_NAME}'];
  fs.writeFileSync(f, JSON.stringify(d, null, 2));
  "
  echo "   ✓ Plugin unregistered"
fi

# Remove from known_marketplaces.json
KNOWN_FILE="${CLAUDE_DIR}/plugins/known_marketplaces.json"
if [ -f "${KNOWN_FILE}" ]; then
  node -e "
  const fs = require('fs');
  const f = '${KNOWN_FILE}';
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  delete d['${MARKETPLACE_NAME}'];
  fs.writeFileSync(f, JSON.stringify(d, null, 2));
  "
  echo "   ✓ Marketplace removed"
fi

# Remove marketplace directory (symlink, not source)
if [ -d "${MARKETPLACE_DIR}" ]; then
  rm -rf "${MARKETPLACE_DIR}"
  echo "   ✓ Marketplace directory cleaned"
fi

echo ""
echo "✅ Uninstalled. Restart Claude Code to apply."
echo "   Your source files remain untouched."
