# FDSC Dashboard + Session Infrastructure — Design

## Context

Login (`POST /api/auth/local`) and NGO registration (`POST /api/auth/register/ngo`) are the
only auth flows currently wired up. Nothing else exists: no way to read "who is logged in"
after the initial login request, no logout, no route protection, and no mechanism for the
frontend to make *authenticated* calls to Strapi (the JWT lives in an httpOnly cookie set by
`app/api/auth/login/route.ts`, and is never read back or forwarded anywhere).

The backend has a real 5-role model (`super-admin`, `ngo-admin`, `ngo-member`, `mentor`,
`individual` — see `../crestem-ong-backend/src/index.ts`), and already implements refresh-token
issue/rotate/revoke and full CRUD + assignment endpoints for programs, but none of this is used
by the frontend yet.

A Figma Make prototype (`https://www.figma.com/make/25QFCKaISdFLDa4R58Hea1/...`) shows what the
logged-in app should look like: a role-gated dashboard shell with a left sidebar whose nav items
vary by role. This spec covers building the session infrastructure that everything else depends
on, plus one slice of that dashboard: the FDSC staff (`super-admin`) shell with its "Programe"
section.

## Scope

**In scope:**
- Session infrastructure: read current user + role, logout, refresh-token storage, route
  protection, and a reusable mechanism for authenticated Strapi calls.
- FDSC dashboard shell (`super-admin` role only), sidebar with a single "Programe" nav group.
- **Management programe**: list (active/finalized), create/edit/delete, and the "Gestionează"
  detail view with assign/remove organizations and mentors.
