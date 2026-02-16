# Domain Setup - Visual Guide

## Before (Render Subdomain)
```
User → https://pulsekart.onrender.com
       (Free, but not professional)
```

## After (Your Custom Domain)
```
User → https://www.yourdomain.com
       (Professional, branded, SSL)
```

---

## Step-by-Step Flow

```
┌─────────────────┐
│   Hostinger     │
│   (Your Domain) │
└────────┬────────┘
         │ DNS Records
         │ A + CNAME
         ▼
┌─────────────────┐
│   Render        │
│   (Hosting)     │
└────────┬────────┘
         │ Auto SSL
         ▼
┌─────────────────┐
│   Your App      │
│   Live! 🎉      │
└─────────────────┘
```

---

## DNS Records You Need

### In Hostinger DNS:

```
┌─────────────────────────────────────────┐
│ Type: A                                 │
│ Name: @  (root domain)                  │
│ Points to: 216.24.57.1                  │
│ TTL: 14400                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Type: CNAME                             │
│ Name: www                               │
│ Target: pulsekart.onrender.com          │
│ TTL: 14400                              │
└─────────────────────────────────────────┘
```

---

## What Happens When User Visits

```
1. User types: www.yourdomain.com

2. DNS Lookup:
   www.yourdomain.com → pulsekart.onrender.com

3. Render receives request
   
4. Render serves your app
   + Auto SSL (HTTPS)
   
5. User sees your site ✓
```

---

## Timeline

```
+0 min:   Add DNS in Hostinger
+0 min:   Add domain in Render
+5 min:   DNS propagating...
+15 min:  DNS propagated ✓
+17 min:  SSL generated ✓
+20 min:  Site live! 🎉
```

---

## Check It's Working

```bash
# Should show your Render URL
dig www.yourdomain.com +short

# Should return 200 OK
curl -I https://www.yourdomain.com

# Should show SSL info
curl -v https://www.yourdomain.com 2>&1 | grep SSL
```

---

**Bottom Line**: Yes, Render fully supports Hostinger domains! 🚀
