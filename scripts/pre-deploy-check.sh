#!/bin/bash
# Pre-deployment checklist script
# Run this before deploying to catch common issues

echo "🔍 PulseKart Pre-Deployment Check"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Environment files
echo "✓ Check 1: Environment files"
if [ ! -f ".env.example" ]; then
    echo "${RED}✗ .env.example missing${NC}"
    ERRORS=$((ERRORS+1))
else
    echo "${GREEN}✓ .env.example exists${NC}"
fi

if [ ! -f "backend/.env.example" ]; then
    echo "${RED}✗ backend/.env.example missing${NC}"
    ERRORS=$((ERRORS+1))
else
    echo "${GREEN}✓ backend/.env.example exists${NC}"
fi

# Check 2: Build frontend
echo ""
echo "✓ Check 2: Frontend build"
if npm run build > /dev/null 2>&1; then
    echo "${GREEN}✓ Frontend builds successfully${NC}"
else
    echo "${RED}✗ Frontend build failed${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check 3: Build backend
echo ""
echo "✓ Check 3: Backend build"
cd backend
if npm run build > /dev/null 2>&1; then
    echo "${GREEN}✓ Backend builds successfully${NC}"
else
    echo "${RED}✗ Backend build failed${NC}"
    ERRORS=$((ERRORS+1))
fi
cd ..

# Check 4: Critical files exist
echo ""
echo "✓ Check 4: Critical files"
FILES=(
    "render.yaml"
    "package.json"
    "backend/package.json"
    "backend/src/main.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "${GREEN}✓ $file exists${NC}"
    else
        echo "${RED}✗ $file missing${NC}"
        ERRORS=$((ERRORS+1))
    fi
done

# Check 5: Git status
echo ""
echo "✓ Check 5: Git status"
if git diff-index --quiet HEAD --; then
    echo "${GREEN}✓ No uncommitted changes${NC}"
else
    echo "${YELLOW}⚠ You have uncommitted changes${NC}"
    git status --short
    WARNINGS=$((WARNINGS+1))
fi

# Summary
echo ""
echo "=================================="
echo "📊 Summary"
echo "=================================="
if [ $ERRORS -eq 0 ]; then
    echo "${GREEN}✓ All checks passed! Ready to deploy.${NC}"
    exit 0
else
    echo "${RED}✗ Found $ERRORS error(s), $WARNINGS warning(s)${NC}"
    echo "Fix errors before deploying."
    exit 1
fi
