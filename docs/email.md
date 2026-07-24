# 📧 Email Configuration Guide for PulseKart

This guide will help you configure email sending for password reset functionality.

---

## 🚀 Quick Start (Recommended for Beginners)

### Option 1: Gmail (Easiest for Testing)

**Step 1:** Enable 2-Factor Authentication on your Google account
- Go to https://myaccount.google.com/security
- Enable "2-Step Verification"

**Step 2:** Generate an App Password
- Go to https://myaccount.google.com/apppasswords
- Select "Mail" and your device
- Copy the 16-character password

**Step 3:** Add to your `backend/.env`:
```env
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcd-efgh-ijkl-mnop
FROM_EMAIL=your-email@gmail.com
FRONTEND_URL=https://your-frontend-url.com
```

---

## 📮 Production Options

### Option 2: SendGrid (Best for Production)

**Step 1:** Create account at https://sendgrid.com

**Step 2:** Verify your sender identity
- Go to Settings > Sender Authentication
- Verify a single sender or authenticate your domain

**Step 3:** Create API Key
- Go to Settings > API Keys
- Create API Key with "Mail Send" permissions
- Copy the API key (starts with `SG.`)

**Step 4:** Add to `backend/.env`:
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend-url.com
```

**Free Tier:** 100 emails/day forever

---

### Option 3: Mailgun

**Step 1:** Create account at https://www.mailgun.com

**Step 2:** Get your domain and API key from the dashboard

**Step 3:** Add to `backend/.env`:
```env
EMAIL_PROVIDER=mailgun
MAILGUN_USER=postmaster@your-domain.mailgun.org
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=your-domain.mailgun.org
FROM_EMAIL=noreply@your-domain.mailgun.org
FRONTEND_URL=https://your-frontend-url.com
```

**Free Tier:** 5,000 emails/month for 3 months, then pay-as-you-go

---

### Option 4: AWS SES (Amazon Simple Email Service)

**Step 1:** Go to AWS Console > SES

**Step 2:** Verify your domain or email address

**Step 3:** Create SMTP credentials
- Go to SMTP Settings > Create SMTP Credentials
- Download the credentials

**Step 4:** Move out of sandbox (required for production)
- Request production access to send to any email

**Step 5:** Add to `backend/.env`:
```env
EMAIL_PROVIDER=ses
AWS_SES_USER=xxxxxxxxxxxxxxxxxxxx
AWS_SES_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_SES_REGION=us-east-1
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend-url.com
```

**Pricing:** 62,000 emails/month free (if sent from EC2), then $0.10 per 1,000 emails

---

### Option 5: Generic SMTP (Any Provider)

Use any SMTP provider like Namecheap, GoDaddy, Zoho, etc.

**Add to `backend/.env`:**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
SMTP_SECURE=false  # true for port 465, false for 587
FROM_EMAIL=your-email@yourdomain.com
FRONTEND_URL=https://your-frontend-url.com
```

---

## 🔍 Testing Your Configuration

### Step 1: Install dependencies
```bash
cd backend
npm install
```

### Step 2: Start the backend
```bash
npm run start:dev
```

### Step 3: Check the logs
When you request a password reset, look for these log messages:

**If configured correctly:**
```
[EmailService] Gmail SMTP configured successfully
[AuthService] Password reset link sent to: user@example.com
```

**If NOT configured:**
```
[EmailService] SMTP configuration incomplete...
[EmailService] ================================================================
[EmailService] EMAIL NOT CONFIGURED - Password Reset Link:
[EmailService] To: user@example.com
[EmailService] Reset URL: http://localhost:3000/reset-password?token=xxxxx
[EmailService] ================================================================
```

### Step 4: Test the flow
1. Go to `/forgot-password`
2. Enter your email
3. Check your inbox (or console logs if not configured)

---

## 🐛 Troubleshooting

### "Invalid login" or "Authentication failed"

**Gmail:**
- Make sure you're using an **App Password**, not your regular password
- Ensure 2-Factor Authentication is enabled
- Less secure app access is no longer supported by Google

**SendGrid:**
- Verify your sender email/domain in SendGrid dashboard
- Make sure the API key has "Mail Send" permissions

**AWS SES:**
- Ensure your domain/email is verified in SES
- Check if you're still in sandbox mode (can only send to verified emails)
- Request production access to send to any email

### "Connection timeout" or "Network error"

- Check your firewall settings
- Some providers block port 587, try port 465 with `SMTP_SECURE=true`
- Verify `SMTP_HOST` is correct

### Emails not received

1. Check spam/junk folders
2. Verify `FROM_EMAIL` is properly set
3. Check provider dashboard for delivery logs
4. Add SPF and DKIM records to your domain DNS

---

## 🔒 Security Best Practices

1. **Never commit .env files** to git
2. **Use App Passwords** for Gmail, not your main password
3. **Rotate API keys** regularly
4. **Verify sender domain** to improve deliverability
5. **Set up SPF and DKIM** DNS records
6. **Use HTTPS** for your frontend URL in production

---

## 📊 Provider Comparison

| Provider | Free Tier | Best For | Setup Difficulty |
|----------|-----------|----------|------------------|
| Gmail | 500 emails/day | Development/Testing | Easy |
| SendGrid | 100 emails/day | Production | Easy |
| Mailgun | 5,000/month (3mo) | High volume | Medium |
| AWS SES | 62,000/month | AWS users | Hard |
| SMTP | Varies | Existing email | Varies |

---

## 🎯 Recommended Setup by Environment

### Development (Local)
```env
EMAIL_PROVIDER=gmail
GMAIL_USER=your-dev-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### Staging/Testing
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=staging@yourdomain.com
```

### Production
```env
EMAIL_PROVIDER=sendgrid  # or ses for high volume
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://pulsekart.com
```

---

## 💡 Pro Tips

1. **Use different providers for dev/prod** - Keep development emails separate
2. **Monitor delivery rates** - Most providers have dashboards
3. **Set up webhooks** - Track bounces, opens, and clicks
4. **Use email templates** - Customize the password reset email design
5. **Test before deploying** - Always send a test email before going live

---

## 🆘 Need Help?

If you're still having issues:

1. Check the backend console logs for detailed error messages
2. Verify all environment variables are loaded: `console.log(process.env)`
3. Test SMTP connection manually using telnet or online tools
4. Contact your email provider's support

---

## 📚 Useful Links

- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **SendGrid:** https://app.sendgrid.com
- **Mailgun:** https://app.mailgun.com
- **AWS SES:** https://console.aws.amazon.com/ses
- **Email Tester:** https://www.mail-tester.com
