# Hybrid Deployment: Vercel + Render

> 🚀 Best of both worlds: Vercel (Frontend) + Render (Backend + DB)

---

## Architecture

```
User → Vercel (Frontend) → Render (Backend API) → PostgreSQL (Database)
         Next.js 16            NestJS              Render/Neon
         FREE TIER             FREE TIER           FREE TIER
```

**Total Cost: $0** 🎉

---

## Step-by-Step Setup

### Step 1: Database (5 mins)

**Option A: Render PostgreSQL**
1. Go to https://dashboard.render.com
2. New + → PostgreSQL
3. Name: `pulsekart-db`
4. Save the Internal Database URL

**Option B: Neon PostgreSQL** (Recommended)
1. Go to https://console.neon.tech
2. Create project
3. Copy connection string
4. **Benefit**: Serverless, scales to zero

---

### Step 2: Backend on Render (10 mins)

1. **Render Dashboard** → New + → Web Service
2. **Connect GitHub**: `ak1458/PulseKart-Nextjs-web-app`
3. **Configure**:
```
Name: pulsekart-api
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

4. **Environment Variables**:
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=(generate random string)
POSTGRES_HOST=(from database)
POSTGRES_PORT=5432
POSTGRES_USER=pulsekart
POSTGRES_PASSWORD=(from database)
POSTGRES_DB=pulsekart
CORS_ORIGINS=https://pulsekart.vercel.app  # We'll update this after Vercel deploy
```

5. **Deploy**

6. **Run Migrations** (Shell tab):
```bash
cd backend
npm run migration:run
```

---

### Step 3: Frontend on Vercel (5 mins)

1. **Go to**: https://vercel.com/new
2. **Import GitHub**: `ak1458/PulseKart-Nextjs-web-app`
3. **Framework**: Next.js (auto-detected)
4. **Root Directory**: `./` (leave default)
5. **Environment Variable**:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://pulsekart-api.onrender.com`
6. **Deploy**

**Your frontend URL**: `https://pulsekart.vercel.app`

---

### Step 4: Connect Them (2 mins)

1. **Copy Vercel URL**: `https://pulsekart.vercel.app`
2. **Go to Render** → Backend → Environment
3. **Update CORS_ORIGINS**:
```
CORS_ORIGINS=https://pulsekart.vercel.app
```
4. **Save** → Auto redeploys

---

## URLs After Deploy

| Service | URL Example |
|---------|-------------|
| Frontend | https://pulsekart.vercel.app |
| Backend API | https://pulsekart-api.onrender.com |
| API Docs | https://pulsekart-api.onrender.com/api/docs |

---

## Free Tier Limits

| Service | Free Tier | Upgrade When |
|---------|-----------|--------------|
| **Vercel** | 100GB bandwidth, 10k API calls/day | High traffic |
| **Render Backend** | 512MB RAM, sleeps after 15min | Need always-on |
| **Render DB** | 1GB storage | Data grows |
| **Neon DB** | 500MB, 190 compute hours | Need more |

---

## Updating CORS

If you add a custom domain later:

**Backend Environment Variables**:
```env
CORS_ORIGINS=https://pulsekart.vercel.app,https://www.yourdomain.com
```

---

## Testing Your Deployment

```bash
# Test backend health
curl https://pulsekart-api.onrender.com/health

# Test API
curl https://pulsekart-api.onrender.com/v1/products

# Test frontend (open in browser)
https://pulsekart.vercel.app
```

---

## Common Issues

### CORS Error in Browser
```
Solution: Update CORS_ORIGINS in Render with your Vercel URL
```

### API Calls Failing
```
Check: NEXT_PUBLIC_API_URL in Vercel env vars
```

### Database Connection Error
```
Check: POSTGRES_HOST is the Internal URL (not external)
```

---

## Monitoring

| Platform | Where to Check |
|----------|----------------|
| **Vercel** | Dashboard → Deployments & Analytics |
| **Render** | Dashboard → Metrics & Logs |
| **Neon** | Console → Usage |

---

## Advantages of This Setup

✅ **Fast Frontend**: Vercel's global CDN  
✅ **Powerful Backend**: Full Node.js server (not serverless)  
✅ **Reliable Database**: PostgreSQL with backups  
✅ **Zero Cost**: All free tiers  
✅ **Easy Scaling**: Upgrade individual parts  
✅ **Auto Deploy**: Push to GitHub = Auto deploy  

---

## Custom Domain Setup

### 1. Buy Domain
- Namecheap: https://namecheap.com
- Cloudflare: https://cloudflare.com

### 2. Vercel (Frontend)
```
Project → Settings → Domains → Add www.yourdomain.com
```

### 3. DNS (Your Domain Provider)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4. Update Backend CORS
```env
CORS_ORIGINS=https://www.yourdomain.com
```

---

## Quick Commands

```bash
# Deploy frontend
vercel --prod

# View logs
vercel logs pulsekart.vercel.app

# Check backend logs
# (via Render dashboard)
```

---

## Next Steps

1. ✅ **Deploy Backend** on Render
2. ✅ **Deploy Frontend** on Vercel
3. ✅ **Connect Database**
4. ✅ **Test Everything**
5. 🔄 **Auto-deploy**: Just push to GitHub!

**Questions?** Check individual docs:
- `DEPLOYMENT.md` - Render only
- `DEPLOYMENT_VERCEL.md` - Vercel only
- `scripts/deploy-checklist.md` - Detailed checklist
