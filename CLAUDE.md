# Max App Template

This is a template for building embedded MaxCare dashboard applications.

## Architecture

- **Framework**: Next.js 16 (App Router) with Node.js and npm
- **Database**: TypeORM + PostgreSQL
- **UI**: `@max-ai/components` (shadcn-style component library)
- **Embedding**: App runs inside an iframe in the MaxCare dashboard via App Bridge (`@max-ai/app-bridge`)
- **Deployment**: Fly.io with standalone Next.js output

## App Bridge

The app communicates with the MaxCare dashboard parent window via postMessage protocol:

1. `public/app-bridge.iife.js` is loaded before React hydrates (copied from `@max-ai/app-bridge` on `postinstall`)
2. It sets up `window.maxcare` global with methods like `idToken()`, `user()`, `organization()`, `facilities()`, `toast.show()`, etc.
3. The admin layout wraps pages in `AppBridgeProvider` from `@max-ai/app-bridge`
4. Use `useAdminBridge()` from `src/lib/bridge.ts` to access org/facility context and auth headers

## Key Patterns

- **Auth middleware**: API routes use `requireAuth(request)` from `src/lib/auth.ts` which validates `x-organization-id` and `x-facility-id` headers
- **Data fetching**: Client components use `useFetch()` hook from `src/lib/hooks/use-fetch.ts` with auth headers from `useAuthHeaders()`
- **JSX shim**: `src/shims/jsx-dev-runtime.ts` provides a fallback for older `@max-ai/components` versions that shipped dev-mode JSX transforms. Aliased in `next.config.ts`. With `@max-ai/components` >= 0.0.2, the shim is a no-op safety net.
- **Embedded dialogs**: Use `EmbeddedDialogContent` instead of `DialogContent` for proper positioning inside iframes
- **Viewport tracking**: `useVisibleViewport()` tracks which part of the iframe is visible using IntersectionObserver

## MaxCare API

Your app can call the MaxCare API server-side using the API key from the Developer Console.

- **Staging API**: `https://api.maxcare.dev`
- **Production API**: `https://api.maxcare.ai`
- **Dashboard (staging)**: `https://app.maxcare.dev`

Set `MAXAI_API_URL` and `MAXAI_API_KEY` in your `.env.local`.

## Permissions

Apps declare required and optional permissions in `max-ai.app.toml`:

```toml
[permissions]
scopes = ["read:patients", "read:appointments"]        # Required — granted on install
optional_scopes = ["write:patients", "read:billing"]   # Optional — clinic can opt in
```

Required scopes are automatically granted when a clinic installs the app. Optional scopes appear as checkboxes during installation and can be toggled later.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run db:up` — Start local PostgreSQL
- `npm run db:sync` — Sync TypeORM schema
- `npm run dev:setup` — Full local setup (db + sync + dev)

## MaxCare CLI Commands

- `max-ai auth login` — Authenticate with your MaxCare account
- `max-ai app init` — Scaffold a new app from this template
- `max-ai app dev` — Start local dev with tunnel + auto-register on MaxCare
- `max-ai app deploy` — Deploy to production (auto-increments version)
- `max-ai app info` — Show current app status
- `max-ai app seed` — Re-seed dev sandbox with test data

## File Structure

- `src/app/admin/` — Main app pages (embedded in MaxCare dashboard)
- `src/app/admin/test/` — Dev-only test page for App Bridge and component verification
- `src/app/api/` — Backend API routes
- `src/lib/bridge.ts` — App Bridge React context and hooks
- `src/lib/auth.ts` — API route auth middleware
- `src/lib/db/` — TypeORM DataSource and entities
- `src/components/` — Shared UI components

## Important Notes

- All `@max-ai/*` packages are public npm packages
- The admin layout checks if the app is embedded (iframe) and shows a blocked message if accessed directly
- The test page at `/admin/test` only appears in development mode
- Entities should have `orgId` and/or `facilityId` columns for multi-tenancy
- Tailwind config must include `@max-ai/components` dist in content array for component styles
- React key props must be passed directly to JSX elements, not spread via props objects (React 19 is strict about this)
