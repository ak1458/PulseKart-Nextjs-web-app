# Maintenance & Update Guide

## How to Update Your Website

Since your website is connected to GitHub, updating it is as simple as pushing your code.

### 1. Make Changes Locally

Edit your files in VS Code as usual. Test them locally:

- Frontend: `npm run dev` in the root folder.
- Backend: `npm run start:dev` in the `backend` folder.

### 2. Push to Deploy

Once you are happy with your changes, run these commands in your terminal:

```bash
git add .
git commit -m "Describe your changes here"
git push origin refactor/cleanup-and-optimization
```

> **Automatic Deployment**: Render will detect this push and automatically rebuild both your Frontend and Backend services. This usually takes 2-5 minutes.

---

## Managing Configuration (Environment Variables)

Need to change your API keys, Database URL, or other secrets?

1. Go to your **Render Dashboard**.
2. Select the service you want to update (`pulsekart-web` or `pulsekart-api`).
3. Click on **Environment** in the left sidebar.
4. Add or Edit variables (e.g., `JWT_SECRET`, `NEXT_PUBLIC_API_URL`).
5. Click **Save Changes**.

> **Note**: Saving changes will automatically trigger a new deployment to apply the new settings.

---

## Troubleshooting & Logs

If something breaks after an update:

1. Go to your **Render Dashboard**.
2. Select the service (`pulsekart-web` or `pulsekart-api`).
3. Click on **Logs**.
4. Read the real-time logs to see error messages.

### Rollback (Undo Changes)

If a new deployment breaks your site:

1. Go to the service on Render.
2. Click **Deploys**.
3. Find the last "Live" (green) deployment.
4. Click the ... menu and select **Rollback**.
