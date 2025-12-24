# Local Setup Guide (No Docker)

This guide will help you set up and run the Postiz application locally without Docker, using Supabase as your cloud database and Supabase Storage for file uploads.

## Prerequisites

- **Node.js**: 22.12.0 or higher (as specified in package.json)
- **pnpm**: 10.6.1 (package manager)
- **Homebrew**: For installing PostgreSQL and Redis (macOS)
- **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)

## Table of Contents

1. [Install Local Dependencies](#1-install-local-dependencies)
2. [Set Up Supabase](#2-set-up-supabase)
3. [Configure Environment Variables](#3-configure-environment-variables)
4. [Initialize Database](#4-initialize-database)
5. [Install Node Dependencies](#5-install-node-dependencies)
6. [Run the Application](#6-run-the-application)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Install Local Dependencies

### Install Redis

Redis is required for job queues (BullMQ) and caching.

```bash
# Install Redis via Homebrew
brew install redis

# Start Redis service (runs in background)
brew services start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### Optional: Install PostgreSQL Locally

You can install PostgreSQL locally for development/testing, but we'll primarily use Supabase.

```bash
# Install PostgreSQL 17
brew install postgresql@17

# Start PostgreSQL service (optional, for local testing only)
brew services start postgresql@17

# Create a local database (optional)
createdb postiz-db-local
```

---

## 2. Set Up Supabase

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `postiz-app` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is fine for development
4. Click **"Create new project"** and wait ~2 minutes for setup

### 2.2 Get Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection String** section
3. Copy the **Connection pooling** URL (recommended for production):
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
4. **IMPORTANT**: Replace `[password]` with your actual database password
5. Save this connection string - you'll need it for `.env`

**Alternative**: You can also use the **Direct connection** URL for local development:
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 2.3 Get Supabase API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://[project-ref].supabase.co`
   - **Project API keys** → **service_role** (secret): This is your `SUPABASE_SERVICE_ROLE_KEY`
   - Keep these secure - never commit to git!

### 2.4 Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **"Create a new bucket"**
3. Configure the bucket:
   - **Name**: `postiz-uploads`
   - **Public bucket**: ✅ Checked (for public file access)
   - Click **"Create bucket"**

4. Configure bucket policies (for public access):
   - Click on the `postiz-uploads` bucket
   - Go to **Policies** tab
   - Click **"New Policy"**
   - Choose **"For full customization"** → **"Get started"**
   - Add a policy for SELECT (read):
     - **Policy name**: `Public Access`
     - **Allowed operation**: SELECT
     - **Target roles**: `public`
     - **Policy definition**: `true`
   - Click **"Review"** → **"Save policy"**

---

## 3. Configure Environment Variables

### 3.1 Create .env File

```bash
# Copy the example environment file
cp .env.example .env
```

### 3.2 Update Core Settings

Open `.env` in your editor and update these required settings:

```bash
# === Database (Supabase)
# Use the connection string from Supabase (Step 2.2)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"

# === Redis (Local)
REDIS_URL="redis://localhost:6379"

# === JWT Secret
# Generate a random string: openssl rand -base64 32
JWT_SECRET="your-random-jwt-secret-here-make-it-very-long-and-secure"

# === Application URLs
FRONTEND_URL="http://localhost:4200"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
BACKEND_INTERNAL_URL="http://localhost:3000"

# === Supabase Configuration
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-from-step-2.3"
SUPABASE_STORAGE_BUCKET="postiz-uploads"

# === Storage Provider
STORAGE_PROVIDER="supabase"

# === General Settings
IS_GENERAL="true"
```

### 3.3 Optional: Add Social Media API Keys

For social media integrations, add the relevant API keys:

```bash
# X/Twitter
X_API_KEY=""
X_API_SECRET=""

# LinkedIn
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""

# OpenAI (for AI features)
OPENAI_API_KEY=""

# ... add others as needed (see .env.example for full list)
```

### 3.4 Optional: Email Configuration

For user activation emails (if needed):

```bash
# Resend.com for email delivery
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM_ADDRESS="noreply@yourdomain.com"
EMAIL_FROM_NAME="Postiz"
```

If you don't set `RESEND_API_KEY`, users will be activated automatically (no email verification).

---

## 4. Initialize Database

### 4.1 Install Dependencies First

```bash
# Install all npm packages (this also runs prisma-generate automatically)
pnpm install
```

### 4.2 Push Database Schema to Supabase

```bash
# Push the Prisma schema to your Supabase database
pnpm prisma-db-push

# You should see output like:
# ✓ Prisma schema loaded from libraries/nestjs-libraries/src/database/prisma/schema.prisma
# ✓ The database is now in sync with the Prisma schema.
```

This command will:
- Read the Prisma schema from `libraries/nestjs-libraries/src/database/prisma/schema.prisma`
- Create all tables, indexes, and relations in your Supabase database
- No migration history is created (perfect for initial setup)

### 4.3 Verify Database Setup

You can verify the database is set up correctly in Supabase:

1. Go to your Supabase project → **Table Editor**
2. You should see all tables: `Organization`, `User`, `Post`, `Integration`, `Media`, etc.

Or use Prisma Studio:

```bash
# Opens a GUI to browse your database
pnpm prisma-studio
# Opens at http://localhost:5555
```

---

## 5. Install Node Dependencies

If you haven't already:

```bash
# Install all dependencies
pnpm install

# This will automatically:
# - Install all npm packages
# - Run postinstall hook (prisma-generate)
# - Generate Prisma client
```

---

## 6. Run the Application

### 6.1 Development Mode (All Services)

Run all services in parallel (recommended for development):

```bash
pnpm dev
```

This starts:
- **Backend** (NestJS API) on http://localhost:3000
- **Frontend** (Next.js) on http://localhost:4200
- **Workers** (BullMQ job processor)
- **Cron** (Scheduled tasks)
- **Extension** (Browser extension)

### 6.2 Run Individual Services

If you want to run services individually:

```bash
# Backend only
pnpm dev:backend

# Frontend only
pnpm dev:frontend

# Workers only
pnpm dev:workers

# Cron only
pnpm dev:cron
```

### 6.3 Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API Documentation** (Swagger): http://localhost:3000/api

### 6.4 First-Time Setup

1. Open http://localhost:4200
2. Create your first account (will be auto-activated if no email configured)
3. Connect social media accounts via Settings → Integrations
4. Start creating posts!

---

## 7. Production Build

To build for production:

```bash
# Build all apps
pnpm build

# Or build individually
pnpm build:backend
pnpm build:frontend
pnpm build:workers
pnpm build:cron

# Run production builds
pnpm start:prod:backend    # Port 3000
pnpm start:prod:frontend   # Port 4200
pnpm start:prod:workers
pnpm start:prod:cron
```

---

## 8. Troubleshooting

### Redis Connection Issues

**Error**: `ECONNREFUSED localhost:6379`

**Solution**:
```bash
# Check if Redis is running
redis-cli ping

# If not running, start it
brew services start redis

# Check Redis logs
brew services info redis
```

### Database Connection Issues

**Error**: `Can't reach database server`

**Solutions**:
1. Verify your `DATABASE_URL` is correct (check password, project-ref, region)
2. Make sure your Supabase project is active (check dashboard)
3. Try using the **Direct connection** URL instead of pooler:
   ```bash
   # In .env, change from pooler to direct:
   DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   ```
4. Check if your IP is allowed (Supabase Free tier allows all IPs by default)

### Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
# Manually generate Prisma client
pnpm prisma-generate

# Or reinstall dependencies
rm -rf node_modules
pnpm install
```

### Supabase Storage Upload Fails

**Error**: `Row level security policy violation` or `403 Forbidden`

**Solution**:
1. Go to Supabase → **Storage** → `postiz-uploads` → **Policies**
2. Make sure you have policies for INSERT, SELECT, UPDATE, DELETE
3. For development, you can temporarily disable RLS:
   - Go to **Storage** → `postiz-uploads` → **Configuration**
   - Toggle off "Enable RLS" (not recommended for production)

### Port Already in Use

**Error**: `Port 3000 is already in use` or `Port 4200 is already in use`

**Solution**:
```bash
# Find process using the port
lsof -ti:3000
lsof -ti:4200

# Kill the process
kill -9 <PID>

# Or change ports in .env:
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:4201"
```

### Environment Variables Not Loading

**Solution**:
```bash
# Make sure .env is in the root directory
ls -la .env

# Restart the dev server after changing .env
# Stop with Ctrl+C and run again:
pnpm dev
```

### File Upload Not Working

**Checklist**:
1. ✓ `STORAGE_PROVIDER="supabase"` in `.env`
2. ✓ `SUPABASE_URL` is correct
3. ✓ `SUPABASE_SERVICE_ROLE_KEY` is the **service_role** key (not anon key)
4. ✓ `SUPABASE_STORAGE_BUCKET="postiz-uploads"` matches your bucket name
5. ✓ Bucket is public or has correct RLS policies
6. ✓ Restart backend after changing `.env`

### Node Version Issues

**Error**: `The engine "node" is incompatible`

**Solution**:
```bash
# Check your Node version
node --version

# Should be >= 22.12.0
# If not, use nvm to install correct version:
nvm install 22.12.0
nvm use 22.12.0

# Or use the specified version in package.json
```

---

## 9. Useful Commands

### Database Management

```bash
# Generate Prisma client
pnpm prisma-generate

# Push schema changes to database
pnpm prisma-db-push

# Pull database schema (from existing database)
pnpm prisma-db-pull

# Open Prisma Studio (database GUI)
pnpm prisma-studio

# Reset database (⚠️ DELETES ALL DATA)
pnpm prisma-reset
```

### Redis Management

```bash
# Connect to Redis CLI
redis-cli

# Inside Redis CLI:
> ping                    # Check connection
> keys *                  # List all keys
> flushall                # Clear all data (⚠️ use carefully)
> exit                    # Exit CLI
```

### Viewing Logs

```bash
# Backend logs are shown in terminal when running pnpm dev
# For individual service logs:
pnpm dev:backend    # Shows only backend logs
pnpm dev:workers    # Shows only worker logs

# Redis logs
brew services info redis
tail -f /opt/homebrew/var/log/redis.log
```

---

## 10. Migrating from Docker Setup

If you were previously using Docker and want to migrate:

### Option 1: Fresh Start

1. Stop Docker containers: `docker-compose -f docker-compose.dev.yaml down`
2. Follow this guide from scratch (creates new Supabase database)
3. You'll lose local data, but get cloud database benefits

### Option 2: Migrate Data

1. Export data from Docker PostgreSQL:
   ```bash
   docker exec postiz-postgres pg_dump -U postiz-local postiz-db-local > backup.sql
   ```

2. Set up Supabase (Steps 2-4 above)

3. Import to Supabase using their CLI or dashboard:
   ```bash
   # Install Supabase CLI
   brew install supabase/tap/supabase

   # Login
   supabase login

   # Link to your project
   supabase link --project-ref [your-project-ref]

   # Import data
   psql $DATABASE_URL < backup.sql
   ```

---

## 11. Next Steps

### Production Deployment

For production deployment, consider:

1. **Environment Variables**: Use proper secrets management
2. **Database**: Upgrade Supabase plan for better performance
3. **Redis**: Use managed Redis (Upstash, Redis Cloud, etc.)
4. **Monitoring**: Set up Sentry error tracking (already configured)
5. **File Storage**: Consider CDN for Supabase Storage

### Adding Social Media Integrations

Each social platform requires OAuth credentials:

1. Go to the platform's developer portal (e.g., Twitter Developer Portal)
2. Create an app and get API keys
3. Add keys to `.env`
4. Restart backend
5. Connect accounts via frontend Settings → Integrations

See [.env.example](.env.example) for all available integrations.

### Enable AI Features

To use AI-powered content generation:

1. Get OpenAI API key from https://platform.openai.com
2. Add to `.env`:
   ```bash
   OPENAI_API_KEY="sk-..."
   ```
3. Restart backend
4. AI features will be available in post editor

---

## 12. Development Tips

### Hot Reload

All services support hot reload in development mode:
- Backend: Automatically restarts on file changes
- Frontend: Hot module replacement (HMR)
- Workers/Cron: Restart on changes

### Code Structure

Understanding the monorepo:
```
apps/                     # Deployable applications
├── backend/             # NestJS API
├── frontend/            # Next.js web app
├── workers/             # BullMQ job processor
├── cron/                # Scheduled tasks
└── extension/           # Browser extension

libraries/               # Shared code
├── nestjs-libraries/    # Backend shared modules
├── react-shared-libraries/  # Frontend components
└── helpers/             # Common utilities
```

### Adding Dependencies

```bash
# Add to root workspace
pnpm add <package>

# Add to specific app
pnpm --filter ./apps/backend add <package>

# Add to library
pnpm --filter ./libraries/nestjs-libraries add <package>
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage
```

---

## 13. Support & Resources

- **Documentation**: http://docs.postiz.com
- **GitHub Issues**: https://github.com/phillipshepard1/real-estate-social/issues
- **Discord**: Check NEXT_PUBLIC_DISCORD_SUPPORT in .env.example
- **Supabase Docs**: https://supabase.com/docs

---

## Quick Start Checklist

- [ ] Install Redis: `brew install redis && brew services start redis`
- [ ] Create Supabase project at supabase.com
- [ ] Get Supabase connection string and API keys
- [ ] Create storage bucket `postiz-uploads` with public access
- [ ] Copy `.env.example` to `.env`
- [ ] Update `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- [ ] Set `STORAGE_PROVIDER="supabase"`
- [ ] Run `pnpm install`
- [ ] Run `pnpm prisma-db-push`
- [ ] Run `pnpm dev`
- [ ] Open http://localhost:4200 and create an account

**That's it! You're now running Postiz locally without Docker, powered by Supabase!**
