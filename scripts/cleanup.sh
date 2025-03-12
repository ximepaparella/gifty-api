#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting cleanup process...${NC}"

# Remove node_modules and cache directories
echo -e "${YELLOW}Removing node_modules and cache directories...${NC}"
rm -rf node_modules/
rm -rf .cache/
rm -rf **/.cache/
rm -rf coverage/
rm -rf dist/
rm -rf build/

# Clean npm cache
echo -e "${YELLOW}Cleaning npm cache...${NC}"
npm cache clean --force

# Remove log files
echo -e "${YELLOW}Removing log files...${NC}"
rm -rf logs/*.log
rm -rf *.log

# Git cleanup
echo -e "${YELLOW}Cleaning Git repository...${NC}"
git rm -rf --cached .
git rm -rf --cached node_modules
git rm -rf --cached .cache

echo -e "${GREEN}Cleanup completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Run ${GREEN}npm install${NC} to reinstall dependencies"
echo -e "2. Run ${GREEN}git add .${NC} to stage your changes"
echo -e "3. Run ${GREEN}git commit -m 'Clean repository'${NC} to commit"
echo -e "4. Run ${GREEN}git push${NC} to push your changes" 