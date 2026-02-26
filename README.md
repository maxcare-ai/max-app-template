# Max App Template

A starter template for building embedded applications that run inside the [MaxCare](https://maxcare.ai) dashboard. Built with Next.js, Bun, TypeORM, and PostgreSQL — ready to deploy on Fly.io.

## What this template includes

- **App Bridge integration** — PostMessage protocol for communicating with the MaxCare dashboard (auth, navigation, toasts, resize, etc.)
- **Max AI components** — Pre-configured UI component library (`@max-ai/components`) so your app matches the MaxCare design system
- **Full-stack setup** — Next.js App Router with API routes, TypeORM + PostgreSQL, auth middleware
- **Test page** — A built-in `/admin/test` page (dev only) to verify App Bridge connectivity and preview all available UI components
- **Docker + Fly.io** — Production-ready Dockerfile using Bun and `fly.toml` for one-command deploys

---

## Prerequisites

- [Node.js](https://nodejs.org) (v20+)
- [Docker](https://www.docker.com/) (for local PostgreSQL and production builds)
- A MaxCare organization with developer access

---

## Getting started

### 1. Create your app on MaxCare

Before writing any code, register your application in the MaxCare developer portal:

1. Go to **Developer Console** in the MaxCare dashboard
2. Click **Create Application**
3. Fill in the required fields:
   - **App name** — Display name shown in the marketplace
   - **App URL** — The URL where your app is hosted (e.g. `https://my-app.fly.dev`). This is the URL MaxCare will load inside an iframe. For local development, use `http://localhost:3000`
   - **Description** — What your app does
   - **Scopes** — The permissions your app needs (e.g. `read:appointments`, `read:patients`)
4. Save your app — you'll receive an **App ID** and credentials

### 2. Create API keys (if needed)

If your app needs to call the MaxCare API directly (for data not provided through App Bridge), create API keys:

1. In the Developer Console, navigate to your app
2. Go to **My apps**
3. Go to the app you want to create an API Key for
4. Click **Create API Key**
5. Select the permissions your key needs — API keys are scoped to specific permissions, so only request what you need:
   - `read:appointments` — Access appointment data
   - `read:patients` — Access patient data
   - Other scopes as needed for your use case
6. Copy the generated key — it won't be shown again

> **Note:** App Bridge automatically provides auth tokens for the currently logged-in user. You only need API keys for server-side calls or accessing data outside the current user's session (e.g. cron jobs, background processing).

### 3. Clone and configure

```bash
# Clone the template
git clone <this-repo-url> my-new-app
cd my-new-app

# Install dependencies
npm install

# Copy environment file and fill in your values
cp .env.example .env.local
```

### 4. Set up your environment

Edit `.env.local` with your values:

```env
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/my_app

# MaxCare Integration
MAXAI_API_KEY=ak_xxx          # From Developer Console -> API Keys
MAXAI_API_URL=https://dashboard.maxcare.ai

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run locally

```bash
# Start PostgreSQL
npm run db:up

# Sync database schema and start dev server
npm run dev:setup
```

Your app is now running at `http://localhost:3000`. To test the embedded experience, open it from the MaxCare dashboard (set your app URL to `http://localhost:3000` during development).

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout — loads App Bridge script
│   ├── globals.css             # Tailwind + CSS variables (MaxCare theme)
│   ├── page.tsx                # Landing page (redirect or dev links)
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout — AppBridgeProvider, nav, auth shell
│   │   ├── page.tsx            # Your main app page
│   │   └── test/page.tsx       # Dev-only test page (bridge + components)
│   └── api/
│       └── health/route.ts     # Health check endpoint
├── lib/
│   ├── bridge.ts               # App Bridge context & hooks
│   ├── auth.ts                 # API route auth middleware
│   ├── env.ts                  # Environment variable validation
│   ├── logger.ts               # Structured logging (Pino)
│   ├── db/
│   │   ├── data-source.ts      # TypeORM DataSource
│   │   └── entities/           # Your database entities go here
│   └── hooks/
│       ├── use-fetch.ts        # Fetch wrapper with auth headers
│       └── use-visible-viewport.ts
├── components/                 # Your UI components
└── shims/
    └── jsx-dev-runtime.ts      # Required shim for @max-ai/components
```

---

## How App Bridge works

Your app runs inside an iframe in the MaxCare dashboard. Communication happens over `postMessage`:

1. **Startup** — The `app-bridge.iife.js` script is loaded before React hydrates. It sets up `window.maxcare` and listens for messages from the parent window.
2. **Init** — The MaxCare dashboard sends an `init` message with the user's session token, organization, and facility info.
3. **Ready** — Your app calls `maxcare.ready()` to signal it's loaded.
4. **Runtime** — Use `window.maxcare` or the React hooks to interact with the dashboard:

```typescript
// Get current user info
const user = await window.maxcare.user();

// Show a toast notification
window.maxcare.toast.show("Saved!", { type: "success" });

// Get auth token for API calls
const token = await window.maxcare.idToken();
```

In React components, use the provided hooks:

```typescript
import { useAdminBridge } from "@/lib/bridge";

function MyComponent() {
  const { organization, facilities, selectedFacilityId, headers } = useAdminBridge();
  // headers contains x-organization-id and x-facility-id for API calls
}
```

---

## Using Max AI components

All UI components are imported from `@max-ai/components`:

```typescript
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from "@max-ai/components";

function MyForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter name" />
        <Button>Save</Button>
      </CardContent>
    </Card>
  );
}
```

Visit `/admin/test` in development mode to see all available components and their variants.

### Available components

Button, Badge, Card, Input, Label, Textarea, Select, Dialog, Table, Separator, Skeleton, Switch, Checkbox, Tabs, Tooltip, Alert, Progress, and the `cn()` class-merge utility.

---

## Adding API routes

API routes live in `src/app/api/`. Use the auth middleware to validate requests:

```typescript
// src/app/api/my-endpoint/route.ts
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { organizationId, facilityId } = await requireAuth(request);

  // Your logic here

  return NextResponse.json({ ok: true });
}
```

The `requireAuth` function validates the `x-organization-id` and `x-facility-id` headers that App Bridge automatically injects.

---

## Adding database entities

Create new entities in `src/lib/db/entities/`:

```typescript
// src/lib/db/entities/MyEntity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class MyEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  facilityId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
```

Register it in your DataSource entity array, then sync:

```bash
npm run db:sync
```

---

## Deploying to Fly.io

```bash
# First time setup
fly launch

