# Deployment Guide

> 🚀 How to deploy PulseKart on Render

---

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repo**: Push code to GitHub first
3. **Environment Variables**: Have secrets ready

---

## 🚀 One-Click Deploy (Blueprint)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

### Step 2: Deploy on Render
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repo
4. Render will read `render.yaml` and create services
5. Add environment variables (see below)

---

## ⚙️ Manual Deploy (Step-by-Step)

### 1. Create PostgreSQL Database
```
Dashboard → New + → PostgreSQL
Name: pulsekart-db
Database: pulsekart
User: pulsekart
```
Save the **Internal Database URL** - you'll need it.

### 2. Deploy Backend
```
Dashboard → New + → Web Service
Name: pulsekart-backend
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

**Environment Variables**:
```
NODE_ENV=production
PORT=10000
POSTGRES_HOST=(from database)
POSTGRES_PORT=5432
POSTGRES_USER=(from database)
POSTGRES_PASSWORD=(from database)
POSTGRES_DB=pulsekart
JWT_SECRET=(generate random string)
CORS_ORIGINS=https://your-frontend-url.onrender.com
```

### 3. Deploy Frontend
```
Dashboard → New + → Web Service
Name: pulsekart-frontend
Build Command: npm install && npm run build
Start Command: npm start
```

**Environment Variables**:
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

---

## 🔧 Post-Deploy Setup

### 1. Run Database Migrations
```bash
# In Render dashboard, go to backend shell
npm run migration:run
npm run seed
```

### 2. Verify Deployment
- Frontend: `https://pulsekart-frontend.onrender.com`
- Backend API: `https://pulsekart-backend.onrender.com/v1`
- Test: `https://pulsekart-backend.onrender.com/v1/health`

### 3. Update CORS
Add your frontend URL to backend `CORS_ORIGINS`:
```
CORS_ORIGINS=https://pulsekart-frontend.onrender.com,https://www.yourdomain.com
```

---

## 🔄 Auto-Deploy

Render automatically deploys on every push to `main` branch.

To disable:
1. Go to service settings
2. Toggle **"Auto-Deploy"** off

---

## 🛠️ Troubleshooting

### Build Fails
```bash
# Check logs in Render dashboard
# Common fixes:
1. Ensure all env vars are set
2. Check package.json scripts exist
3. Verify Node version (18+)
```

### Database Connection Error
```
1. Check POSTGRES_HOST is correct
2. Verify database is "Available" in Render
3. Try using "Internal Database URL" format
```

### CORS Error
```
1. Add frontend URL to backend CORS_ORIGINS
2. Include https:// and no trailing slash
3. Restart backend service
```

### 502 Bad Gateway
```
1. Check backend is running (health endpoint)
2. Verify PORT env var is set
3. Check frontend API URL is correct
```

---

## 📊 Monitoring

### Logs
```
Render Dashboard → Service → Logs
```

### Metrics
```
Render Dashboard → Service → Metrics
```

### Alerts
Set up alerts for:
- High CPU usage (>80%)
- Memory usage
- Failed deployments

---

## 🌐 Custom Domain (Optional)

### 1. Add Domain in Render
```
Service → Settings → Custom Domain
Add: www.yourdomain.com
```

### 2. DNS Configuration
```
Type: CNAME
Name: www
Value: your-service-name.onrender.com
```

### 3. SSL
Render provides free SSL automatically.

---

## 💰 Cost Optimization

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Web Service | 512MB RAM | $7+/month |
| PostgreSQL | 1GB storage | $15+/month |

**Tips**:
- Free tier spins down after 15 min inactivity
- First request after spin-down takes 30-60s
- For production, upgrade to paid tier

---

## 📞 Support

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Status**: [status.render.com](https://status.render.com)
- **Team Chat**: Ask in #deployments channel
