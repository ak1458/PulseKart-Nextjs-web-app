# Custom Domain Setup - Hostinger + Render

> 🌐 Connect your Hostinger domain to Render

---

## What You Need

- ✅ Domain purchased on Hostinger
- ✅ Site deployed on Render
- ⏱️ 10 minutes

---

## Step 1: Get Render URL

After deploying on Render:

1. Go to https://dashboard.render.com
2. Click your **web service**
3. Copy the URL: `https://pulsekart.onrender.com`

---

## Step 2: Add Domain to Render

1. In Render dashboard → Your Service → **Settings**
2. Scroll to **Custom Domain**
3. Click **Add Custom Domain**
4. Enter: `www.yourdomain.com`
5. Click **Save**

Render will show you DNS records to add.

---

## Step 3: Configure Hostinger DNS

### Login to Hostinger
1. Go to https://www.hostinger.com
2. Login → **Domains** → Manage your domain
3. Click **DNS / Nameservers**

### Add DNS Records

**Record 1 - Root Domain:**
```
Type: A
Name: @ (or leave blank)
Points to: 216.24.57.1
TTL: 14400
```

**Record 2 - WWW:**
```
Type: CNAME
Name: www
Target: pulsekart.onrender.com
TTL: 14400
```

**Record 3 - API (optional):**
```
Type: CNAME
Name: api
Target: pulsekart-api.onrender.com
TTL: 14400
```

### Save Changes
Click **Save** in Hostinger

---

## Step 4: Verify in Render

1. Back in Render dashboard
2. Click **Verify** next to your domain
3. Wait 1-5 minutes for DNS to propagate
4. SSL certificate will auto-generate

---

## Step 5: Update CORS (Important!)

In Render dashboard:

1. Go to your **backend service**
2. **Environment** → Edit
3. Update:
```
CORS_ORIGINS=https://www.yourdomain.com,https://yourdomain.com
```
4. Save (auto redeploys)

---

## Your Final URLs

| Purpose | URL |
|---------|-----|
| **Website** | https://www.yourdomain.com |
| **API** | https://api.yourdomain.com (optional) |

---

## DNS Propagation Time

| Step | Time |
|------|------|
| DNS Changes | 5-30 minutes |
| SSL Certificate | 2-5 minutes (auto) |
| **Total** | **~30 minutes** |

---

## Troubleshooting

### Domain Not Working
```
1. Check DNS records in Hostinger
2. Wait 30 minutes for propagation
3. Use https://dnschecker.org to verify
```

### SSL Not Working
```
1. Wait 5 more minutes
2. In Render: Remove domain → Re-add
3. SSL generates automatically
```

### CORS Errors
```
Update CORS_ORIGINS in Render with your exact domain:
- https://www.yourdomain.com
- https://yourdomain.com (if using root)
```

### "Site Not Found" Error
```
1. Check CNAME points to correct Render URL
2. Verify in Render dashboard
3. Clear browser cache
```

---

## Hostinger Specific Tips

### If Using Hostinger Nameservers
```
Make sure you're editing DNS records, not nameservers
Default Hostinger nameservers work fine
```

### If Domain is New
```
New domains may take 24-48 hours to fully propagate
This is normal, just wait
```

### Advanced: Root Domain (non-www)

Some DNS providers don't support CNAME for root (@). Solutions:

**Option A: Use www (Recommended)**
- Redirect root to www
- Hostinger: Forwarding → Redirect yourdomain.com to www.yourdomain.com

**Option B: ALIAS/ANAME Record**
```
Type: ALIAS or ANAME (if available)
Name: @
Target: pulsekart.onrender.com
```

**Option C: A Record (Render IP)**
```
Type: A
Name: @
Points to: 216.24.57.1
```

---

## Free SSL Certificate

✅ Render provides **free SSL** for all custom domains
✅ Auto-renews every 90 days
✅ No action needed from you

---

## Testing Your Domain

```bash
# Check DNS propagation
dig www.yourdomain.com

# Check SSL
curl -I https://www.yourdomain.com

# Check CORS
curl -H "Origin: https://www.yourdomain.com" \
     https://api.yourdomain.com/v1/health
```

---

## Summary

| Platform | What You Do |
|----------|-------------|
| **Hostinger** | Add DNS records (A + CNAME) |
| **Render** | Add custom domain, auto SSL |
| **Time** | ~30 minutes |
| **Cost** | $0 (included) |

---

## Quick Checklist

- [ ] Deploy on Render
- [ ] Copy Render URL
- [ ] Add domain in Render dashboard
- [ ] Add DNS records in Hostinger
- [ ] Wait 30 minutes
- [ ] Verify in Render
- [ ] Update CORS_ORIGINS
- [ ] Test https://www.yourdomain.com

---

**Questions?** 
- Hostinger Support: https://support.hostinger.com
- Render Docs: https://render.com/docs/custom-domains
