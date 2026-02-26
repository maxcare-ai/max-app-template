#!/usr/bin/env bash
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║     Max App Template Setup           ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# Get app name
read -rp "$(echo -e "${BOLD}App name${NC} (e.g. max-scheduling-app): ")" APP_NAME

if [[ -z "$APP_NAME" ]]; then
  echo -e "${RED}Error: App name is required${NC}"
  exit 1
fi

# Derive values from app name
APP_TITLE=$(echo "$APP_NAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)} 1')
DB_NAME=$(echo "$APP_NAME" | sed 's/-/_/g')

echo ""
echo -e "  App name:     ${GREEN}${APP_NAME}${NC}"
echo -e "  Display title: ${GREEN}${APP_TITLE}${NC}"
echo -e "  Database name: ${GREEN}${DB_NAME}${NC}"
echo ""
read -rp "$(echo -e "${BOLD}Continue?${NC} (Y/n): ")" CONFIRM

if [[ "$CONFIRM" =~ ^[Nn] ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo -e "${BLUE}Updating files...${NC}"

# Update package.json
if [[ "$(uname)" == "Darwin" ]]; then
  SED_I="sed -i ''"
else
  SED_I="sed -i"
fi

# package.json — name
$SED_I "s/\"name\": \"max-app-template\"/\"name\": \"$APP_NAME\"/" package.json

# docker-compose.yml — database name
$SED_I "s/POSTGRES_DB: my_app/POSTGRES_DB: $DB_NAME/" docker-compose.yml

# .env.example — database URL
$SED_I "s|postgres://postgres:postgres@localhost:5432/my_app|postgres://postgres:postgres@localhost:5432/$DB_NAME|" .env.example

# fly.toml — app name
$SED_I "s/app = \"max-app-template\"/app = \"$APP_NAME\"/" fly.toml

# Root layout — title
$SED_I "s/title: \"Max App Template\"/title: \"$APP_TITLE\"/" src/app/layout.tsx

# Root layout — description
$SED_I "s/description: \"MaxCare embedded application template\"/description: \"$APP_TITLE - MaxCare embedded application\"/" src/app/layout.tsx

# Home page — title
$SED_I "s/Max App Template/$APP_TITLE/g" src/app/page.tsx

# Admin layout — not embedded message
$SED_I "s/>Max App Template</>$APP_TITLE</" src/app/admin/layout.tsx

# CLAUDE.md — title
$SED_I "s/# Max App Template/# $APP_TITLE/" CLAUDE.md

echo -e "${GREEN}  Updated package.json${NC}"
echo -e "${GREEN}  Updated docker-compose.yml${NC}"
echo -e "${GREEN}  Updated .env.example${NC}"
echo -e "${GREEN}  Updated fly.toml${NC}"
echo -e "${GREEN}  Updated page titles${NC}"
echo -e "${GREEN}  Updated CLAUDE.md${NC}"

# Clean up sed backup files on macOS
find . -name "*''" -delete 2>/dev/null || true

# Remove template git history and start fresh
echo ""
echo -e "${BLUE}Initializing fresh git repository...${NC}"
rm -rf .git
git init
git add -A
git commit -m "Initial commit from max-app-template"

echo ""
echo -e "${GREEN}${BOLD}Setup complete!${NC}"
echo ""
echo -e "  Next steps:"
echo -e "  ${BOLD}1.${NC} Copy .env.example to .env.local and fill in your values"
echo -e "  ${BOLD}2.${NC} Run ${BLUE}npm install${NC}"
echo -e "  ${BOLD}3.${NC} Run ${BLUE}npm run dev:setup${NC} to start developing"
echo ""
