# Render Deployment Checklist

> Follow these steps exactly to deploy PulseKart

---

## Pre-Deployment (Do These First)

### 1. Environment Variables Check

Create these files locally with REAL values:

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://pulsekart-api.onrender.com
```

**Backend `.env`:**
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-long-random-string-here-min-32-chars

# Database (Render will provide this)
POSTGRES_HOST=your-render-db-host
POSTGRES_PORT=5432
POSTGRES_USER=pulsekart
POSTGRES_PASSWORD=your-db-password
POSTGRES_DB=pulsekart

# CORS
CORS_ORIGINS=https://pulsekart-web.onrender.com
```

---

## Step-by-Step Deployment

### Step 1: Push Latest Code
```bash
git add .
git commit -m "ready for deployment"
git push origin refactor/cleanup-and-optimization
```

### Step 2: Create Render Account
1. Go to https://dashboard.render.com
2. Sign up with GitHub
3. Click "New +" → "PostgreSQL"

### Step 3: Create Database
```
Name: pulsekart-db
Database: pulsekart
User: pulsekart
```

**SAVE THESE VALUES:**
- Internal Database URL
- Password

### Step 4: Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repo
3. Configure:

```
Name: pulsekart-api
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

4. Add Environment Variables:
```
NODE_ENV=production
PORT=10000
POSTGRES_HOST=(from database)
POSTGRES_PORT=5432
POSTGRES_USER=pulsekart
POSTGRES_PASSWORD=(from database)
POSTGRES_DB=pulsekart
JWT_SECRET=(generate: openssl rand -base64 32)
CORS_ORIGINS=(leave blank for now, update after frontend deploy)
```

5. Click "Create Web Service"

### Step 5: Run Database Migrations

In Render dashboard:
1. Go to your backend service
2. Click "Shell" tab
3. Run:
```bash
npx typeorm migration:run -d dist/database/data-source.js
```

Or if that fails:
```bash
node -e "require('typeorm').getConnection().synchronize()"
```

### Step 6: Deploy Frontend

1. Click "New +" → "Web Service"
2. Configure:

```
Name: pulsekart-web
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

3. Add Environment Variable:
```
NEXT_PUBLIC_API_URL=https://pulsekart-api.onrender.com
```

4. Click "Create Web Service"

### Step 7: Update CORS

1. Go to backend service settings
2. Update CORS_ORIGINS:
```
CORS_ORIGINS=https://pulsekart-web.onrender.com
```
3. Save and redeploy backend

---

## Post-Deployment Verification

### Test These URLs:
- [ ] Frontend: `https://pulsekart-web.onrender.com`
- [ ] Backend Health: `https://pulsekart-api.onrender.com/health`
- [ ] API: `https://pulsekart-api.onrender.com/v1/products`

### Create Admin User
```bash
# In backend shell
curl -X POST https://pulsekart-api.onrender.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@pulsekart.com",
    "password": "admin123",
    "confirmPassword": "admin123"
  }'
```

Then update role to admin in database (or use your seed script).

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Node version is 18+ in Render settings |
| DB connection error | Verify all POSTGRES_ env vars |
| CORS error | Add frontend URL to CORS_ORIGINS |
| 502 error | Check backend is running on correct PORT |
| Static files 404 | Check `next.config.ts` has `output: 'standalone'` |

---

## Custom Domain (Optional)

1. Buy domain from Namecheap/Cloudflare
2. In Render: Service → Settings → Custom Domain
3. Add DNS record:
   - Type: CNAME
   - Name: www
   - Value: your-service.onrender.com
4. Wait for SSL (automatic)

---

## Monthly Costs

| Service | Free Tier | Paid (Recommended) |
|---------|-----------|-------------------|
| Web Service | $0 (sleeps) | $7/month |
| PostgreSQL | $0 (1GB) | $15/month |
| **Total** | **$0** | **$22/month** |

---

## Support

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Your Repo: https://github.com/ak1458/PulseKart-Nextjs-web-app