# Set your secrets
fly secrets set DATABASE_URL=postgres://... MAXAI_API_KEY=ak_xxx

# Deploy
fly deploy
```

After deploying, update your app URL in the MaxCare Developer Console to point to your Fly.io URL (e.g. `https://my-app.fly.dev`).

---

## Scripts reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:up` | Start local PostgreSQL via Docker |
| `npm run db:down` | Stop local PostgreSQL |
| `npm run db:sync` | Sync TypeORM schema to database |
| `npm run db:migrate` | Run pending migrations |
| `npm run dev:setup` | Full local setup (db + sync + dev server) |

---

## Customizing the template

After cloning, you'll want to:

1. Update `package.json` — change `name`, `description`
2. Update `src/app/layout.tsx` — change the page title and metadata
3. Update `src/app/admin/layout.tsx` — customize nav items for your app's pages
4. Add your entities in `src/lib/db/entities/`
5. Build your pages in `src/app/admin/`
6. Add API routes in `src/app/api/`

The test page at `/admin/test` is available in development mode to verify your App Bridge connection and preview components as you build.

---

## Setup script

When starting a new project from this template, run the interactive setup script:

```bash
./scripts/setup.sh
```

This will:
1. Prompt you for an app name (e.g. `max-scheduling-app`)
2. Update `package.json`, page titles, and `docker-compose.yml`
3. Initialize a fresh git repository
4. Remind you to install dependencies
