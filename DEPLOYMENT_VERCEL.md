# Deploy on Vercel (Frontend Only)

> 🚀 Deploy PulseKart frontend on Vercel for best performance

---

## Why Vercel for Frontend?

- **Instant Global CDN** - Faster page loads worldwide
- **Zero Config** - Auto-detects Next.js
- **Preview Deployments** - Every PR gets its own URL
- **100GB Free Bandwidth** - Generous free tier
- **Edge Functions** - Serverless API routes

---

## Deployment Options

### Option 1: Vercel Dashboard (Easiest)

1. **Go to**: https://vercel.com/new
2. **Import GitHub Repo**: `ak1458/PulseKart-Nextjs-web-app`
3. **Select Branch**: `refactor/cleanup-and-optimization`
4. **Framework Preset**: Next.js (auto-detected)
5. **Add Environment Variable**:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://pulsekart-api.onrender.com` (or your backend URL)
6. **Click Deploy**

Done! Your site will be live at `https://pulsekart.vercel.app`

---

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# ? Set up and deploy? [Y/n] y
# ? Which scope? [your-username]
# ? Link to existing project? [y/N] n
# ? What's your project name? [pulsekart]
```

---

### Option 3: GitHub Integration (Auto-Deploy)

1. Install Vercel GitHub App: https://github.com/apps/vercel
2. Grant access to your repo
3. Push to any branch → Auto-deploys
4. Pull requests get preview URLs

---

## Environment Variables

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_API_URL` | Your backend URL | ✅ Yes |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | ❌ Optional |

**Set in Vercel Dashboard**:
Project → Settings → Environment Variables

---

## Custom Domain (Free)

1. **Buy Domain**: Namecheap (~$10/year)
2. **Vercel Dashboard**: Project → Settings → Domains
3. **Add Domain**: `www.yourdomain.com`
4. **DNS Setup**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
5. SSL certificate is automatic!

---

## Backend + Database Strategy

Since Vercel is **frontend-only**, you need:

| Service | Platform | Purpose | Cost |
|---------|----------|---------|------|
| Frontend | **Vercel** | Next.js app | **FREE** |
| Backend | **Render** | NestJS API | **FREE** |
| Database | **Neon** or **Supabase** | PostgreSQL | **FREE** |

### Free Tier Limits

| Platform | Free Tier |
|----------|-----------|
| **Vercel** | 100GB bandwidth, 10k API calls/day |
| **Render** | 512MB RAM, sleeps after 15min |
| **Neon** | 500MB storage, 190 compute hours |
| **Supabase** | 500MB storage, 2GB bandwidth |

---

## Connect Frontend to Backend

### CORS Setup (Backend)

Update your backend's `CORS_ORIGINS`:

```env
# For Vercel domain
CORS_ORIGINS=https://pulsekart.vercel.app,https://www.yourdomain.com
```

### Frontend API URL

```env
# .env.local or Vercel env vars
NEXT_PUBLIC_API_URL=https://pulsekart-api.onrender.com
```

---

## Advantages of Vercel + Render Combo

✅ **Vercel**: Blazing fast frontend, instant previews  
✅ **Render**: Full backend power, built-in database  
✅ **Both Free**: $0 cost for development/small projects  
✅ **Easy Scaling**: Upgrade individual services as needed

---

## Quick Start Commands

```bash
# Deploy frontend to Vercel
vercel --prod

# Deploy backend to Render
# (via Render dashboard or CLI)
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on API calls | Check `NEXT_PUBLIC_API_URL` |
| CORS errors | Add Vercel domain to backend CORS |
| Build fails | Check Node version (18+) |
| Images not loading | Check `next.config.ts` domains |

---

## Deployment Checklist

- [ ] Create Vercel account
- [ ] Import GitHub repo
- [ ] Set `NEXT_PUBLIC_API_URL`
- [ ] Deploy frontend
- [ ] Deploy backend to Render
- [ ] Setup database (Neon/Supabase)
- [ ] Configure CORS
- [ ] Test API connection
- [ ] (Optional) Add custom domain

---

## Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **Neon Database**: https://neon.tech
- **Supabase**: https://supabase.com

**Both are free to start!** 🎉
