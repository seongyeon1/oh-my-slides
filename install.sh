#!/usr/bin/env bash
# ──────────────────────────────────────────────
# oh-my-slides installer for Claude Code
# ──────────────────────────────────────────────
set -euo pipefail

PLUGIN_NAME="oh-my-slides"
MARKETPLACE_NAME="oh-my-slides-local"
CLAUDE_DIR="${HOME}/.claude"
MARKETPLACE_DIR="${CLAUDE_DIR}/plugins/marketplaces/${MARKETPLACE_NAME}"
SETTINGS_FILE="${CLAUDE_DIR}/settings.json"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔧 Installing oh-my-slides plugin for Claude Code..."
echo ""

# ── 1. Check prerequisites ──
check_deps() {
  local missing=()
  command -v node >/dev/null 2>&1 || missing+=("node")
  if [ ${#missing[@]} -gt 0 ]; then
    echo "❌ Missing: ${missing[*]}"
    echo "   Install Node.js 18+ first: https://nodejs.org"
    exit 1
  fi
}
check_deps

# ── 2. Install npm dependencies ──
echo "📦 Installing npm dependencies..."
cd "${SCRIPT_DIR}"
if [ ! -f package.json ]; then
  npm init -y --silent >/dev/null 2>&1
fi
npm install --save playwright pptxgenjs sharp 2>/dev/null
npx playwright install chromium 2>/dev/null
echo "   ✓ Dependencies installed"

# ── 3. Create marketplace directory structure ──
echo "📁 Setting up Claude Code plugin..."
mkdir -p "${MARKETPLACE_DIR}/.claude-plugin"
mkdir -p "${MARKETPLACE_DIR}/plugins"

# Write marketplace.json
cat > "${MARKETPLACE_DIR}/.claude-plugin/marketplace.json" << MARKETPLACE_EOF
{
  "\$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "${MARKETPLACE_NAME}",
  "description": "Local marketplace for oh-my-slides presentation generator",
  "plugins": [
    {
      "name": "${PLUGIN_NAME}",
      "description": "AI-powered HTML presentation generator with 20 curated design presets",
      "source": "./plugins/${PLUGIN_NAME}",
      "category": "productivity"
    }
  ]
}
MARKETPLACE_EOF

# Symlink plugin source to marketplace
ln -sfn "${SCRIPT_DIR}" "${MARKETPLACE_DIR}/plugins/${PLUGIN_NAME}"
echo "   ✓ Plugin linked"

# ── 4. Register marketplace in known_marketplaces.json ──
KNOWN_FILE="${CLAUDE_DIR}/plugins/known_marketplaces.json"
mkdir -p "${CLAUDE_DIR}/plugins"
if [ ! -f "${KNOWN_FILE}" ]; then
  echo '{}' > "${KNOWN_FILE}"
fi

node -e "
const fs = require('fs');
const f = '${KNOWN_FILE}';
const d = JSON.parse(fs.readFileSync(f, 'utf8'));
d['${MARKETPLACE_NAME}'] = {
  source: { source: 'directory', path: '${MARKETPLACE_DIR}' },
  installLocation: '${MARKETPLACE_DIR}',
  lastUpdated: new Date().toISOString()
};
fs.writeFileSync(f, JSON.stringify(d, null, 2));
"
echo "   ✓ Marketplace registered"

# ── 5. Register in installed_plugins.json ──
INSTALLED_FILE="${CLAUDE_DIR}/plugins/installed_plugins.json"
if [ ! -f "${INSTALLED_FILE}" ]; then
  echo '{"version":2,"plugins":{}}' > "${INSTALLED_FILE}"
fi

node -e "
const fs = require('fs');
const f = '${INSTALLED_FILE}';
const d = JSON.parse(fs.readFileSync(f, 'utf8'));
if (!d.version) d.version = 2;
if (!d.plugins) d.plugins = {};
d.plugins['${PLUGIN_NAME}@${MARKETPLACE_NAME}'] = [{
  scope: 'user',
  installPath: '${SCRIPT_DIR}',
  version: '1.0.0',
  installedAt: new Date().toISOString()
}];
fs.writeFileSync(f, JSON.stringify(d, null, 2));
"
echo "   ✓ Plugin registered"

# ── 6. Enable plugin in settings.json ──
if [ ! -f "${SETTINGS_FILE}" ]; then
  echo '{}' > "${SETTINGS_FILE}"
fi

node -e "
const fs = require('fs');
const f = '${SETTINGS_FILE}';
const d = JSON.parse(fs.readFileSync(f, 'utf8'));
if (!d.enabledPlugins) d.enabledPlugins = {};
d.enabledPlugins['${PLUGIN_NAME}@${MARKETPLACE_NAME}'] = true;
if (!d.extraKnownMarketplaces) d.extraKnownMarketplaces = {};
d.extraKnownMarketplaces['${MARKETPLACE_NAME}'] = {
  source: { source: 'directory', path: '${MARKETPLACE_DIR}' }
};
fs.writeFileSync(f, JSON.stringify(d, null, 2));
"
echo "   ✓ Plugin enabled"

echo ""
echo "✅ Installation complete!"
echo ""
echo "   Restart Claude Code, then try:"
echo "   > PPT 만들어줘: AI 기술 트렌드"
echo "   > Create a presentation about microservices"
echo ""
echo "   To uninstall: bash $(dirname "$0")/uninstall.sh"
