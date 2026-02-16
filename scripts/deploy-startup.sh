#!/bin/bash
# PulseKart Startup Deployment
# Render Only - Simplest option for startups

echo "🚀 PulseKart Startup Deployment"
echo "================================"
echo ""
echo "Platform: Render (All-in-One)"
echo "Cost: $0 (Free Tier)"
echo "Capacity: 1000+ users"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "${BLUE}Step 1: Preparing...${NC}"

# Check git
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    echo "Committing changes..."
    git add -A
    git commit -m "chore: prepare for render deployment"
fi

# Push
echo "Pushing to GitHub..."
git push origin $(git branch --show-current)

echo "${GREEN}✓ Code pushed to GitHub${NC}"
echo ""

echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Step 2: Deploy on Render"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "URL: ${YELLOW}https://dashboard.render.com/blueprint${NC}"
echo ""
echo "Instructions:"
echo "  1. Click 'New Blueprint'"
echo "  2. Connect: ak1458/PulseKart-Nextjs-web-app"
echo "  3. Select branch: $(git branch --show-current)"
echo "  4. Click 'Apply'"
echo ""
echo "Wait 5-10 minutes..."
echo ""

echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Step 3: After Deploy"
echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Your site will be at:"
echo "  ${GREEN}https://pulsekart.onrender.com${NC}"
echo ""
echo "Create admin user:"
echo "  curl -X POST https://pulsekart-api.onrender.com/v1/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"name\":\"Admin\",\"email\":\"admin@pulsekart.com\",\"password\":\"admin123\",\"confirmPassword\":\"admin123\"}'"
echo ""

echo "${GREEN}✅ Done!${NC}"
echo ""
echo "Questions? Check DEPLOYMENT_STARTUP.md"
