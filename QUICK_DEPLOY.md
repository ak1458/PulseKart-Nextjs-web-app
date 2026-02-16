# 15-Minute Deployment Guide

> 🚀 Deploy PulseKart in 5 simple steps

---

## Before You Start

Make sure you have:
- [ ] GitHub account
- [ ] Render account (free) - https://render.com
- [ ] Vercel account (free) - https://vercel.com

---

## Step 1: Run Setup Script (1 minute)

```bash
# In your project folder
cd pulse-kart
chmod +x scripts/deploy-hybrid.sh
./scripts/deploy-hybrid.sh
```

This will:
- ✅ Check everything is ready
- ✅ Create environment files
- ✅ Push to GitHub
- ✅ Generate JWT secret

---

## Step 2: Deploy Backend + Database (Render)

**URL**: https://dashboard.render.com/blueprint

1. Click **"New Blueprint"**
2. Connect your GitHub repo: `ak1458/PulseKart-Nextjs-web-app`
3. Select branch: `refactor/cleanup-and-optimization`
4. Click **"Apply"**
5. Wait 5-10 minutes (get coffee ☕)

**What Render creates:**
- PostgreSQL database
- Backend API server
- Both linked automatically

---

## Step 3: Get Your Backend URL

1. Go to https://dashboard.render.com
2. Click your **backend service**
3. Copy the URL (looks like: `https://pulsekart-api.onrender.com`)

---

## Step 4: Deploy Frontend (Vercel)

### Option A: One Command
```bash
vercel --prod
```

### Option B: Web Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. **Framework**: Next.js (auto-detected)
4. **Environment Variable**:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-url.onrender.com`
5. Click **Deploy**

---

## Step 5: Connect Them (CORS)

1. Copy your Vercel URL (e.g., `https://pulsekart.vercel.app`)
2. Go to Render dashboard → Backend → Environment
3. Add/update:
   ```
   CORS_ORIGINS=https://pulsekart.vercel.app
   ```
4. Save (auto redeploys)

---

## ✅ Done!

| Service | URL |
|---------|-----|
| **Website** | https://pulsekart.vercel.app |
| **API** | https://pulsekart-api.onrender.com |

---

## Test Your Deployment

```bash
# Test API
curl https://pulsekart-api.onrender.com/v1/health

# Create admin user
curl -X POST https://pulsekart-api.onrender.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@pulsekart.com","password":"admin123","confirmPassword":"admin123"}'
```

Then login at your Vercel URL! 🎉

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Update CORS_ORIGINS in Render with Vercel URL |
| API not found | Check NEXT_PUBLIC_API_URL is correct |
| Database error | Check database is "Available" in Render |
| Build fails | Check Node version is 18+ |

---

## Free Tier Limits

| Service | Limit |
|---------|-------|
| Vercel | 100GB bandwidth/month |
| Render Backend | Sleeps after 15min idle |
| Render Database | 1GB storage |

**Cost: $0** 🎉

---

## Need Help?

- Check `DEPLOY_INFO.txt` (created by script)
- Read `DEPLOYMENT_HYBRID.md` for detailed guide
- Join Discord/community for support

**Deploy time: ~15 minutes** ☕
