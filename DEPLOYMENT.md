# Deployment Guide: Vercel + Railway

Complete guide for deploying your Postiz application with Vercel (frontend) and Railway (backend).

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Phase 1: Deploy Backend to Railway](#phase-1-deploy-backend-to-railway)
- [Phase 2: Deploy Frontend to Vercel](#phase-2-deploy-frontend-to-vercel)
- [Phase 3: Configure Custom Domain](#phase-3-configure-custom-domain-optional)
- [Testing & Validation](#testing--validation)
- [Troubleshooting](#troubleshooting)
- [Cost Breakdown](#cost-breakdown)

---

## Architecture Overview

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Vercel     │────────▶│   Railway    │────────▶│  Supabase    │
│  (Frontend)  │         │  (Backend)   │         │ (Database +  │
│   Next.js    │         │   NestJS     │         │   Storage)   │
│              │         │  + Workers   │         │              │
│              │         │  + Cron      │         │              │
│              │         │  + Redis     │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
```

**What goes where:**
- **Vercel**: Static frontend (HTML, CSS, JS) with CDN
- **Railway**: Backend API, background workers, scheduled tasks, Redis cache
- **Supabase**: PostgreSQL database and file storage

---

## Prerequisites

Before you begin, ensure you have:

- ✅ GitHub account (for code repository)
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com) - free)
- ✅ Railway account (sign up at [railway.app](https://railway.app) - $5 trial credit)
- ✅ Supabase project created (see [LOCAL_SETUP.md](LOCAL_SETUP.md))
- ✅ Code pushed to GitHub repository
- ✅ Supabase connection string and API keys

---

## Phase 1: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `real-estate-social`
5. Railway will detect your project

### Step 2: Add Redis Service

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Redis"**
3. Redis service will be created automatically
4. Copy the **Redis URL** (we'll use this in environment variables)

### Step 3: Configure Backend Service

1. Click on your main service (detected from repo)
2. Go to **Settings** → **Service Name**: Set to `postiz-backend`
3. Go to **Settings** → **Root Directory**: Leave empty (uses root)
4. Go to **Settings** → **Build Command**:
   ```bash
   pnpm install && pnpm build:backend && pnpm build:workers && pnpm build:cron
   ```
5. Go to **Settings** → **Start Command**:
   ```bash
   pnpm run pm2
   ```
6. Go to **Settings** → **Generate Domain** to create public URL

### Step 4: Set Environment Variables

Click on **Variables** tab and add these:

```bash
# === Database (Supabase)
DATABASE_URL=postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# === Redis (Railway - Auto-filled)
REDIS_URL=${{Redis.REDIS_URL}}

# === Application URLs (Update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app
NEXT_PUBLIC_BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
BACKEND_INTERNAL_URL=http://postiz-backend.railway.internal:3000

# === Supabase Configuration
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_STORAGE_BUCKET=postiz-uploads

# === Storage Provider
STORAGE_PROVIDER=supabase

# === Security
JWT_SECRET=REPLACE_WITH_RANDOM_LONG_STRING_AT_LEAST_32_CHARS

# === General Settings
IS_GENERAL=true
NODE_ENV=production
TZ=UTC
NX_ADD_PLUGINS=false

# === Optional: Social Media APIs
OPENAI_API_KEY=
X_API_KEY=
X_API_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
TIKTOK_CLIENT_ID=
TIKTOK_CLIENT_SECRET=

# === Optional: Email (Resend)
# RESEND_API_KEY=
# EMAIL_FROM_ADDRESS=
# EMAIL_FROM_NAME=

# === Optional: Payments (Stripe)
# STRIPE_PUBLISHABLE_KEY=
# STRIPE_SECRET_KEY=
# STRIPE_SIGNING_KEY=

# === Optional: Error Tracking (Sentry)
# SENTRY_ORG=
# SENTRY_PROJECT=
# SENTRY_AUTH_TOKEN=
```

**Important Variable Explanations:**

- **`${{Redis.REDIS_URL}}`**: Railway auto-fills this from your Redis service
- **`${{RAILWAY_PUBLIC_DOMAIN}}`**: Auto-filled with your backend's public URL
- **`JWT_SECRET`**: Generate with: `openssl rand -base64 32` or use a password generator
- **`FRONTEND_URL`**: Will be updated after Vercel deployment (Step 2.4)

### Step 5: Deploy

1. Click **"Deploy"** or push to GitHub (Railway auto-deploys)
2. Wait ~5-10 minutes for build and deployment
3. Check **Logs** tab for deployment progress
4. Look for: `🚀 Backend is running on: http://localhost:3000`
5. Copy your **Public Domain** URL (e.g., `postiz-backend-production.up.railway.app`)

### Step 6: Verify Backend is Running

1. Visit `https://[your-railway-domain]/api` (Swagger documentation)
2. You should see the API documentation page
3. If you see errors, check the **Logs** tab

---

## Phase 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your repository: `real-estate-social`
4. Click **"Import"**

### Step 2: Configure Build Settings

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `apps/frontend` ✅

**Build & Development Settings** (expand):
- **Build Command**:
  ```bash
  cd ../.. && pnpm install && pnpm build:frontend
  ```
- **Output Directory**:
  ```
  .next
  ```
- **Install Command**:
  ```bash
  pnpm install
  ```

### Step 3: Set Environment Variables

Click **"Environment Variables"** and add:

```bash
# === Backend API URL (from Railway Step 1.5)
NEXT_PUBLIC_BACKEND_URL=https://postiz-backend-production.up.railway.app

# === Storage Provider
STORAGE_PROVIDER=supabase

# === Optional: Sentry Error Tracking
# SENTRY_ORG=
# SENTRY_PROJECT=
# SENTRY_AUTH_TOKEN=

# === Optional: Analytics/Tracking
# NEXT_PUBLIC_DISCORD_SUPPORT=
# NEXT_PUBLIC_POLOTNO=
```

**Important**:
- Use your **Railway backend URL** (without trailing slash)
- All `NEXT_PUBLIC_*` variables are exposed to the browser

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait ~3-5 minutes for build
3. Vercel will show deployment status
4. Once complete, you'll get a URL like: `your-app.vercel.app`
5. Click the URL to visit your deployed app

### Step 5: Update Railway with Vercel URL

**Go back to Railway** → Variables → Update:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

Click **"Deploy"** in Railway to apply changes.

---

## Phase 3: Configure Custom Domain (Optional)

### Add Custom Domain to Vercel (Frontend)

1. **Purchase a domain** (Namecheap, Cloudflare, Google Domains, etc.)

2. **In Vercel**:
   - Go to your project → **Settings** → **Domains**
   - Click **"Add"**
   - Enter your domain: `postiz.yourdomain.com`
   - Click **"Add"**

3. **Update DNS** at your domain registrar:
   - **Type**: CNAME
   - **Name**: `postiz` (or `@` for root domain)
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: 300 (or default)

4. **Wait for DNS propagation** (5 minutes - 48 hours)

5. **SSL Certificate**: Vercel automatically provisions (Let's Encrypt)

### Add Custom Domain to Railway (Backend) - Optional

1. **In Railway**:
   - Go to your backend service → **Settings** → **Public Networking**
   - Click **"Custom Domain"**
   - Enter: `api.yourdomain.com`

2. **Update DNS**:
   - **Type**: CNAME
   - **Name**: `api`
   - **Value**: `[your-project].up.railway.app`

3. **Wait for DNS** and SSL provisioning

### Update Environment Variables with Custom Domains

**Railway**:
```bash
FRONTEND_URL=https://postiz.yourdomain.com
```

**Vercel**:
```bash
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

Redeploy both services to apply changes.

---

## Testing & Validation

### 1. Test Frontend

Visit your Vercel URL: `https://your-app.vercel.app`

**Checklist**:
- [ ] Homepage loads without errors
- [ ] Can navigate to Register page
- [ ] Can navigate to Login page
- [ ] No 404 errors in browser console

### 2. Test Backend API

Visit Swagger docs: `https://[railway-domain]/api`

**Checklist**:
- [ ] API documentation displays
- [ ] Can expand endpoints
- [ ] No error messages

### 3. Test Registration & Login

1. **Create Account**:
   - Go to Register page
   - Fill in email, password, name
   - Click Register
   - Should redirect to dashboard (or activation page if email enabled)

2. **Login**:
   - Go to Login page
   - Enter credentials
   - Should redirect to dashboard

3. **Verify in Supabase**:
   - Go to Supabase → Table Editor → `User` table
   - Your user should be listed

### 4. Test File Upload

1. **In Dashboard**:
   - Click **"Create Post"** or go to Launches
   - Upload an image

2. **Verify in Supabase Storage**:
   - Go to Supabase → Storage → `postiz-uploads`
   - Your file should be listed
   - Click file → Copy public URL
   - Paste URL in browser → Image should display

### 5. Test Social Media Integration (Optional)

If you added social media API keys:

1. **Connect Account**:
   - Go to Settings → Integrations
   - Click **"Add Integration"** (e.g., Twitter)
   - Authorize via OAuth
   - Should redirect back with success message

2. **Create Post**:
   - Go to Launches → New Post
   - Write content
   - Select connected account
   - Click **"Publish Now"**

3. **Verify**:
   - Check Railway logs for worker processing
   - Check social media platform for published post

### 6. Test Background Workers

1. **Schedule a Post**:
   - Create a new post
   - Set publish time to 2 minutes in the future
   - Click **"Schedule"**

2. **Monitor in Railway**:
   - Go to Railway → Logs
   - Watch for worker picking up the job
   - Should see: `Processing job: [job-id]`

3. **Verify**:
   - Wait for scheduled time
   - Post should publish to social media
   - Check social platform to confirm

---

## Troubleshooting

### Issue 1: "API returned 404" on Frontend

**Symptoms**: Frontend shows "API error" or 404 when loading

**Solutions**:
1. Check `NEXT_PUBLIC_BACKEND_URL` in Vercel matches Railway public domain
2. Verify Railway backend is running (check Logs)
3. Ensure Railway service has a public domain (Settings → Generate Domain)
4. Check CORS: Vercel URL must be in Railway's `FRONTEND_URL` variable
5. Redeploy Vercel after changing environment variables

### Issue 2: Database Connection Failed

**Symptoms**: Railway logs show `Can't reach database server`

**Solutions**:
1. Verify `DATABASE_URL` in Railway is correct
2. Use **Connection Pooler** URL from Supabase (port 6543, not 5432)
3. Check Supabase project is active (visit dashboard)
4. Ensure password in URL is URL-encoded (special chars like `@` become `%40`)
5. Test connection string with `psql` or database client

### Issue 3: File Upload Returns 403 Forbidden

**Symptoms**: Upload fails with "Access denied" or 403 error

**Solutions**:
1. Check `STORAGE_PROVIDER=supabase` in Railway
2. Verify Supabase Storage bucket policies allow public INSERT/SELECT
3. Confirm `SUPABASE_SERVICE_ROLE_KEY` is the **service_role** key (not anon)
4. Check bucket name matches `SUPABASE_STORAGE_BUCKET`
5. Review Railway logs for detailed error

### Issue 4: Workers Not Processing Jobs

**Symptoms**: Scheduled posts don't publish, jobs stuck in queue

**Solutions**:
1. Check Railway logs for worker service errors
2. Verify `REDIS_URL` is set correctly (`${{Redis.REDIS_URL}}`)
3. Ensure Redis service is running in Railway
4. Confirm PM2 is running all services (backend, workers, cron)
5. Check Railway logs for: `Worker ready and listening`

### Issue 5: CORS Errors in Browser Console

**Symptoms**: Browser shows "CORS policy blocked" or "No 'Access-Control-Allow-Origin'"

**Solutions**:
1. Add Vercel URL to Railway's `FRONTEND_URL` variable
2. Ensure `VERCEL_URL` is set (Railway auto-sets this for preview deployments)
3. Check backend logs for CORS configuration
4. Verify backend CORS includes Vercel domain (apps/backend/src/main.ts:36)
5. Redeploy Railway after changing variables

### Issue 6: Build Fails on Vercel

**Symptoms**: Vercel deployment fails during build

**Solutions**:
1. Check build logs for specific error
2. Verify `Build Command` includes monorepo path: `cd ../.. && pnpm install && pnpm build:frontend`
3. Ensure `Root Directory` is set to `apps/frontend`
4. Check for missing environment variables
5. Try clearing Vercel build cache (Settings → Clear Cache → Redeploy)

### Issue 7: Build Fails on Railway

**Symptoms**: Railway deployment fails during build

**Solutions**:
1. Check Railway logs for error details
2. Verify Node version (Railway uses Node 22+ by default)
3. Ensure build command includes all services: `pnpm build:backend && pnpm build:workers && pnpm build:cron`
4. Check for out of memory errors (Railway free tier has 512MB limit)
5. Upgrade Railway plan if memory issue persists

### Issue 8: Vercel Domain Not Resolving

**Symptoms**: Custom domain shows "domain not found" or DNS error

**Solutions**:
1. Verify DNS records at domain registrar
2. Use `dig` or `nslookup` to check DNS propagation:
   ```bash
   dig postiz.yourdomain.com
   ```
3. Wait up to 48 hours for full DNS propagation
4. Check Vercel domain status (should show green checkmark)
5. Ensure SSL certificate is issued (automatic, may take 10 minutes)

### Issue 9: Redis Connection Timeout

**Symptoms**: Railway logs show "Redis connection timeout" or "ECONNREFUSED"

**Solutions**:
1. Verify Redis service is running in Railway
2. Check `REDIS_URL` format: `redis://default:[password]@[host]:6379`
3. Ensure `${{Redis.REDIS_URL}}` reference is correct
4. Restart Redis service in Railway
5. Check Railway's internal networking is enabled

### Issue 10: Social Media OAuth Fails

**Symptoms**: OAuth redirect fails or shows "Invalid redirect URI"

**Solutions**:
1. Add Vercel URL to social platform's allowed redirect URIs
2. Format: `https://your-app.vercel.app/api/integrations/[platform]/callback`
3. Also add Railway backend URL as redirect URI
4. Verify API keys are correct in Railway variables
5. Check platform-specific docs for redirect URI configuration

---

## Monitoring & Maintenance

### View Logs

**Vercel**:
1. Go to project → **Deployments** → Click on a deployment
2. Click **"View Function Logs"** or **"Runtime Logs"**

**Railway**:
1. Click on service → **Logs** tab
2. Real-time logs stream automatically
3. Filter by service (backend, redis)

### Monitor Performance

**Vercel**:
- Dashboard → **Analytics** (free tier includes basic analytics)
- See page views, top pages, device breakdown

**Railway**:
- Service → **Metrics** tab
- CPU usage, memory usage, network traffic
- Set up usage alerts

**Supabase**:
- Dashboard → **Database** → **Reports**
- Database size, API requests, storage usage

### Scaling

**Vercel** (auto-scales):
- Free tier: 100GB bandwidth/month
- Upgrade to Pro ($20/month) for higher limits

**Railway**:
- Scales based on usage
- Free tier: $5 trial credit
- Paid: Pay only for resources used (~$0.000231/GB-s for memory)
- Set usage limits to prevent overages

**Supabase**:
- Free tier: 500MB database, 1GB storage, 2GB bandwidth
- Upgrade to Pro ($25/month) for 8GB database, 100GB storage

---

## Cost Breakdown

| Service | Tier | Monthly Cost | Notes |
|---------|------|--------------|-------|
| **Vercel** | Hobby | **$0** | 100GB bandwidth, unlimited deployments |
| **Railway** | Usage-based | **$5-10** | Backend + Workers + Redis |
| **Supabase** | Free | **$0** | 500MB DB, 1GB storage (upgrade at scale) |
| **Domain** (optional) | - | **~$1** | $12/year ÷ 12 months |
| **Total** | - | **$5-10/month** | (~$0.17-0.33/day) |

**Railway Breakdown** (typical small-scale usage):
- Backend API: ~$2-3/month
- Workers: ~$1-2/month
- Cron: ~$0.50/month
- Redis: ~$1-2/month
- **Total**: ~$5-10/month for low-traffic apps

**Scaling Costs**:
- At 1,000 users: ~$10-15/month
- At 10,000 users: ~$25-50/month (upgrade Supabase)
- At 100,000 users: ~$100-200/month (multiple Railway services, Supabase Pro)

---

## Backup & Recovery

### Database Backups (Supabase)

**Automatic Backups**:
- Free tier: 7 days of point-in-time recovery
- Pro tier: 30 days of point-in-time recovery

**Manual Export**:
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore (if needed)
psql $DATABASE_URL < backup.sql
```

### Code Backups

- ✅ **Git**: Your code is version-controlled on GitHub
- ✅ **Vercel**: Keeps deployment history (rollback anytime)
- ✅ **Railway**: Keeps deployment history (redeploy previous versions)

### Storage Backups (Supabase)

**Manual Backup**:
1. Supabase Dashboard → Storage → `postiz-uploads`
2. Download all files via Supabase CLI or API

**Alternative**: Use Supabase Storage replication (Pro tier)

---

## Next Steps

### 1. Configure Social Media APIs

Add API keys for platforms you want to support:

1. **Twitter/X**:
   - Get keys from: https://developer.twitter.com
   - Add `X_API_KEY` and `X_API_SECRET` to Railway

2. **LinkedIn**:
   - Get keys from: https://www.linkedin.com/developers
   - Add `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`

3. **Facebook/Instagram**:
   - Get keys from: https://developers.facebook.com
   - Add `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`

(See `.env.example` for all available platforms)

### 2. Enable AI Features

Add OpenAI API key for AI-powered content generation:

```bash
# In Railway variables
OPENAI_API_KEY=sk-...
```

Get key from: https://platform.openai.com

### 3. Set Up Email Notifications

Configure Resend for user activation emails:

1. Sign up at: https://resend.com (free tier: 3,000 emails/month)
2. Verify your domain
3. Add to Railway:
   ```bash
   RESEND_API_KEY=re_...
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   EMAIL_FROM_NAME=Postiz
   ```

### 4. Configure Stripe Payments (Optional)

For subscription features:

1. Sign up at: https://stripe.com
2. Get API keys from Dashboard
3. Add to Railway:
   ```bash
   STRIPE_PUBLISHABLE_KEY=pk_...
   STRIPE_SECRET_KEY=sk_...
   STRIPE_SIGNING_KEY=whsec_...
   ```

### 5. Set Up Error Tracking with Sentry

1. Sign up at: https://sentry.io (free tier available)
2. Create project
3. Add to both Vercel and Railway:
   ```bash
   SENTRY_ORG=your-org
   SENTRY_PROJECT=your-project
   SENTRY_AUTH_TOKEN=your-token
   ```

### 6. Add Custom Domain (See Phase 3)

### 7. Set Up Monitoring Alerts

**Railway**:
1. Go to Project Settings → Notifications
2. Add webhook or email for deployment alerts

**Vercel**:
1. Go to Settings → Integrations
2. Connect Slack or Discord for deployment notifications

---

## Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env` files to Git
- ✅ Use different `JWT_SECRET` for production vs development
- ✅ Rotate secrets periodically
- ✅ Use Vercel/Railway's secret management (already encrypted)

### 2. Database Security

- ✅ Use Supabase connection pooler (prevents connection exhaustion)
- ✅ Enable Row Level Security (RLS) on sensitive tables
- ✅ Regularly update database password
- ✅ Monitor for suspicious queries in Supabase dashboard

### 3. API Security

- ✅ Keep dependencies updated: `pnpm update`
- ✅ Enable rate limiting (already configured in backend)
- ✅ Use HTTPS only (Vercel/Railway enforce this)
- ✅ Validate all user inputs (already configured via ValidationPipe)

### 4. Access Control

- ✅ Don't share Railway/Vercel/Supabase passwords
- ✅ Use team accounts for multi-user access
- ✅ Enable 2FA on all accounts
- ✅ Review access logs regularly

---

## Rollback Procedure

If a deployment breaks your app:

### Rollback Vercel (Frontend)

1. Go to Vercel → **Deployments**
2. Find last working deployment (green checkmark)
3. Click **"⋯"** → **"Promote to Production"**
4. Deployment reverts in ~30 seconds

### Rollback Railway (Backend)

1. Go to Railway → Service → **Deployments**
2. Click on previous deployment
3. Click **"Redeploy"**
4. Service reverts in ~2-5 minutes

### Restore Database (if needed)

1. Supabase → **Database** → **Backups**
2. Select restore point (up to 7 days on free tier)
3. Click **"Restore"**
4. Wait for restoration to complete

---

## Getting Help

### Documentation

- **Postiz Docs**: https://docs.postiz.com
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs

### Community Support

- **Postiz Discord**: https://discord.postiz.com
- **GitHub Issues**: https://github.com/yourusername/real-estate-social/issues

### Paid Support

- **Vercel Support**: Available on Pro plan ($20/month)
- **Railway Support**: Email support@railway.app
- **Supabase Support**: Available on Pro plan ($25/month)

---

## Summary Checklist

### Initial Deployment

- [ ] Supabase project created with database and storage
- [ ] Railway project created with Redis and backend service
- [ ] Railway environment variables configured
- [ ] Railway backend deployed and accessible
- [ ] Vercel project created for frontend
- [ ] Vercel environment variables configured
- [ ] Vercel frontend deployed and accessible
- [ ] Railway `FRONTEND_URL` updated with Vercel URL
- [ ] Registration and login working
- [ ] File upload to Supabase Storage working
- [ ] Background workers processing jobs

### Optional Configuration

- [ ] Custom domain added to Vercel
- [ ] Custom domain added to Railway (API subdomain)
- [ ] DNS records updated and propagated
- [ ] SSL certificates issued
- [ ] Social media API keys added
- [ ] OpenAI API key added for AI features
- [ ] Email service (Resend) configured
- [ ] Stripe payment integration configured
- [ ] Sentry error tracking configured
- [ ] Monitoring alerts set up

---

**Congratulations!** Your Postiz application is now deployed and production-ready! 🎉

For questions or issues, refer to the [Troubleshooting](#troubleshooting) section or consult the documentation links above.
