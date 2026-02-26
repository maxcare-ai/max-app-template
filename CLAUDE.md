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
- **JSX shim**: `src/shims/jsx-dev-runtime.ts` is required because `@max-ai/components` ships dev-mode JSX transforms. Aliased in `next.config.ts`
- **Embedded dialogs**: Use `EmbeddedDialogContent` instead of `DialogContent` for proper positioning inside iframes
- **Viewport tracking**: `useVisibleViewport()` tracks which part of the iframe is visible using IntersectionObserver

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run db:up` — Start local PostgreSQL
- `npm run db:sync` — Sync TypeORM schema
- `npm run dev:setup` — Full local setup (db + sync + dev)

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
