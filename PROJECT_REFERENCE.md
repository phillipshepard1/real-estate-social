# Postiz Project Reference Guide

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)
- [Database Schema](#database-schema)
- [Key Entry Points](#key-entry-points)
- [Environment Configuration](#environment-configuration)
- [Core Features](#core-features)
- [Social Media Integrations](#social-media-integrations)
- [API Structure](#api-structure)
- [Development Workflow](#development-workflow)
- [Important Files Reference](#important-files-reference)

---

## Project Overview

**Name**: Postiz (formerly "gitroom" in legacy code)
**Repository**: https://github.com/phillipshepard1/real-estate-social.git
**Type**: Open-source social media scheduling and management platform
**Purpose**: AI-powered alternative to Buffer, Hypefury, and Twitter Hunter

### What It Does
- Schedule posts across 30+ social media platforms
- AI-powered content generation and optimization
- Team collaboration with RBAC
- Marketplace for buying/selling posts and agency services
- Analytics and performance tracking
- API integration with N8N, Make.com, Zapier
- Browser extension for quick posting

### Supported Platforms (30+)
X/Twitter, Bluesky, Mastodon, Discord, LinkedIn, Instagram, Facebook, TikTok, YouTube, Pinterest, Threads, Dribbble, Reddit, Slack, Medium, Dev.to, Hashnode, and more.

---

## Architecture

### Monorepo Structure (NX)
```
real-estate-social/
├── apps/                    # Deployable applications
│   ├── backend/            # NestJS API (port 3000)
│   ├── frontend/           # Next.js web app (port 4200)
│   ├── workers/            # BullMQ job processor
│   ├── cron/               # Scheduled tasks
│   ├── extension/          # Browser extension
│   ├── sdk/                # Node.js SDK (@postiz/node)
│   └── commands/           # CLI tools
├── libraries/              # Shared code
│   ├── nestjs-libraries/   # Backend shared modules
│   ├── react-shared-libraries/ # Frontend shared components
│   └── helpers/            # Common utilities
└── var/                    # Docker/deployment scripts
```

### Service Architecture
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│  Database   │
│  (Next.js)  │     │  (NestJS)   │     │ (PostgreSQL)│
│  Port 4200  │     │  Port 3000  │     └─────────────┘
└─────────────┘     └─────────────┘              │
                           │                     │
                           ▼                     │
                    ┌─────────────┐             │
                    │    Redis    │◀────────────┘
                    │ (Cache/Jobs)│
                    └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
            ┌─────────────┐ ┌─────────────┐
            │   Workers   │ │    Cron     │
            │  (BullMQ)   │ │ (Schedule)  │
            └─────────────┘ └─────────────┘
```

---

## Technology Stack

### Frontend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2.35 | React framework (App Router) |
| React | 18.3.1 | UI library |
| TypeScript | 5.5.4 | Type safety |
| Tailwind CSS | 3.4.17 | Styling |
| Mantine UI | 5.10.5 | Component library |
| TipTap | 3.0.6 | Rich text editor |
| Uppy | 4.x | File upload handling |
| React Hook Form | 7.58.1 | Form management |
| SWR | 2.2.5 | Data fetching |
| Zustand | 5.0.5 | State management |
| i18next | 25.2.1 | Internationalization |
| Sentry | Latest | Error tracking |

### Backend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | 10.0.2 | Node.js framework |
| Prisma | 6.5.0 | ORM |
| PostgreSQL | Latest | Primary database |
| Redis | 4.6.12 | Cache/message broker |
| BullMQ | 5.12.12 | Job queue system |
| OpenAI SDK | Latest | AI integration |
| Langchain | Latest | LLM orchestration |
| Mastra | Latest | AI agent framework |
| Stripe | Latest | Payment processing |
| Resend | Latest | Email service |
| AWS S3 | Latest | File storage |
| Cloudflare R2 | Latest | Alternative storage |

### DevOps & Tools
- **Package Manager**: pnpm 10.6.1
- **Node.js**: 22.12.0+ required
- **Monorepo**: NX
- **Containerization**: Docker
- **CI/CD**: GitHub Actions (Dependabot configured)

---

## Directory Structure

### Backend (`apps/backend/src/`)
```
backend/src/
├── main.ts                 # Entry point, port 3000
├── app.module.ts          # Root module
├── api/
│   ├── api.module.ts      # Authenticated API routes
│   └── routes/            # 22 feature controllers
│       ├── analytics.controller.ts
│       ├── autopost.controller.ts
│       ├── billing.controller.ts
│       ├── integration.controller.ts
│       ├── marketplace.controller.ts
│       ├── media.controller.ts
│       ├── messages.controller.ts
│       ├── notifications.controller.ts
│       ├── orders.controller.ts
│       ├── organizations.controller.ts
│       ├── posts.controller.ts
│       ├── settings.controller.ts
│       ├── tags.controller.ts
│       ├── trending.controller.ts
│       ├── users.controller.ts
│       └── ...
├── services/
│   ├── auth/              # Authentication, OAuth, JWT
│   │   ├── auth.service.ts
│   │   ├── permissions.ability.ts
│   │   └── strategies/    # Passport strategies
│   └── ...
└── public-api/            # Public API endpoints
    └── routes/
```

### Frontend (`apps/frontend/src/`)
```
frontend/src/
├── app/                   # Next.js App Router
│   ├── (app)/            # Main app layout
│   │   ├── layout.tsx    # Authenticated layout
│   │   ├── launches/     # Post scheduling
│   │   ├── analytics/    # Performance metrics
│   │   ├── marketplace/  # Marketplace features
│   │   ├── messages/     # Messaging
│   │   ├── settings/     # User/org settings
│   │   └── billing/      # Subscription management
│   ├── (extension)/      # Browser extension layout
│   └── auth/             # Authentication pages
├── components/           # React components
│   ├── agents/
│   ├── analytics/
│   ├── auth/
│   ├── launches/         # Post creation/scheduling
│   ├── marketplace/
│   ├── media/
│   ├── notifications/
│   ├── onboarding/
│   ├── settings/
│   └── ...
└── helpers/              # Utility functions
```

### Shared Libraries (`libraries/`)
```
libraries/
├── nestjs-libraries/src/
│   ├── database/
│   │   └── prisma/
│   │       └── schema.prisma      # 881 lines, core data model
│   ├── integrations/
│   │   └── social/                # 30+ provider implementations
│   │       ├── x.provider.ts
│   │       ├── linkedin.provider.ts
│   │       ├── instagram.provider.ts
│   │       ├── tiktok.provider.ts
│   │       ├── facebook.provider.ts
│   │       ├── youtube.provider.ts
│   │       └── ...
│   ├── dtos/                      # Data Transfer Objects
│   ├── services/
│   │   ├── stripe.service.ts
│   │   ├── email.service.ts
│   │   └── trending.service.ts
│   ├── openai/                    # OpenAI wrapper
│   ├── agent/                     # AI agent framework
│   ├── chat/                      # Chat/MCP integration
│   ├── videos/                    # Video processing
│   ├── upload/                    # File upload
│   ├── bull-mq-transport-new/    # Custom BullMQ transport
│   └── redis/                     # Redis utilities
├── react-shared-libraries/src/
│   ├── form/                      # Form components
│   ├── helpers/                   # React utilities
│   ├── sentry/                    # Error tracking
│   └── translation/               # i18n helpers
└── helpers/src/
    ├── auth/
    ├── configuration/
    ├── decorators/
    └── swagger/                   # API documentation
```

### Workers (`apps/workers/src/`)
```
workers/src/
├── main.ts                # BullMQ microservice entry
└── app/
    ├── posts.controller.ts    # Post publishing jobs
    └── plugs.controller.ts    # Plugin/integration jobs
```

### Cron (`apps/cron/src/`)
```
cron/src/
├── main.ts                # Scheduled tasks entry
└── tasks/
    ├── check.missing.queues.ts      # Queue health monitoring
    └── post.now.pending.queues.ts   # Process pending posts
```

### Extension (`apps/extension/src/`)
```
extension/src/
├── pages/                 # Extension UI pages
├── providers/             # React context providers
├── utils/                 # Browser utilities
└── locales/               # i18n translations
```

### SDK (`apps/sdk/src/`)
```
sdk/src/
└── index.ts               # Postiz API client class
    Methods:
    - createPost()
    - listPosts()
    - uploadFile()
    - getIntegrations()
    - deletePost()
```

---

## Database Schema

### Core Models (Prisma)

**Organization**
- Primary business entity
- Has many: Users, Integrations, Posts, Subscriptions
- Fields: id, name, createdAt, updatedAt

**User**
- User accounts with multi-provider auth
- Relations: Organizations (many-to-many), Posts, Media
- Fields: id, email, name, password, provider, timezone, language

**UserOrganization**
- Junction table with RBAC
- Roles: USER, ADMIN, OWNER
- Fields: userId, organizationId, role, disabled

**Integration**
- Connected social media accounts
- Types: twitter, linkedin, instagram, facebook, etc.
- Fields: id, organizationId, type, token, refreshToken, name, picture
- Relations: Posts (many-to-many)

**Post**
- Scheduled/published content
- States: DRAFT, IN_PROGRESS, SCHEDULE, PUBLISHED, ERROR
- Fields: id, organizationId, content, settings (JSON), publishDate, state
- Relations: Tags, Integrations, Media

**Media**
- File storage records
- Fields: id, organizationId, url, path, type
- Relations: Posts

**Subscription**
- Billing records
- Fields: id, organizationId, subscriptionId (Stripe), status, cancelAt
- Relations: Organization, Customer

**Customer**
- Payment customer data
- Fields: id, organizationId, customerId (Stripe)

**Credits**
- Account credit system
- Fields: id, organizationId, credits, totalCredits

**Marketplace Models**
- Messages, MessagesGroup
- Orders, OrderItems
- MarketplaceLikes, MarketplaceComments
- ThirdParty (marketplace listings)

**AutoPost**
- Automation rules
- Fields: id, organizationId, schedule, integrations

**SocialMediaAgency**
- Agency profiles for marketplace
- Fields: id, organizationId, name, description, website

**Webhooks/Integrations**
- Event delivery system
- Fields: id, organizationId, url, events

**Mastra Framework (AI)**
- MastraSpans, MastraMessages, MastraThreads
- MastraTraces, MastraWorkflowRuns, MastraWorkflowSteps
- AI agent execution tracking

**Tags/TagsPosts**
- Post categorization system

**Trending**
- Trending topics/content
- Fields: id, date, trend (JSON)

**Errors**
- Error logging
- Fields: id, date, error (JSON)

---

## Key Entry Points

### Backend Entry
**File**: `apps/backend/src/main.ts`
```typescript
// Port 3000
// Initializes:
- NestJS app
- Swagger API docs (/api)
- Global exception filters
- CORS configuration
- Authentication middleware
- Request validation
```

**Module**: `apps/backend/src/app.module.ts`
```typescript
// Imports:
- DatabaseModule (Prisma)
- AuthModule
- ApiModule (authenticated routes)
- PublicApiModule
- WorkersModule
- AgentModule
- ThrottlerModule (rate limiting)
- ChatModule
- ScheduleModule
```

### Frontend Entry
**File**: `apps/frontend/src/app/(app)/layout.tsx`
```typescript
// Port 4200
// Provides:
- Authentication wrapper
- Layout components
- Navigation
- Notification system
```

**Config**: `apps/frontend/next.config.js`
```javascript
// Configuration:
- Standalone output for Docker
- Image optimization disabled
- Transpiles shared libraries
- Custom webpack config
```

### Workers Entry
**File**: `apps/workers/src/main.ts`
```typescript
// BullMQ microservice
// Controllers:
- PostsController (job processing)
- PlugsController (plugin jobs)
```

### Cron Entry
**File**: `apps/cron/src/main.ts`
```typescript
// Scheduled tasks via @nestjs/schedule
// Tasks:
- Queue health checks
- Pending post processing
```

---

## Environment Configuration

### Required Variables (120+ total)

**Core Services**
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/postiz

# Redis
REDIS_URL=redis://localhost:6379

# URLs
FRONTEND_URL=http://localhost:4200
BACKEND_URL=http://localhost:3000
BACKEND_INTERNAL_URL=http://localhost:3000
```

**Authentication**
```bash
# JWT
JWT_SECRET=your-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

**Storage**
```bash
# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ACCESS_KEY=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_BUCKETNAME=
CLOUDFLARE_BUCKET_URL=

# Or Local Storage
STORAGE_PROVIDER=local
UPLOAD_DIRECTORY=./public/uploads
```

**AI Services**
```bash
OPENAI_API_KEY=
```

**Email**
```bash
RESEND_API_KEY=
```

**Payments**
```bash
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

**Social Media APIs**
```bash
# X/Twitter
X_API_KEY=
X_API_SECRET=

# LinkedIn
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Reddit
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=

# TikTok
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

# ... and 20+ more platforms
```

**Short Links**
```bash
# Dub.co
IS_GENERAL_DUB=true
DUB_API_KEY=

# Short.io
SHORT_IO_DOMAIN=
SHORT_IO_API_KEY=

# Kutt
KUTT_DOMAIN=
KUTT_API_KEY=
```

**Generic OAuth**
```bash
GENERIC_OAUTH_PROVIDER=
GENERIC_OAUTH_AUTH_URL=
GENERIC_OAUTH_TOKEN_URL=
GENERIC_OAUTH_CLIENT_ID=
GENERIC_OAUTH_CLIENT_SECRET=
GENERIC_OAUTH_REDIRECT_URI=
```

---

## Core Features

### 1. Multi-Platform Posting
**Location**: `apps/backend/src/api/routes/posts.controller.ts`

Features:
- Create drafts
- Schedule posts for future
- Immediate publishing
- Bulk operations
- Cross-posting to multiple platforms
- Media attachment (images, videos)
- Rich text formatting
- Hashtag support
- Thread/carousel support

**Data Flow**:
```
User creates post → Backend validates → Saves to DB as SCHEDULE
→ Worker picks up job → Publishes to platforms → Updates state to PUBLISHED
```

### 2. AI Content Generation
**Location**: `libraries/nestjs-libraries/src/openai/`

Features:
- Content generation from prompts
- Content optimization/rewriting
- Hashtag suggestions
- Caption generation
- Content extraction from URLs
- Multi-language support

**Integration Points**:
- OpenAI Service wrapper
- Langchain for LLM orchestration
- Mastra framework for agents
- Chat interface with MCP protocol

### 3. Team Collaboration
**Location**: `apps/backend/src/api/routes/organizations.controller.ts`

Features:
- Organization/workspace creation
- User invitations
- Role-Based Access Control (RBAC)
  - OWNER: Full control
  - ADMIN: Management access
  - USER: Standard access
- Activity tracking
- Comments on posts
- Notifications

### 4. Marketplace
**Location**: `apps/frontend/src/components/marketplace/`

Features:
- Buy/sell pre-made posts
- Agency directory
- Post templates
- Real estate content
- Messaging system
- Order processing
- Reviews/ratings

**Models**:
- ThirdParty (listings)
- Orders/OrderItems
- Messages/MessagesGroup
- MarketplaceLikes, MarketplaceComments

### 5. Analytics & Tracking
**Location**: `apps/backend/src/api/routes/analytics.controller.ts`

Features:
- Post performance metrics
- Platform-specific analytics
- Engagement tracking (likes, shares, comments)
- Trending topics
- Audience insights
- Custom date ranges

### 6. Billing & Subscriptions
**Location**: `apps/backend/src/api/routes/billing.controller.ts`

Features:
- Stripe integration
- Subscription plans
- Credit system
- Discount codes
- Crypto payments (Nowpayments)
- Usage tracking
- Invoice management

**Flow**:
```
User selects plan → Stripe checkout → Webhook confirms → Update subscription
→ Grant credits → Enable features
```

### 7. Public API
**Location**: `apps/backend/src/public-api/`

Features:
- RESTful API
- Rate limiting
- API key authentication
- Webhook delivery
- Integration with:
  - N8N
  - Make.com
  - Zapier

**SDK**: `@postiz/node` package

### 8. Browser Extension
**Location**: `apps/extension/`

Features:
- Quick post creation
- Current page sharing
- Screenshot capture
- Media upload
- Platform selection

### 9. Automation (AutoPost)
**Location**: `apps/backend/src/api/routes/autopost.controller.ts`

Features:
- Scheduled posting rules
- Content rotation
- RSS feed integration
- Conditional posting

---

## Social Media Integrations

### Provider Architecture
**Base**: `libraries/nestjs-libraries/src/integrations/social/social.abstract.ts`

All providers extend `SocialAbstract` and implement `SocialProvider` interface.

### Provider Methods
```typescript
interface SocialProvider {
  // Authentication
  authenticate(): Promise<AuthTokenDetails>
  refreshToken(refreshToken: string): Promise<AuthTokenDetails>

  // Content Publishing
  post(details: PostDetails<any>): Promise<PostResponse[]>

  // Analytics (optional)
  analytics?(): Promise<any>

  // Account Info
  getAccountInformation(): Promise<AccountInfo>
}
```

### Implemented Providers (30+)

**Major Platforms**:
1. **X (Twitter)** - `x.provider.ts`
   - OAuth 2.0
   - Threads support
   - Media upload
   - Analytics API

2. **LinkedIn** - `linkedin.provider.ts`
   - OAuth 2.0
   - Personal/Company pages
   - Image/video posts
   - Analytics

3. **Instagram** - `instagram.provider.ts`
   - Facebook Graph API
   - Story/Feed posts
   - Carousel support

4. **Facebook** - `facebook.provider.ts`
   - Graph API
   - Pages/Groups
   - Media posts

5. **TikTok** - `tiktok.provider.ts`
   - OAuth 2.0
   - Video upload
   - Content posting API

6. **YouTube** - `youtube.provider.ts`
   - OAuth 2.0
   - Video upload
   - Community posts

**Alternative Platforms**:
- Bluesky, Mastodon, Threads
- Discord, Slack
- Reddit
- Pinterest
- Dribbble
- Medium, Dev.to, Hashnode

**Integration Configuration**:
Each integration stored in `Integration` model:
```typescript
{
  type: 'twitter' | 'linkedin' | ...,
  token: string,           // Access token
  refreshToken: string,    // Refresh token
  expiresIn: number,      // Token expiry
  name: string,           // Account name
  picture: string,        // Profile picture
  username: string,       // Handle/username
  internalId: string,     // Platform user ID
  profile: JSON           // Additional metadata
}
```

---

## API Structure

### Authenticated API Routes
**Base**: `apps/backend/src/api/routes/`

| Controller | Endpoint | Purpose |
|-----------|----------|---------|
| analytics.controller | `/analytics` | Performance metrics |
| autopost.controller | `/autopost` | Automation rules |
| billing.controller | `/billing` | Subscriptions |
| copilot.controller | `/copilot` | AI assistant |
| integration.controller | `/integrations` | Social account management |
| launches.controller | `/launches` | Post management |
| marketplace.controller | `/marketplace` | Marketplace listings |
| media.controller | `/media` | File uploads |
| messages.controller | `/messages` | Messaging |
| notifications.controller | `/notifications` | User notifications |
| orders.controller | `/orders` | Marketplace orders |
| organizations.controller | `/organizations` | Workspace management |
| posts.controller | `/posts` | Post CRUD |
| settings.controller | `/settings` | User/org settings |
| social-media-agency.controller | `/agencies` | Agency profiles |
| tags.controller | `/tags` | Tag management |
| trending.controller | `/trending` | Trending content |
| users.controller | `/users` | User management |
| webhooks.controller | `/webhooks` | Webhook configuration |

### Public API Routes
**Base**: `apps/backend/src/public-api/routes/`

Protected by API key authentication:
- POST `/api/v1/posts` - Create post
- GET `/api/v1/posts` - List posts
- DELETE `/api/v1/posts/:id` - Delete post
- POST `/api/v1/upload` - Upload file
- GET `/api/v1/integrations` - List integrations

### API Documentation
**Swagger**: Available at `http://localhost:3000/api`

---

## Development Workflow

### Initial Setup
```bash
# Clone repository
git clone https://github.com/phillipshepard1/real-estate-social.git
cd real-estate-social

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Setup database
docker-compose up -d postgres redis
pnpm prisma:migrate
pnpm prisma:generate

# Start development
pnpm dev
```

### Development Commands
```bash
# Start all services
pnpm dev

# Start individual apps
pnpm nx serve backend          # Port 3000
pnpm nx serve frontend         # Port 4200
pnpm nx serve workers
pnpm nx serve cron

# Build
pnpm build

# Database
pnpm prisma:migrate            # Run migrations
pnpm prisma:generate          # Generate Prisma client
pnpm prisma:studio            # Database GUI

# Linting/Formatting
pnpm lint
pnpm format

# Testing
pnpm test
```

### Docker Setup
```bash
# Start full stack
docker-compose up -d

# Services:
- PostgreSQL (port 5432)
- Redis (port 6379)
- PgAdmin (port 5050)
- RedisInsight (port 8001)
```

### Database Migrations
```bash
# Create migration
pnpm prisma migrate dev --name migration_name

# Apply migrations
pnpm prisma migrate deploy

# Reset database (dev only)
pnpm prisma migrate reset
```

### Adding New Social Provider
1. Create provider file in `libraries/nestjs-libraries/src/integrations/social/`
2. Extend `SocialAbstract`
3. Implement required methods:
   - `authenticate()`
   - `refreshToken()`
   - `post()`
   - `getAccountInformation()`
4. Register in integration manager
5. Add environment variables
6. Update Prisma schema if needed

---

## Important Files Reference

### Configuration Files
```
tsconfig.base.json              # TypeScript path aliases
pnpm-workspace.yaml            # Workspace configuration
nx.json                        # NX monorepo config
.env.example                   # Environment variable template
docker-compose.yml             # Docker services
```

### Database
```
libraries/nestjs-libraries/src/database/prisma/schema.prisma
libraries/nestjs-libraries/src/database/prisma/migrations/
```

### Authentication
```
apps/backend/src/services/auth/auth.service.ts
apps/backend/src/services/auth/permissions.ability.ts
apps/backend/src/services/auth/strategies/
```

### Social Integrations
```
libraries/nestjs-libraries/src/integrations/social/social.abstract.ts
libraries/nestjs-libraries/src/integrations/social/*.provider.ts
libraries/nestjs-libraries/src/integrations/integration.manager.ts
```

### AI Services
```
libraries/nestjs-libraries/src/openai/openai.service.ts
libraries/nestjs-libraries/src/agent/
libraries/nestjs-libraries/src/chat/
```

### Job Processing
```
apps/workers/src/app/posts.controller.ts
apps/cron/src/tasks/post.now.pending.queues.ts
libraries/nestjs-libraries/src/bull-mq-transport-new/
```

### Frontend Components
```
apps/frontend/src/components/launches/     # Post creation UI
apps/frontend/src/components/analytics/    # Analytics dashboard
apps/frontend/src/components/marketplace/  # Marketplace UI
apps/frontend/src/components/settings/     # Settings pages
```

### API Documentation
```
libraries/helpers/src/swagger/               # Swagger config
apps/backend/src/main.ts                    # Swagger setup
```

---

## Key Design Patterns

### Authentication Flow
```
1. User requests OAuth → Backend redirects to provider
2. Provider redirects back with code → Backend exchanges for token
3. Backend stores token in Integration model
4. Backend returns JWT to frontend
5. Frontend includes JWT in all requests
6. Backend validates JWT and checks permissions
```

### Post Publishing Flow
```
1. User creates post in frontend
2. Backend validates and saves as DRAFT/SCHEDULE
3. Backend creates BullMQ job
4. Worker picks up job
5. Worker calls integration provider.post()
6. Provider publishes to platform
7. Worker updates post state to PUBLISHED
8. Frontend polls or receives webhook update
```

### Integration Provider Pattern
```
All providers implement standard interface:
- authenticate() - Get OAuth tokens
- refreshToken() - Refresh expired tokens
- post() - Publish content
- getAccountInformation() - Get profile data

Providers handle platform-specific:
- API endpoints
- Rate limiting
- Media upload
- Error handling
```

### Multi-Tenancy
```
Organization is the tenant unit:
- Users belong to multiple Organizations (UserOrganization)
- All resources scoped to Organization
- RBAC enforced at Organization level
- Subscriptions/billing per Organization
```

---

## Performance Considerations

### Caching Strategy
- Redis for:
  - Session storage
  - Job queues (BullMQ)
  - Rate limiting
  - Trending data cache

### Job Queue (BullMQ)
- Async post publishing
- Retry logic for failed posts
- Priority queuing
- Job status tracking

### Database Optimization
- Indexes on frequently queried fields
- Proper relations with foreign keys
- JSON fields for flexible metadata
- Soft deletes with deletedAt

### Frontend Optimization
- SWR for data fetching with cache
- Code splitting via Next.js
- Image optimization disabled (configured)
- Standalone build for smaller Docker images

---

## Security Features

### Authentication
- JWT-based sessions
- OAuth 2.0 for social logins
- Password hashing (bcrypt)
- Multi-provider support

### Authorization
- Role-Based Access Control (RBAC)
- Permission system via CASL
- Organization-level scoping
- API key authentication for public API

### Rate Limiting
- Throttler module (NestJS)
- Per-user/per-IP limits
- API endpoint protection

### Data Protection
- Environment variable validation
- Secure token storage
- CORS configuration
- Input validation
- SQL injection protection (Prisma)

---

## Monitoring & Debugging

### Error Tracking
- Sentry integration (frontend & backend)
- Error model in database
- Comprehensive logging

### API Documentation
- Swagger UI at `/api`
- Auto-generated from decorators
- Request/response examples

### Development Tools
- PgAdmin for PostgreSQL
- RedisInsight for Redis
- Prisma Studio for database GUI
- NX console for monorepo management

---

## External Services Integration

### Required Services
1. **PostgreSQL** - Primary database
2. **Redis** - Cache and job queue

### Optional Services
1. **OpenAI** - AI content generation
2. **Stripe** - Payment processing
3. **Resend** - Email delivery
4. **AWS S3 / Cloudflare R2** - File storage
5. **Sentry** - Error tracking
6. **Short link services** - Dub, Short.io, Kutt

### Social Media APIs
Requires credentials for each platform you want to support:
- X (Twitter), LinkedIn, Facebook, Instagram
- TikTok, YouTube, Pinterest
- Reddit, Discord, Slack
- And 20+ more platforms

---

## Troubleshooting Common Issues

### Database Connection
- Verify DATABASE_URL format
- Check PostgreSQL is running
- Run migrations: `pnpm prisma:migrate`

### Redis Connection
- Verify REDIS_URL
- Check Redis is running
- Test with: `redis-cli ping`

### OAuth Issues
- Verify callback URLs match provider settings
- Check client ID/secret are correct
- Ensure FRONTEND_URL is accessible

### Build Errors
- Clear NX cache: `pnpm nx reset`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`
- Regenerate Prisma: `pnpm prisma:generate`

### Worker Not Processing Jobs
- Check Redis connection
- Verify workers app is running
- Check BullMQ dashboard
- Review worker logs

---

## Contributing Guidelines

### Branching Strategy
- Fork repository
- Create feature branch
- Make changes
- Submit pull request

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Follow existing patterns

### Testing
- Write unit tests for services
- Integration tests for APIs
- E2E tests for critical flows

---

## Useful NX Commands

```bash
# Generate new library
nx g @nx/node:library my-library

# Generate new application
nx g @nx/nest:application my-app

# View dependency graph
nx graph

# Run affected commands
nx affected:test
nx affected:build

# Clear cache
nx reset
```

---

## Environment-Specific Notes

### Development
- All services run locally
- Hot reload enabled
- Debug logging
- Mock payment/email services

### Production
- Environment variables from secrets
- Logging to external service
- Database connection pooling
- CDN for static assets
- Horizontal scaling for workers

---

## License & Credits

**License**: Apache 2.0
**Original Project**: Postiz (formerly Gitroom)
**Contributors**: Open source community

---

## Quick Reference: Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 4200 | http://localhost:4200 |
| Backend | 3000 | http://localhost:3000 |
| Swagger API | 3000 | http://localhost:3000/api |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| PgAdmin | 5050 | http://localhost:5050 |
| RedisInsight | 8001 | http://localhost:8001 |

---

**Last Updated**: 2025-12-22
**Project Version**: Check package.json for current version