- **Organizații**: read-only browse/search grid (see note below — delete and detail were dropped
  after discovering the backend doesn't support them).

**Explicitly out of scope for this pass** (decided during brainstorming, not oversights):
- NGO Admin / NGO Member dashboard shell (only NGO registration exists frontend-side; no
  reachable login path there yet beyond the generic login form).
- **Persoane resursă** nav item — the Figma prototype itself has no design for this view (it's a
  "coming soon" stub there too). No reference to build against.
- **Admin → Utilizatori** — the prototype's table lists users across every role, but the only
  confirmed backend list endpoint is ONG-scoped (`GET /api/ongs/members`); there's no
  "list all platform users" endpoint, and `lastLogin` isn't tracked anywhere in the backend.
  Both would need new backend work. Admin FDSC / Editor FDSC accounts are provisioned directly
  in Strapi's admin panel (role `super-admin`) and are not created through the app.
- CMS, E-Learning, Setări, and the FDSC "Panou principal" overview — not part of the confirmed
  nav for this pass.
- `/api/auth/refresh` (silent token refresh) — cookies are set with the JWT's natural lifetime;
  refresh-on-expiry is deferred.

## Architecture: authenticated requests

The JWT lives in an httpOnly cookie (`crestem_session`), unreadable by browser JS, and Strapi is
a separate origin — so client components can never call Strapi directly for authenticated data
the way `RegisterNgoForm` calls the public `register/ngo` endpoint today. Every authenticated
call must go through our own Next.js server first.

**Decision**: extend the existing pattern from `app/api/auth/login/route.ts` — thin Next.js
Route Handlers under `app/api/*` that read the httpOnly cookie server-side and forward to
Strapi with `Authorization: Bearer <jwt>`, via one shared helper (`lib/api/server.ts` →
`serverApiFetch`). For pages that don't need client-side interactivity on their initial data
(e.g. the first render of a list), Server Components call `serverApiFetch` directly instead of
round-tripping through a Route Handler. Both call sites share the same helper.

**Alternatives considered and rejected:**
- **NextAuth (Auth.js)** — a sibling project (`covasna-media-poc`) uses it, but deliberately
  exposes the raw Strapi JWT to client JS via `useSession()` for direct cross-origin calls, has
  no role model, and no refresh-token handling. Doesn't fit our httpOnly-only security posture,
  our 5-role gating requirement, or our existing custom refresh/logout endpoints — adopting it
  would mean re-plumbing already-built backend flows into NextAuth's callback model for no clear
  benefit.
- **Server Actions only** — cleaner for isolated form mutations, but doesn't remove the need for
  something route-like for search/filter/list data in client components, and is a new pattern
  this codebase hasn't adopted yet.

## Components

### Session infrastructure
- `lib/api/server.ts` (new) — `serverApiFetch(path, init)`: reads the `crestem_session` cookie
  via `cookies()` (`next/headers`), attaches `Authorization: Bearer <jwt>`, forwards to
  `API_URL`, throws `ApiError` on failure. Server-only counterpart to `lib/api/client.ts`.
- `lib/api/session.ts` (extend) — add `getCurrentUser()` (calls `GET /api/auth/me` — see backend
  addition below — via `serverApiFetch`, returns
  `{ id, nume, email, role: { type, name } } | null`) and `logoutSession()` (calls the new local
  logout route).
- **Backend addition**: `GET /api/auth/me` (new action in
  `../crestem-ong-backend/src/api/auth/controllers/auth.ts` + route in
  `src/api/auth/routes/auth.ts`, no `policies` restriction — mirrors how `changePassword` is
  open to any authenticated role) returning `{ id, nume, email, role: { type, name } }` for
  `ctx.state.user`. Needed because Strapi's default `GET /api/users/me` depends on a
  `plugin::users-permissions.user.me` permission that this backend's code-managed permission
  matrix (`ROLE_PERMISSIONS` in `src/index.ts`) never grants to any custom role — it isn't part
  of the `api::`-prefixed matrix the bootstrap script manages, so it can't be relied on without a
  manual Strapi-admin step outside the codebase's normal conventions. Also add
  `"api::auth.auth.me"` to every role's array in `ROLE_PERMISSIONS`, same as `changePassword`.
- `app/api/auth/login/route.ts` (modify) — also capture `refreshToken` from the Strapi response
  and store it in a second httpOnly cookie (`crestem_refresh`).
- `app/api/auth/logout/route.ts` (new) — reads `crestem_refresh`, calls Strapi
  `POST /api/auth/logout` with `{ refreshToken }`, clears both cookies.
- `middleware.ts` (new, project root) — matches `/dashboard/:path*`. Cheap check: JWT cookie
  present or redirect to `/autentificare`. Coarse and fast — not a full role fetch.
- `app/dashboard/fdsc/layout.tsx` (new) — Server Component doing the *authoritative* check:
  `getCurrentUser()`, redirect to `/autentificare` if `null`, redirect to `/` if
  `role.type !== "super-admin"`. Renders `DashboardSidebar` + `{children}`.

### FDSC dashboard shell
- `components/features/dashboard/DashboardSidebar.tsx` (new) — logo, nav sections (typed config,
  currently just "Programe" → Management programe / Organizații), active-state highlighting,
  bottom user block (avatar-initial, name, role label), "Înapoi la site" link (`href="/"`),
  "Deconectare" button (calls `logoutSession()`, redirects to `/`).
- `app/dashboard/fdsc/page.tsx` (new) — redirects to `/dashboard/fdsc/programe`.

### Management programe
- `app/dashboard/fdsc/programe/page.tsx` (new) — Server Component, fetches program list via
  `serverApiFetch`, splits into active/finalized by date, renders `ProgrammeList`.
- `components/features/programe/ProgrammeList.tsx`, `ProgrammeRow.tsx`,
  `CreateProgrammeModal.tsx` (new, client) — card list with Editează/Gestionează/Șterge, and a
  create/edit form (nume, dată început/final, repeatable Faze) using react-hook-form, matching
  `RegisterNgoForm`'s conventions.
- `app/dashboard/fdsc/programe/[documentId]/page.tsx` (new) — "Gestionează" detail view:
  `AssignOngsSection`, `AssignMentorsSection` (search unassigned via `/api/ongs/active` /
  `/api/mentors/active`, add via `assign-ongs`/`assign-mentors`, remove via
  `remove-ongs`/`remove-mentors`).
- Note: the prototype's 3 stat tiles (În evaluare / Evaluare finalizată / Program finalizat) are
  dropped — they're client-computed in the prototype with no real backing data (evaluations
  aren't wired up), consistent with how Organizații's unsupported fields are handled below.
- Route Handlers: `app/api/programs/route.ts` (GET/POST), `app/api/programs/[documentId]/route.ts`
  (GET/PUT/DELETE — the backend uses `PUT` for updates, not `PATCH`), `app/api/programs/[documentId]/ongs/route.ts`,
  `app/api/programs/[documentId]/mentors/route.ts`, `app/api/programs/assign-ongs/route.ts`,
  `app/api/programs/remove-ongs/route.ts`, `app/api/programs/assign-mentors/route.ts`,
  `app/api/programs/remove-mentors/route.ts`, `app/api/ongs/active/route.ts`,
  `app/api/mentors/active/route.ts` — each a thin wrapper over `serverApiFetch`.

### Organizații
**Backend gap discovered while writing the implementation plan**: `GET /api/ongs`
(`src/api/ong/controllers/ong.ts`, `list` action) does not return `ngoStatus`, member count, or
the `programs` relation, even though those exist on the model. There is no
`GET /api/ongs/:documentId` detail endpoint, and no `DELETE /api/ongs/:documentId` endpoint —
neither action exists on the controller nor is registered in `src/api/ong/routes/`. Decision:
scope Organizații down to a **read-only browse grid** rather than add backend endpoints this
pass. No delete, no detail view, no status badge, no member count, no program tags.

- `app/dashboard/fdsc/organizatii/page.tsx` (new) — Server Component, fetches `GET /api/ongs`
  via `serverApiFetch`, renders `OrganizatiiGrid` with the full list as initial data.
- `components/features/organizatii/OrganizatiiGrid.tsx`, `OngCard.tsx` (new, client) — search
  (name) + filter by Județ, done client-side over the already-fetched list (no server round-trip
  needed since there's no pagination). No delete action, no "Vezi ONG" link.
- `components/features/organizatii/OngCard.tsx` shows only fields `GET /api/ongs` actually
  returns: `name`, `cui`, `website`, `adresa`, `domeniuActivitate`, `judet.nume`,
  `localitate.nume`.
- Route Handler: `app/api/ongs/route.ts` (GET) — wraps `GET /api/ongs`. Separate from
  `app/api/ongs/active/route.ts` (used by the Management programe assign flow, which needs the
  `{ documentId, name }`-only active list, not the fuller profile list).

## Field reconciliation (Organizații)

| Prototype field | Real backend source | Decision |
|---|---|---|
| `name`, `website` | `ong.name`, `ong.website` (both returned by `GET /api/ongs`) | keep |
| `cui`, `adresa`, `domeniuActivitate`, `judet`, `localitate` | returned by `GET /api/ongs`, not shown in the prototype's card but real and available | add to the card |
| `status` badge | `ong.ngoStatus` exists on the model but isn't returned by `GET /api/ongs` | **drop** (would need a backend change) |
| `programmes[]` tags | `ong.programs` relation exists but isn't returned by `GET /api/ongs` | **drop** (would need a backend change) |
| member count | not returned by `GET /api/ongs`; would need a `users` count | **drop** (would need a backend change) |
| `desc` | no such field on the model | **drop** |
| `admin` (name) | not stored; would require querying the `users` relation for an `ngo-admin`-role member | **drop** |
| delete action | no `DELETE /api/ongs/:documentId` endpoint exists | **drop** (would need a backend change) |
| "Vezi ONG" detail | no `GET /api/ongs/:documentId` endpoint exists | **drop** (would need a backend change) |

## Data flow

1. **Login**: `LoginForm` → `loginSession()` → `POST /api/auth/login` (local route, modified) →
   Strapi `POST /api/auth/local` → sets `crestem_session` (jwt) + `crestem_refresh`
   (refreshToken) httpOnly cookies → redirect (`super-admin` → `/dashboard/fdsc/programe`;
   other roles → `/`, since no other dashboard exists yet).
2. **Route access**: `middleware.ts` checks cookie presence on `/dashboard/*` → the FDSC layout
   does the authoritative role check via `getCurrentUser()`.
3. **Reads**: Server Component pages call `serverApiFetch` directly for initial render.
4. **Mutations**: client component → `fetch` to a local Route Handler (same-origin, cookie sent
   automatically by the browser) → Route Handler calls `serverApiFetch` → Strapi → response
   bubbles back → `router.refresh()` to reflect the change.
5. **Logout**: "Deconectare" → `logoutSession()` → local logout route → Strapi
   `POST /api/auth/logout` (revokes the refresh token) → both cookies cleared → redirect to `/`.

## Error handling

- Reuse the existing `ApiError` class (`status`, `message`, `details`) end-to-end:
  `serverApiFetch` throws it, Route Handlers translate it to
  `NextResponse.json({ message }, { status })` (same shape as the existing login route), client
  components render it in the same inline red-banner (`role="alert"`) pattern already used by
  `LoginForm`/`RegisterNgoForm`.
- Role mismatch (non-`super-admin` hitting `/dashboard/fdsc/*`) redirects silently to `/` rather
  than showing a 403 page — there's nowhere more meaningful to send them yet, since no other
  role has a dashboard built. Revisit once more roles have real destinations.

## Testing

No automated test suite exists in this project yet; verification is manual per project
convention (`CLAUDE.md`: run lint/typecheck/build, then exercise the feature in a browser).
Manual QA checklist for this feature:
- Log in as a `super-admin` user → lands on `/dashboard/fdsc/programe`, sidebar shows only
  Programe → Management programe / Organizații.
- Log in as any other role → does not reach `/dashboard/fdsc/*` (redirected to `/`).
- Visit `/dashboard/fdsc/*` while logged out → redirected to `/autentificare`.
- Create, edit, delete a program; verify phase add/remove in the form.
- Open "Gestionează" on a program → assign and remove an organization; assign and remove a
  mentor.
- Organizații: search by name, filter by județ.
- "Deconectare" clears the session (cookies gone) and redirects to `/`; subsequent visits to
  `/dashboard/fdsc/*` redirect to `/autentificare`.
