# FDSC Dashboard + Session Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build session infrastructure (login state, logout, authenticated Strapi calls, route
protection) and the FDSC (`super-admin`) dashboard shell with its "Programe" section: Management
programe (CRUD + assign/remove orgs & mentors) and a read-only Organizații browse grid.

**Architecture:** JWT stays in an httpOnly cookie, never exposed to browser JS. Server Components
and Route Handlers read it via a shared `serverApiFetch` helper and forward
`Authorization: Bearer <jwt>` to Strapi. Client components never call Strapi directly — they call
our own Next.js Route Handlers (same-origin, cookie sent automatically) through a `localApiFetch`
helper. Full rationale in `docs/superpowers/specs/2026-08-07-fdsc-dashboard-session-design.md`.

**Tech Stack:** Next.js 16 (App Router), TypeScript strict, Tailwind CSS, react-hook-form + zod,
Strapi backend (separate repo `../crestem-ong-backend`).

## Global Constraints

- **No `git add` / `git commit` anywhere, in this repo or in `../crestem-ong-backend`, by anyone
  executing this plan — not once, not as a checkpoint, not "just locally."** This is a standing
  instruction from the project owner, confirmed explicitly for this implementation. Every task
  below ends with a "leave changes uncommitted" step instead of a commit step. Do the file work,
  run the verification commands, report what changed — and stop there. If a step's instructions
  ever conflict with this, this constraint wins.
- No automated test framework exists in this project (`package.json` has only `lint`, `build`,
  `dev`, `start`). Verification per task is `npm run lint`, `npx tsc --noEmit`, and — for
  anything hitting a real endpoint — either a manual `curl` against the running dev servers or
  browser interaction. A full manual QA pass is the last task.
- This Next.js build is v16: the file is **`proxy.ts`** exporting `proxy(request)`, **not**
  `middleware.ts`/`middleware()` — that convention was renamed and the old one is deprecated.
- `cookies()` (`next/headers`) is async — always `await cookies()`. Route Handler dynamic params
  are also async: `{ params }: { params: Promise<{ documentId: string }> }`, then
  `const { documentId } = await params`.
- All UI copy is Romanian, matching existing components (`LoginForm.tsx`, `RegisterNgoForm.tsx`).
- Reuse the existing `ApiError` class (`lib/api/client.ts`) end-to-end — don't invent a new error
  shape.
- Styling: Tailwind only, matching existing color tokens already used in this codebase — navy
  `#162040`, green accent `#2dbe8f`, `rounded-xl` inputs/cards, `border-border` borders. No new
  npm dependencies (no `server-only`, no state library, no UI kit) — everything needed
  (`react-hook-form`, `zod`, `lucide-react`) is already installed.
- Backend changes (Task 1) happen in the sibling repo `../crestem-ong-backend` — a separate git
  repository, but the no-commit constraint above applies there identically.
- Every Strapi endpoint used below already enforces `policies: ["global::is-super-admin"]` (or is
  open to all authenticated roles, for `/auth/me`). Route Handlers do **not** need to duplicate
  role checks — an unauthorized request gets a 403 from Strapi and that `ApiError` propagates as-is.

---

### Task 1: Backend — `GET /api/auth/me`

**Files:**
- Modify: `../crestem-ong-backend/src/api/auth/controllers/auth.ts`
- Modify: `../crestem-ong-backend/src/api/auth/routes/auth.ts`
- Modify: `../crestem-ong-backend/src/index.ts`

**Interfaces:**
- Produces: `GET /api/auth/me` → `200 { data: { id: number, nume: string, email: string, role: { type: string, name: string } | null } }` for any authenticated user; `401` if unauthenticated.

- [ ] **Step 1: Add the `me` action to the auth controller**

In `../crestem-ong-backend/src/api/auth/controllers/auth.ts`, add a new action to the exported
object (place it after `registerNgo`, before `registerIndividual` — anywhere in the object is
fine since it's a plain object literal):

```ts
  async me(ctx: Context) {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: ctx.state.user.id }, populate: ["role"] });
    return {
      data: {
        id: user.id,
        nume: user.nume,
        email: user.email,
        role: user.role ? { type: user.role.type, name: user.role.name } : null,
      },
    };
  },
```

- [ ] **Step 2: Register the route**

In `../crestem-ong-backend/src/api/auth/routes/auth.ts`, add a new route entry to the `routes`
array (order doesn't matter — add it after the `register/ngo` entry):

```ts
    {
      method: "GET",
      path: "/auth/me",
      handler: "auth.me",
      config: {},
    },
```

- [ ] **Step 3: Grant the action to every role**

In `../crestem-ong-backend/src/index.ts`, add `"api::auth.auth.me"` to every array in
`ROLE_PERMISSIONS` (same treatment as `"api::auth.auth.changePassword"`, which is already in all
five). The five keys are `"super-admin"`, `"ngo-admin"`, `"ngo-member"`, `"mentor"`,
`"individual"`.

- [ ] **Step 4: Verify with typecheck and a manual request**

Run: `cd ../crestem-ong-backend && npx tsc --noEmit`
Expected: no errors.

Start the backend dev server if not already running (`cd ../crestem-ong-backend && npm run
develop`), log in via `POST /api/auth/local` with a real `super-admin` account to get a JWT, then:

```bash
curl -s http://localhost:1337/api/auth/me -H "Authorization: Bearer <jwt>"
```

Expected: `{"data":{"id":<id>,"nume":"...","email":"...","role":{"type":"super-admin","name":"Super Admin"}}}`

- [ ] **Step 5: Leave changes uncommitted**

Per standing instruction, do not run `git add` or `git commit` at any point — not here, not in any later task. Leave the files you created/modified as uncommitted working-tree changes; the task reviewer will diff them directly.

---

### Task 2: `serverApiFetch` — the server-only authenticated fetch helper

**Files:**
- Create: `lib/api/server.ts`

**Interfaces:**
- Consumes: `ApiError` from `./client.ts` (existing).
- Produces: `serverApiFetch<T>(path: string, init?: RequestInit): Promise<T>` — reads the
  `crestem_session` cookie, attaches `Authorization: Bearer <jwt>` if present, forwards to
  `NEXT_PUBLIC_API_URL${path}`, throws `ApiError` on non-2xx or network failure. Used by every
  later task that reads/writes Strapi from a Server Component or Route Handler.

- [ ] **Step 1: Write the helper**

```ts
// lib/api/server.ts
import { cookies } from "next/headers";
import { ApiError } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface StrapiErrorResponse {
  error?: { message?: string; details?: unknown };
}

export async function serverApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("crestem_session")?.value;

  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (jwt) {
    headers.set("Authorization", `Bearer ${jwt}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  }).catch(() => {
    throw new ApiError("Nu am putut contacta serverul. Verifică conexiunea și încearcă din nou.", 0);
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = (data as StrapiErrorResponse | null)?.error;
    const message = errorBody?.message ?? "A apărut o eroare. Încearcă din nou.";
    throw new ApiError(message, res.status, errorBody?.details);
  }

  return data as T;
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Leave changes uncommitted**

Per standing instruction, do not run `git add` or `git commit` at any point — not here, not in any later task. Leave the files you created/modified as uncommitted working-tree changes; the task reviewer will diff them directly.

---

### Task 3: `localApiFetch`, session helpers, and the logout route

**Files:**
- Create: `lib/api/local.ts`
- Modify: `lib/api/session.ts`
- Modify: `lib/api/auth.ts`
- Create: `app/api/auth/logout/route.ts`
- Modify: `app/api/auth/login/route.ts`

**Interfaces:**
- Produces: `localApiFetch<T>(path: string, init?: RequestInit): Promise<T>` (browser →
  same-origin Next.js route, JSON in/out, throws `ApiError`).
- Produces: `getMe(jwt: string): Promise<{ id: number; nume: string; email: string; role: { type: string; name: string } | null }>` in `lib/api/auth.ts`.
- Produces: `SessionUser` (in `lib/api/session.ts`) now includes `role: { type: string; name: string } | null`.
- Produces: `logoutSession(): Promise<void>` in `lib/api/session.ts`.
- Consumes (Task 4+): `localApiFetch` is what every `lib/api/programs.ts` /
  `lib/api/ongs.ts` / `lib/api/mentors.ts` function will call.

- [ ] **Step 1: Write `localApiFetch`**

This mirrors `apiFetch` in `lib/api/client.ts` but targets our own same-origin routes (relative
path, no `NEXT_PUBLIC_API_URL` prefix) — the browser attaches the httpOnly session cookie
automatically for same-origin requests, so no manual header handling is needed.

```ts
// lib/api/local.ts
import { ApiError } from "./client";

interface LocalErrorResponse {
  message?: string;
  details?: unknown;
}

export async function localApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(path, {
    ...init,
    headers,
  }).catch(() => {
    throw new ApiError("Nu am putut contacta serverul. Verifică conexiunea și încearcă din nou.", 0);
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = data as LocalErrorResponse | null;
    const message = errorBody?.message ?? "A apărut o eroare. Încearcă din nou.";
    throw new ApiError(message, res.status, errorBody?.details);
  }

  return data as T;
}
```

- [ ] **Step 2: Add `getMe` to `lib/api/auth.ts`**

Add this export alongside the existing `login`/`registerNgo` (keep everything else in the file
unchanged):

```ts
export interface CurrentUser {
  id: number;
  nume: string;
  email: string;
  role: { type: string; name: string } | null;
}

export function getMe(jwt: string) {
  return apiFetch<{ data: CurrentUser }>("/api/auth/me", {
    headers: { Authorization: `Bearer ${jwt}` },
  });
}
```

- [ ] **Step 3: Rewrite `lib/api/session.ts`**

Replace the whole file. `loginSession` now uses `localApiFetch` (removing the duplicated fetch
logic) and the returned user carries `role`; `logoutSession` is new.

```ts
import { localApiFetch } from "./local";

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  role: { type: string; name: string } | null;
}

export interface LoginSessionPayload {
  identifier: string;
  password: string;
}

export function loginSession(payload: LoginSessionPayload) {
  return localApiFetch<{ user: SessionUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((res) => res.user);
}

export function logoutSession() {
  return localApiFetch<void>("/api/auth/logout", { method: "POST" });
}
```

- [ ] **Step 4: Modify the login route to capture the refresh token and role, and set both cookies**

Replace `app/api/auth/login/route.ts` in full:

```ts
import { NextResponse } from "next/server";
import { login, getMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

const SESSION_COOKIE = "crestem_session";
const REFRESH_COOKIE = "crestem_refresh";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const identifier = body?.identifier;
  const password = body?.password;

  if (typeof identifier !== "string" || typeof password !== "string") {
    return NextResponse.json({ message: "Date de autentificare invalide." }, { status: 400 });
  }

  try {
    const { jwt, user, refreshToken } = await login({ identifier, password });
    const me = await getMe(jwt);

    const response = NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email, role: me.data.role },
    });
    response.cookies.set(SESSION_COOKIE, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Nu am putut finaliza autentificarea. Încearcă din nou.";
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message }, { status: status || 500 });
  }
}
```

- [ ] **Step 5: Add `refreshToken` to `LoginResponse` in `lib/api/auth.ts`**

Find the existing `LoginResponse` interface in `lib/api/auth.ts` and add the field:

```ts
export interface LoginResponse {
  jwt: string;
  user: AuthUser;
  refreshToken: string;
}
```

- [ ] **Step 6: Create the logout route**

```ts
// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SESSION_COOKIE = "crestem_session";
const REFRESH_COOKIE = "crestem_refresh";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {
      // Best-effort: still clear local cookies even if the backend call fails.
    });
  }

  const response = NextResponse.json({ message: "Delogare reușită" });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
```

- [ ] **Step 7: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. If `LoginForm.tsx` now fails to typecheck because it doesn't use the new
`role` field, that's fine for this task — it's addressed in Task 6.

- [ ] **Step 8: Manual verification**

With both dev servers running (`npm run dev` here, `npm run develop` in the backend), and a real
`super-admin` account:

```bash
curl -i -s -c /tmp/cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"<email>","password":"<password>"}'
```

Expected: `200`, JSON body `{"user":{"id":...,"username":"...","email":"...","role":{"type":"super-admin","name":"Super Admin"}}}`, and `Set-Cookie` headers for both `crestem_session` and `crestem_refresh`.

```bash
curl -i -s -b /tmp/cookies.txt -X POST http://localhost:3000/api/auth/logout
```

Expected: `200`, `{"message":"Delogare reușită"}`, and `Set-Cookie` headers clearing both cookies.

- [ ] **Step 9: Leave changes uncommitted**

Per standing instruction, do not run `git add` or `git commit` at any point — not here, not in any later task. Leave the files you created/modified as uncommitted working-tree changes; the task reviewer will diff them directly.

---

### Task 4: `getCurrentUser()` and `proxy.ts` route protection

**Files:**
- Modify: `lib/api/session.ts`
- Create: `proxy.ts`

**Interfaces:**
- Consumes: `serverApiFetch` from `lib/api/server.ts` (Task 2).
- Produces: `getCurrentUser(): Promise<CurrentUser | null>` in `lib/api/session.ts`, where
  `CurrentUser` is re-exported from `lib/api/auth.ts` (Task 3). Used by Task 5's FDSC layout.

- [ ] **Step 1: Add `getCurrentUser` to `lib/api/session.ts`**

Add this to the file (alongside the existing `loginSession`/`logoutSession`):

```ts
import { serverApiFetch } from "./server";
import { ApiError } from "./client";
import type { CurrentUser } from "./auth";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const res = await serverApiFetch<{ data: CurrentUser }>("/api/auth/me");
    return res.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return null;
    }
    throw err;
  }
}
```

- [ ] **Step 2: Write `proxy.ts`**

Root-level file, next to `package.json`. This is the coarse check: cookie presence only, no role
fetch (that happens in the FDSC layout in Task 5).

```ts
// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const jwt = request.cookies.get("crestem_session");
  if (!jwt) {
    const loginUrl = new URL("/autentificare", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Start the frontend dev server, then:

```bash
curl -i -s http://localhost:3000/dashboard/fdsc
```

Expected: `307`/`308` redirect response with `location: /autentificare` (no `dashboard/fdsc`
route exists to render yet, but the redirect itself proves the proxy is running — a 404 here
instead of a redirect means the proxy isn't intercepting the path).

- [ ] **Step 5: Leave changes uncommitted**

Per standing instruction, do not run `git add` or `git commit` at any point — not here, not in any later task. Leave the files you created/modified as uncommitted working-tree changes; the task reviewer will diff them directly.

---

### Task 5: FDSC layout, sidebar shell, and landing redirect

**Files:**
- Create: `components/features/dashboard/DashboardSidebar.tsx`
- Create: `app/dashboard/fdsc/layout.tsx`
- Create: `app/dashboard/fdsc/page.tsx`

**Interfaces:**
- Consumes: `getCurrentUser` from `lib/api/session.ts` (Task 4), `logoutSession` (Task 3).
- Produces: `DashboardSidebar` component, rendered by the layout, taking no props (nav config is
  internal to the component for this pass since there's only one role/section).

- [ ] **Step 1: Write the sidebar**

```tsx
// components/features/dashboard/DashboardSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logoutSession } from "@/lib/api/session";

const NAV_SECTIONS = [
  {
    label: "Programe",
    items: [
      { href: "/dashboard/fdsc/programe", label: "Management programe" },
      { href: "/dashboard/fdsc/organizatii", label: "Organizații" },
    ],
  },
];

export function DashboardSidebar({
  userName,
  userRoleLabel,
}: {
  userName: string;
  userRoleLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutSession();
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  const initial = userName.trim().charAt(0).toUpperCase() || "?";

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-border">
      <div className="px-6 py-5 border-b border-border">
        <Logo variant="dark" height={24} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={
                      active
                        ? { background: "#162040", color: "white" }
                        : { color: "#334155" }
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-3">
        <div className="flex items-center gap-2.5 px-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
            style={{ background: "#2dbe8f" }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "#162040" }}>
              {userName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{userRoleLabel}</p>
          </div>
        </div>
        <Link
          href="/"
          className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
          style={{ color: "#334155" }}
        >
          Înapoi la site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
          style={{ color: "#ef4444" }}
        >
          <LogOut size={16} />
          Deconectare
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Write the FDSC layout with the role gate**

```tsx
// app/dashboard/fdsc/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/session";
import { DashboardSidebar } from "@/components/features/dashboard/DashboardSidebar";

export default async function FdscDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/autentificare");
  }
  if (user.role?.type !== "super-admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userName={user.nume} userRoleLabel={user.role.name} />
      <main className="flex-1 overflow-y-auto p-8" style={{ background: "#f8fafc" }}>
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Write the landing redirect**

```tsx
// app/dashboard/fdsc/page.tsx
import { redirect } from "next/navigation";

export default function FdscDashboardPage() {
  redirect("/dashboard/fdsc/programe");
}
```

- [ ] **Step 4: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: errors about the missing `/dashboard/fdsc/programe` route are fine (it doesn't exist
until Task 8) — there should be no *type* errors. If `tsc` complains about the missing route
module, that's a Next.js route-typegen artifact, not a real error; confirm by checking the error
text mentions route typegen, not a type mismatch in the files you just wrote.

- [ ] **Step 5: Leave changes uncommitted**

Per standing instruction, do not run `git add` or `git commit` at any point — not here, not in any later task. Leave the files you created/modified as uncommitted working-tree changes; the task reviewer will diff them directly.

---

### Task 6: `LoginForm` redirects by role

**Files:**
- Modify: `components/features/auth/LoginForm.tsx`

**Interfaces:**
- Consumes: `SessionUser.role` (Task 3).

- [ ] **Step 1: Update the submit handler**

In `components/features/auth/LoginForm.tsx`, replace the `onSubmit` function's body:

```tsx
  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    try {
      const user = await loginSession(data);
      router.push(user.role?.type === "super-admin" ? "/dashboard/fdsc/programe" : "/");
      router.refresh();
    } catch (err) {
      setApiError(
        err instanceof ApiError ? err.message : "Nu am putut finaliza autentificarea. Încearcă din nou."
      );
    }
  };
```

(This just adds the role branch and a `router.refresh()` after the redirect target — everything
else in the file is unchanged.)

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Leave changes uncommitted**

Per standing instruction, do not run `git add` or `git commit` at any point — not here, not in any later task. Leave the files you created/modified as uncommitted working-tree changes; the task reviewer will diff them directly.

---

### Task 7: `lib/api/programs.ts`, `lib/api/ongs.ts`, `lib/api/mentors.ts` + core Route Handlers

**Files:**
- Create: `lib/api/programs.ts`
- Create: `lib/api/ongs.ts`
- Create: `lib/api/mentors.ts`
- Create: `app/api/programs/route.ts`
- Create: `app/api/programs/[documentId]/route.ts`
- Create: `app/api/ongs/active/route.ts`
- Create: `app/api/mentors/active/route.ts`

**Interfaces:**
- Produces (`lib/api/programs.ts`): `Program`, `ProgramPhase`, `ProgramDetail` types;
  `listPrograms(): Promise<{ data: Program[] }>`;
  `getProgram(documentId: string): Promise<{ data: ProgramDetail }>`;
  `createProgram(payload: CreateProgramPayload): Promise<{ data: ProgramDetail }>`;
  `updateProgram(documentId: string, payload: UpdateProgramPayload): Promise<{ data: ProgramDetail }>`;
  `deleteProgram(documentId: string): Promise<{ message: string }>`.
- Produces (`lib/api/ongs.ts`): `ActiveOng` type; `listActiveOngs(): Promise<{ data: ActiveOng[] }>`.
- Produces (`lib/api/mentors.ts`): `ActiveMentor` type; `listActiveMentors(): Promise<{ data: ActiveMentor[] }>`.
- Consumes: `localApiFetch` (Task 3), `serverApiFetch` (Task 2).

- [ ] **Step 1: Write `lib/api/programs.ts`**

```ts
import { localApiFetch } from "./local";

export interface ProgramPhase {
  documentId: string;
  title: string;
  startDate: string;
  endDate: string;
  hasEvaluation: boolean;
}

export interface Program {
  documentId: string;
  name: string;
  startDate: string;
  endDate: string;
  programStatus: "Upcoming" | "Active" | "Finished";
}

export interface ProgramDetail extends Program {
  phases: ProgramPhase[];
}

export interface PhaseInput {
  documentId?: string;
  title: string;
  startDate: string;
  endDate: string;
  hasEvaluation: boolean;
}

export interface CreateProgramPayload {
  name: string;
  startDate: string;
  endDate: string;
  phases: Omit<PhaseInput, "documentId">[];
}

export interface UpdateProgramPayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  phases?: PhaseInput[];
  removePhases?: string[];
}

export function listPrograms() {
  return localApiFetch<{ data: Program[] }>("/api/programs");
}

export function getProgram(documentId: string) {
  return localApiFetch<{ data: ProgramDetail }>(`/api/programs/${documentId}`);
}

export function createProgram(payload: CreateProgramPayload) {
  return localApiFetch<{ data: ProgramDetail }>("/api/programs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProgram(documentId: string, payload: UpdateProgramPayload) {
  return localApiFetch<{ data: ProgramDetail }>(`/api/programs/${documentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProgram(documentId: string) {
  return localApiFetch<{ message: string }>(`/api/programs/${documentId}`, {
    method: "DELETE",
  });
}
```

- [ ] **Step 2: Write `lib/api/ongs.ts`**

```ts
import { localApiFetch } from "./local";

export interface ActiveOng {
  documentId: string;
  name: string;
}

export function listActiveOngs() {
  return localApiFetch<{ data: ActiveOng[] }>("/api/ongs/active");
}
```

- [ ] **Step 3: Write `lib/api/mentors.ts`**

```ts
import { localApiFetch } from "./local";

export interface ActiveMentor {
  documentId: string;
  nume: string;
  email: string;
  mentorJobTitle: string | null;
  mentorOrganization: string | null;
  avatar: { documentId: string; name: string; url: string } | null;
}

export function listActiveMentors() {
  return localApiFetch<{ data: ActiveMentor[] }>("/api/mentors/active");
}
```

- [ ] **Step 4: Write `app/api/programs/route.ts`**

```ts
import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";

export async function GET() {
  try {
    const data = await serverApiFetch("/api/programs");
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    const details = err instanceof ApiError ? err.details : undefined;
    return NextResponse.json({ message, details }, { status: status || 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  try {
    const data = await serverApiFetch("/api/programs", { method: "POST", body });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    const details = err instanceof ApiError ? err.details : undefined;
    return NextResponse.json({ message, details }, { status: status || 500 });
  }
}
```

- [ ] **Step 5: Write `app/api/programs/[documentId]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";

function errorResponse(err: unknown) {
  const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
  const status = err instanceof ApiError ? err.status : 500;
  const details = err instanceof ApiError ? err.details : undefined;
  return NextResponse.json({ message, details }, { status: status || 500 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  try {
    const data = await serverApiFetch(`/api/programs/${documentId}`);
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  const body = await request.text();
  try {
    const data = await serverApiFetch(`/api/programs/${documentId}`, { method: "PUT", body });
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  try {
    const data = await serverApiFetch(`/api/programs/${documentId}`, { method: "DELETE" });
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err);
  }
}
```

- [ ] **Step 6: Write `app/api/ongs/active/route.ts`**

```ts
import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";

export async function GET() {
  try {
    const data = await serverApiFetch("/api/ongs/active");
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message }, { status: status || 500 });
  }
}
```

- [ ] **Step 7: Write `app/api/mentors/active/route.ts`**

```ts
import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";

export async function GET() {
  try {
    const data = await serverApiFetch("/api/mentors/active");
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message }, { status: status || 500 });
  }
}
```

- [ ] **Step 8: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 9: Manual verification**

Log in as `super-admin` via curl (as in Task 3 Step 8) to get a cookie jar, then:

```bash
curl -s -b /tmp/cookies.txt http://localhost:3000/api/programs
curl -s -b /tmp/cookies.txt http://localhost:3000/api/ongs/active
curl -s -b /tmp/cookies.txt http://localhost:3000/api/mentors/active
```

Expected: each returns `200` with a `{"data": [...]}` shape (empty arrays are fine if no
programs/orgs/mentors exist yet in the dev database).

- [ ] **Step 10: Leave changes uncommitted**

Per standing instruction, do not run `git add` or `git commit` at any point — not here, not in any later task. Leave the files you created/modified as uncommitted working-tree changes; the task reviewer will diff them directly.

---

### Task 8: Assign/remove Route Handlers + program sub-resource lists

**Files:**
- Modify: `lib/api/programs.ts`
- Create: `app/api/programs/[documentId]/ongs/route.ts`
- Create: `app/api/programs/[documentId]/mentors/route.ts`
- Create: `app/api/programs/assign-ongs/route.ts`
- Create: `app/api/programs/remove-ongs/route.ts`
- Create: `app/api/programs/assign-mentors/route.ts`
- Create: `app/api/programs/remove-mentors/route.ts`

**Interfaces:**
- Produces (added to `lib/api/programs.ts`): `AssignedOng`, `AssignedMentor` types;
  `getProgramOngs(documentId: string): Promise<{ data: { ongs: AssignedOng[] } }>`;
  `getProgramMentors(documentId: string): Promise<{ data: AssignedMentor[] }>`;
  `assignOngs(programId: string, ongIds: string[]): Promise<{ data: { ongs: AssignedOng[] } }>`;
  `removeOngs(programId: string, ongIds: string[]): Promise<{ message: string }>`;
  `assignMentors(programId: string, mentorIds: string[]): Promise<{ data: { mentors: AssignedMentor[] } }>`;
  `removeMentors(programId: string, mentorIds: string[]): Promise<{ message: string }>`.

- [ ] **Step 1: Extend `lib/api/programs.ts`**

Append to the file (types + functions, everything from Task 7 stays as-is):

```ts
export interface AssignedOng {
  documentId: string;
  name: string;
}

export interface AssignedMentor {
  documentId: string;
  nume: string;
  email: string;
  mentorJobTitle: string | null;
  mentorOrganization: string | null;
  avatar: { documentId: string; name: string; url: string } | null;
}

export function getProgramOngs(documentId: string) {
  return localApiFetch<{ data: { ongs: AssignedOng[] } }>(`/api/programs/${documentId}/ongs`);
}

export function getProgramMentors(documentId: string) {
  return localApiFetch<{ data: AssignedMentor[] }>(`/api/programs/${documentId}/mentors`);
}

export function assignOngs(programId: string, ongIds: string[]) {
  return localApiFetch<{ data: { ongs: AssignedOng[] } }>("/api/programs/assign-ongs", {
    method: "POST",
    body: JSON.stringify({ program: programId, ongs: ongIds }),
  });
}

export function removeOngs(programId: string, ongIds: string[]) {
  return localApiFetch<{ message: string }>("/api/programs/remove-ongs", {
    method: "POST",
    body: JSON.stringify({ program: programId, ongs: ongIds }),
  });
}

export function assignMentors(programId: string, mentorIds: string[]) {
  return localApiFetch<{ data: { mentors: AssignedMentor[] } }>("/api/programs/assign-mentors", {
    method: "POST",
    body: JSON.stringify({ program: programId, mentors: mentorIds }),
  });
}

export function removeMentors(programId: string, mentorIds: string[]) {
  return localApiFetch<{ message: string }>("/api/programs/remove-mentors", {
    method: "POST",
    body: JSON.stringify({ program: programId, mentors: mentorIds }),
  });
}
```

- [ ] **Step 2: Write `app/api/programs/[documentId]/ongs/route.ts`**

```ts
import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  try {
    const data = await serverApiFetch(`/api/programs/${documentId}/ongs`);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message }, { status: status || 500 });
  }
}
```

- [ ] **Step 3: Write `app/api/programs/[documentId]/mentors/route.ts`**

```ts
import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  try {
    const data = await serverApiFetch(`/api/programs/${documentId}/mentors`);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message }, { status: status || 500 });
  }
}
```

- [ ] **Step 4: Write the four POST-only assign/remove route handlers**

Each of these four files follows the exact same shape — only the forwarded path differs. Create
all four:

`app/api/programs/assign-ongs/route.ts`:
```ts
import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";

export async function POST(request: Request) {
  const body = await request.text();
  try {
    const data = await serverApiFetch("/api/programs/assign-ongs", { method: "POST", body });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    const details = err instanceof ApiError ? err.details : undefined;
    return NextResponse.json({ message, details }, { status: status || 500 });
  }
}
```

`app/api/programs/remove-ongs/route.ts` (identical, path `/api/programs/remove-ongs`):
```ts
import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";

export async function POST(request: Request) {
  const body = await request.text();
  try {
    const data = await serverApiFetch("/api/programs/remove-ongs", { method: "POST", body });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    const details = err instanceof ApiError ? err.details : undefined;
    return NextResponse.json({ message, details }, { status: status || 500 });
  }
}
```

`app/api/programs/assign-mentors/route.ts` (path `/api/programs/assign-mentors`):
```ts
import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";

export async function POST(request: Request) {
  const body = await request.text();
  try {
    const data = await serverApiFetch("/api/programs/assign-mentors", { method: "POST", body });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    const details = err instanceof ApiError ? err.details : undefined;
    return NextResponse.json({ message, details }, { status: status || 500 });
  }
}
```

`app/api/programs/remove-mentors/route.ts` (path `/api/programs/remove-mentors`):
```ts
import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";

export async function POST(request: Request) {
  const body = await request.text();
  try {
    const data = await serverApiFetch("/api/programs/remove-mentors", { method: "POST", body });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    const details = err instanceof ApiError ? err.details : undefined;
    return NextResponse.json({ message, details }, { status: status || 500 });
  }
}
```

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 6: Leave changes uncommitted**

Per standing instruction, do not run `git add` or `git commit` at any point — not here, not in any later task. Leave the files you created/modified as uncommitted working-tree changes; the task reviewer will diff them directly.

---

### Task 9: Management programe — list page

**Files:**
- Create: `app/dashboard/fdsc/programe/page.tsx`
- Create: `components/features/programe/ProgrammeList.tsx`
- Create: `components/features/programe/ProgrammeRow.tsx`

**Interfaces:**
- Consumes: `serverApiFetch` (Task 2), `Program` type + `listPrograms` (Task 7, though the page
  uses `serverApiFetch` directly per the design's Server-Component-read pattern, not
  `listPrograms`, since it's the initial render).
- Produces: `ProgrammeList` (client component, receives `programs: Program[]` as a prop, owns
  delete confirmation and the "Adaugă program" trigger — the modal itself is Task 10) and
  `ProgrammeRow` (presentational, receives one `Program` + callbacks).

- [ ] **Step 1: Write `ProgrammeRow.tsx`**

```tsx
// components/features/programe/ProgrammeRow.tsx
import Link from "next/link";
import type { Program } from "@/lib/api/programs";

const STATUS_LABELS: Record<Program["programStatus"], string> = {
  Upcoming: "Viitor",
  Active: "Activ",
  Finished: "Finalizat",
};

const STATUS_COLORS: Record<Program["programStatus"], { bg: string; color: string }> = {
  Upcoming: { bg: "#fef3c7", color: "#92400e" },
  Active: { bg: "#dbeafe", color: "#1e40af" },
  Finished: { bg: "#dcfce7", color: "#166534" },
};

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

export function ProgrammeRow({
  program,
  onEdit,
  onDelete,
}: {
  program: Program;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusStyle = STATUS_COLORS[program.programStatus];

  return (
    <div className="bg-white rounded-xl border border-border p-5 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-1">
          <h3 className="font-semibold truncate" style={{ color: "#162040" }}>
            {program.name}
          </h3>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            {STATUS_LABELS[program.programStatus]}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(program.startDate)} – {formatDate(program.endDate)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/dashboard/fdsc/programe/${program.documentId}`}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border transition-colors hover:bg-muted"
          style={{ color: "#162040" }}
        >
          Gestionează
        </Link>
        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-border transition-colors hover:bg-muted"
          style={{ color: "#162040" }}
        >
          Editează
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "#ef4444" }}
        >
          Șterge
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `ProgrammeList.tsx`**

```tsx
// components/features/programe/ProgrammeList.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { deleteProgram } from "@/lib/api/programs";
import type { Program } from "@/lib/api/programs";
import { ApiError } from "@/lib/api/client";
import { ProgrammeRow } from "./ProgrammeRow";
import { CreateProgrammeModal } from "./CreateProgrammeModal";

const GROUPS: { key: Program["programStatus"]; label: string }[] = [
  { key: "Active", label: "Programe active" },
  { key: "Upcoming", label: "Programe viitoare" },
  { key: "Finished", label: "Programe finalizate" },
];

export function ProgrammeList({ programs }: { programs: Program[] }) {
  const router = useRouter();
  const [modalState, setModalState] = useState<
    { mode: "create" } | { mode: "edit"; program: Program } | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const byStatus = new Map<Program["programStatus"], Program[]>();
    for (const group of GROUPS) byStatus.set(group.key, []);
    for (const program of programs) {
      byStatus.get(program.programStatus)?.push(program);
    }
    return byStatus;
  }, [programs]);

  const handleDelete = async (program: Program) => {
    if (!confirm(`Ștergi programul „${program.name}”?`)) return;
    setError(null);
    try {
      await deleteProgram(program.documentId);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nu am putut șterge programul.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
          Management programe
        </h1>
        <button
          type="button"
          onClick={() => setModalState({ mode: "create" })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#2dbe8f" }}
        >
          <Plus size={18} />
          Adaugă program
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl p-4 text-sm"
          style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#ef4444" }}
        >
          {error}
        </div>
      )}

      <div className="space-y-8">
        {GROUPS.map((group) => {
          const items = grouped.get(group.key) ?? [];
          return (
            <div key={group.key}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {group.label} ({items.length})
              </h2>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Niciun program în această categorie.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((program) => (
                    <ProgrammeRow
                      key={program.documentId}
                      program={program}
                      onEdit={() => setModalState({ mode: "edit", program })}
                      onDelete={() => handleDelete(program)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalState && (
        <CreateProgrammeModal
          mode={modalState.mode}
          program={modalState.mode === "edit" ? modalState.program : undefined}
          onClose={() => setModalState(null)}
          onSaved={() => {
            setModalState(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
```

This imports `CreateProgrammeModal`, written in Task 10 — that's fine, the file won't typecheck
until Task 10 lands, which is expected mid-plan (the plan is executed task-by-task, not
file-by-file in isolation).

- [ ] **Step 3: Write the page**

```tsx
// app/dashboard/fdsc/programe/page.tsx
import { serverApiFetch } from "@/lib/api/server";
import type { Program } from "@/lib/api/programs";
import { ProgrammeList } from "@/components/features/programe/ProgrammeList";

export default async function ProgrammePage() {
  const { data: programs } = await serverApiFetch<{ data: Program[] }>("/api/programs");
  return <ProgrammeList programs={programs} />;
}
```

- [ ] **Step 4: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: errors ONLY about the missing `CreateProgrammeModal` module (`./CreateProgrammeModal`
not found) — that's expected until Task 10. No other errors should appear.

- [ ] **Step 5: Leave changes uncommitted**

Per standing instruction, do not run `git add` or `git commit` at any point — not here, not in any later task. Leave the files you created/modified as uncommitted working-tree changes; the task reviewer will diff them directly.

---

### Task 10: Create/edit program modal

**Files:**
- Create: `components/features/programe/CreateProgrammeModal.tsx`

**Interfaces:**
- Consumes: `createProgram`, `updateProgram`, `Program`, `ProgramDetail`, `PhaseInput` (Task 7),
  `getProgram` (Task 7, to fetch full phase list when opening in edit mode).
- Produces: `CreateProgrammeModal({ mode, program, onClose, onSaved })` — consumed by
  `ProgrammeList` (Task 9).

- [ ] **Step 1: Write the modal**

```tsx
// components/features/programe/CreateProgrammeModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, Plus, Trash2, X } from "lucide-react";
import { createProgram, updateProgram, getProgram } from "@/lib/api/programs";
import type { Program } from "@/lib/api/programs";
import { ApiError } from "@/lib/api/client";

const phaseSchema = z
  .object({
    documentId: z.string().optional(),
    title: z.string().trim().min(1, "Titlul fazei este obligatoriu"),
    startDate: z.string().min(1, "Data de început este obligatorie"),
    endDate: z.string().min(1, "Data de sfârșit este obligatorie"),
    hasEvaluation: z.boolean(),
  })
  .refine((phase) => phase.endDate >= phase.startDate, {
    message: "Data de sfârșit a fazei este înaintea datei de început",
    path: ["endDate"],
  });

const formSchema = z
  .object({
    name: z.string().trim().min(1, "Numele programului este obligatoriu"),
    startDate: z.string().min(1, "Data de început este obligatorie"),
    endDate: z.string().min(1, "Data de sfârșit este obligatorie"),
    phases: z.array(phaseSchema).min(1, "Programul trebuie să aibă cel puțin o fază"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Data de sfârșit este înaintea datei de început",
    path: ["endDate"],
  });

type FormValues = z.infer<typeof formSchema>;

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors bg-white text-sm";

const EMPTY_PHASE = { title: "", startDate: "", endDate: "", hasEvaluation: false };

export function CreateProgrammeModal({
  mode,
  program,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  program?: Program;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [loadingPhases, setLoadingPhases] = useState(mode === "edit");
  const [removedPhaseIds, setRemovedPhaseIds] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: program?.name ?? "",
      startDate: program?.startDate ?? "",
      endDate: program?.endDate ?? "",
      phases: mode === "create" ? [EMPTY_PHASE] : [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "phases" });

  useEffect(() => {
    if (mode !== "edit" || !program) return;
    getProgram(program.documentId)
      .then((res) => {
        reset({
          name: res.data.name,
          startDate: res.data.startDate,
          endDate: res.data.endDate,
          phases: res.data.phases.map((phase) => ({
            documentId: phase.documentId,
            title: phase.title,
            startDate: phase.startDate,
            endDate: phase.endDate,
            hasEvaluation: phase.hasEvaluation,
          })),
        });
      })
      .catch(() => setApiError("Nu am putut încărca fazele programului."))
      .finally(() => setLoadingPhases(false));
  }, [mode, program, reset]);

  const onSubmit = async (data: FormValues) => {
    setApiError(null);
    try {
      if (mode === "create") {
        await createProgram({
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          phases: data.phases.map(({ title, startDate, endDate, hasEvaluation }) => ({
            title,
            startDate,
            endDate,
            hasEvaluation,
          })),
        });
      } else if (program) {
        await updateProgram(program.documentId, {
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          phases: data.phases,
          removePhases: removedPhaseIds.length > 0 ? removedPhaseIds : undefined,
        });
      }
      onSaved();
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : "Nu am putut salva programul.");
    }
  };

  const handleRemovePhase = (index: number) => {
    const phase = fields[index];
    if (phase.documentId) {
      setRemovedPhaseIds((prev) => [...prev, phase.documentId as string]);
    }
    remove(index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-extrabold text-lg" style={{ color: "#162040" }}>
            {mode === "create" ? "Adaugă program" : "Editează program"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Închide" className="p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-5">
          {apiError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl p-4 text-sm"
              style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", color: "#ef4444" }}
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {apiError}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
              Nume program
            </label>
            <input className={inputClass} {...register("name")} />
            {errors.name && (
              <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                Dată început
              </label>
              <input type="date" className={inputClass} {...register("startDate")} />
              {errors.startDate && (
                <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#334155" }}>
                Dată sfârșit
              </label>
              <input type="date" className={inputClass} {...register("endDate")} />
              {errors.endDate && (
                <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold" style={{ color: "#334155" }}>Faze</label>
              <button
                type="button"
                onClick={() => append(EMPTY_PHASE)}
                className="inline-flex items-center gap-1 text-sm font-medium"
                style={{ color: "#2dbe8f" }}
              >
                <Plus size={16} /> Adaugă fază
              </button>
            </div>

            {loadingPhases ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 size={16} className="animate-spin" /> Se încarcă fazele...
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        placeholder="Titlul fazei"
                        className={inputClass}
                        {...register(`phases.${index}.title` as const)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhase(index)}
                        aria-label="Șterge faza"
                        className="p-2 shrink-0"
                        style={{ color: "#ef4444" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" className={inputClass} {...register(`phases.${index}.startDate` as const)} />
                      <input type="date" className={inputClass} {...register(`phases.${index}.endDate` as const)} />
                    </div>
                    <label className="flex items-center gap-2 text-sm" style={{ color: "#334155" }}>
                      <input type="checkbox" {...register(`phases.${index}.hasEvaluation` as const)} />
                      Faza necesită evaluare
                    </label>
                    {errors.phases?.[index]?.title && (
                      <p className="text-xs" style={{ color: "#ef4444" }}>{errors.phases[index]?.title?.message}</p>
                    )}
                    {errors.phases?.[index]?.endDate && (
                      <p className="text-xs" style={{ color: "#ef4444" }}>{errors.phases[index]?.endDate?.message}</p>
                    )}
                  </div>
                ))}
                {errors.phases?.root && (
                  <p className="text-xs" style={{ color: "#ef4444" }}>{errors.phases.root.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold border border-border"
              style={{ color: "#162040" }}
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingPhases}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "#2dbe8f" }}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Salvează
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors (this also resolves the `CreateProgrammeModal` import error left over from
Task 9).

- [ ] **Step 3: Manual verification**

Run `npm run dev`, log in as a `super-admin` account through the real login page at
`/autentificare`, land on `/dashboard/fdsc/programe`, click "Adaugă program", fill in a name,
start/end dates, one phase with "Faza necesită evaluare" checked (the backend requires at least
one phase with `hasEvaluation: true`), submit. Expected: modal closes, the new program appears in
the "Programe viitoare" or "Programe active" group depending on its dates.

- [ ] **Step 4: Leave changes uncommitted**

Per standing instruction, do not run `git add` or `git commit` at any point — not here, not in any later task. Leave the files you created/modified as uncommitted working-tree changes; the task reviewer will diff them directly.

---

### Task 11: Program detail — assign/remove orgs and mentors

**Files:**
- Create: `app/dashboard/fdsc/programe/[documentId]/page.tsx`
- Create: `components/features/programe/AssignOngsSection.tsx`
- Create: `components/features/programe/AssignMentorsSection.tsx`

**Interfaces:**
- Consumes: `getProgram`, `getProgramOngs`, `getProgramMentors`, `assignOngs`, `removeOngs`,
  `assignMentors`, `removeMentors` (Task 7/8), `listActiveOngs` (Task 7), `listActiveMentors`
  (Task 7).

- [ ] **Step 1: Write `AssignOngsSection.tsx`**

```tsx
// components/features/programe/AssignOngsSection.tsx
"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { assignOngs, removeOngs } from "@/lib/api/programs";
import type { AssignedOng } from "@/lib/api/programs";
import type { ActiveOng } from "@/lib/api/ongs";
import { ApiError } from "@/lib/api/client";

export function AssignOngsSection({
  programId,
  assigned,
  activeOngs,
  onChanged,
}: {
  programId: string;
  assigned: AssignedOng[];
  activeOngs: ActiveOng[];
  onChanged: () => void;
}) {
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const assignedIds = useMemo(() => new Set(assigned.map((ong) => ong.documentId)), [assigned]);
  const candidates = useMemo(
    () =>
      activeOngs.filter(
        (ong) =>
          !assignedIds.has(ong.documentId) &&
          ong.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [activeOngs, assignedIds, search],
  );

  const handleAdd = async (documentId: string) => {
    setError(null);
    setPending(true);
    try {
      await assignOngs(programId, [documentId]);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nu am putut adăuga organizația.");
    } finally {
      setPending(false);
    }
  };

  const handleRemove = async (documentId: string) => {
    setError(null);
    setPending(true);
    try {
      await removeOngs(programId, [documentId]);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nu am putut elimina organizația.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-semibold mb-3" style={{ color: "#162040" }}>
        Organizații ({assigned.length})
      </h3>

      {error && (
        <p className="text-xs mb-3" style={{ color: "#ef4444" }}>{error}</p>
      )}

      <div className="space-y-2 mb-4">
        {assigned.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nicio organizație asignată.</p>
        ) : (
          assigned.map((ong) => (
            <div
              key={ong.documentId}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted"
            >
              <span className="text-sm">{ong.name}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleRemove(ong.documentId)}
                aria-label={`Elimină ${ong.name}`}
                className="p-1 disabled:opacity-60"
                style={{ color: "#ef4444" }}
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <input
        placeholder="Caută organizație de adăugat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3.5 py-2 rounded-lg border border-border text-sm mb-2"
      />
      {search && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {candidates.length === 0 ? (
            <p className="text-xs text-muted-foreground px-1">Nicio organizație găsită.</p>
          ) : (
            candidates.map((ong) => (
              <button
                key={ong.documentId}
                type="button"
                disabled={pending}
                onClick={() => handleAdd(ong.documentId)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-muted disabled:opacity-60"
              >
                {ong.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write `AssignMentorsSection.tsx`**

```tsx
// components/features/programe/AssignMentorsSection.tsx
"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { assignMentors, removeMentors } from "@/lib/api/programs";
import type { AssignedMentor } from "@/lib/api/programs";
import type { ActiveMentor } from "@/lib/api/mentors";
import { ApiError } from "@/lib/api/client";

export function AssignMentorsSection({
  programId,
  assigned,
  activeMentors,
  onChanged,
}: {
  programId: string;
  assigned: AssignedMentor[];
  activeMentors: ActiveMentor[];
  onChanged: () => void;
}) {
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const assignedIds = useMemo(() => new Set(assigned.map((mentor) => mentor.documentId)), [assigned]);
  const candidates = useMemo(
    () =>
      activeMentors.filter(
        (mentor) =>
          !assignedIds.has(mentor.documentId) &&
          mentor.nume.toLowerCase().includes(search.toLowerCase()),
      ),
    [activeMentors, assignedIds, search],
  );

  const handleAdd = async (documentId: string) => {
    setError(null);
    setPending(true);
    try {
      await assignMentors(programId, [documentId]);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nu am putut adăuga mentorul.");
    } finally {
      setPending(false);
    }
  };

  const handleRemove = async (documentId: string) => {
    setError(null);
    setPending(true);
    try {
      await removeMentors(programId, [documentId]);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nu am putut elimina mentorul.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-semibold mb-3" style={{ color: "#162040" }}>
        Persoane resursă ({assigned.length})
      </h3>

      {error && (
        <p className="text-xs mb-3" style={{ color: "#ef4444" }}>{error}</p>
      )}

      <div className="space-y-2 mb-4">
        {assigned.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nicio persoană resursă asignată.</p>
        ) : (
          assigned.map((mentor) => (
            <div
              key={mentor.documentId}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted"
            >
              <span className="text-sm">{mentor.nume}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleRemove(mentor.documentId)}
                aria-label={`Elimină ${mentor.nume}`}
                className="p-1 disabled:opacity-60"
                style={{ color: "#ef4444" }}
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <input
        placeholder="Caută persoană resursă de adăugat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3.5 py-2 rounded-lg border border-border text-sm mb-2"
      />
      {search && (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {candidates.length === 0 ? (
            <p className="text-xs text-muted-foreground px-1">Nicio persoană resursă găsită.</p>
          ) : (
            candidates.map((mentor) => (
              <button
                key={mentor.documentId}
                type="button"
                disabled={pending}
                onClick={() => handleAdd(mentor.documentId)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-muted disabled:opacity-60"
              >
                {mentor.nume}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write the detail page**

Server Component for the initial fetch (program + assigned ongs/mentors + active picker lists),
a small client wrapper to re-fetch after a change (since assign/remove mutations happen in client
sub-components, we use `router.refresh()` to re-run the Server Component).

```tsx
// app/dashboard/fdsc/programe/[documentId]/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import type { ProgramDetail, AssignedOng, AssignedMentor } from "@/lib/api/programs";
import type { ActiveOng } from "@/lib/api/ongs";
import type { ActiveMentor } from "@/lib/api/mentors";
import { ProgramDetailClient } from "@/components/features/programe/ProgramDetailClient";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [program, ongsRes, mentorsRes, activeOngsRes, activeMentorsRes] = await Promise.all([
    serverApiFetch<{ data: ProgramDetail }>(`/api/programs/${documentId}`),
    serverApiFetch<{ data: { ongs: AssignedOng[] } }>(`/api/programs/${documentId}/ongs`),
    serverApiFetch<{ data: AssignedMentor[] }>(`/api/programs/${documentId}/mentors`),
    serverApiFetch<{ data: ActiveOng[] }>("/api/ongs/active"),
    serverApiFetch<{ data: ActiveMentor[] }>("/api/mentors/active"),
  ]);

  return (
    <div>
      <Link
        href="/dashboard/fdsc/programe"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-4"
        style={{ color: "#162040" }}
      >
        <ArrowLeft size={16} /> Înapoi la programe
      </Link>
      <h1 className="text-2xl font-heading font-extrabold mb-6" style={{ color: "#162040" }}>
        {program.data.name}
      </h1>
      <ProgramDetailClient
        programId={documentId}
        assignedOngs={ongsRes.data.ongs}
        assignedMentors={mentorsRes.data}
        activeOngs={activeOngsRes.data}
        activeMentors={activeMentorsRes.data}
      />
    </div>
  );
}
```

- [ ] **Step 4: Write the thin client wrapper**

Splitting this out keeps the page itself a Server Component while still letting the two sections
trigger a refresh after a mutation.

```tsx
// components/features/programe/ProgramDetailClient.tsx
"use client";

import { useRouter } from "next/navigation";
import type { AssignedOng, AssignedMentor } from "@/lib/api/programs";
import type { ActiveOng } from "@/lib/api/ongs";
import type { ActiveMentor } from "@/lib/api/mentors";
import { AssignOngsSection } from "./AssignOngsSection";
import { AssignMentorsSection } from "./AssignMentorsSection";

export function ProgramDetailClient({
  programId,
  assignedOngs,
  assignedMentors,
  activeOngs,
  activeMentors,
}: {
  programId: string;
  assignedOngs: AssignedOng[];
  assignedMentors: AssignedMentor[];
  activeOngs: ActiveOng[];
  activeMentors: ActiveMentor[];
}) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <AssignOngsSection
        programId={programId}
        assigned={assignedOngs}
        activeOngs={activeOngs}
        onChanged={() => router.refresh()}
      />
      <AssignMentorsSection
        programId={programId}
        assigned={assignedMentors}
        activeMentors={activeMentors}
        onChanged={() => router.refresh()}
      />
    </div>
  );
}
```

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 6: Manual verification**

From `/dashboard/fdsc/programe`, click "Gestionează" on a program. Expected: page shows the
program name, two cards (Organizații / Persoane resursă). Type in the org search box, click a
result — it moves from the search results into the assigned list without a full page reload
(only a `router.refresh()` re-fetch). Click the `X` next to an assigned org — it's removed.
Repeat for mentors.

- [ ] **Step 7: Leave changes uncommitted**

Per standing instruction, do not run `git add` or `git commit` at any point — not here, not in any later task. Leave the files you created/modified as uncommitted working-tree changes; the task reviewer will diff them directly.

---

### Task 12: Organizații — read-only browse grid

**Files:**
- Create: `app/api/ongs/route.ts`
- Modify: `lib/api/ongs.ts` (extend the file created in Task 7)
- Create: `app/dashboard/fdsc/organizatii/page.tsx`
- Create: `components/features/organizatii/OrganizatiiGrid.tsx`
- Create: `components/features/organizatii/OngCard.tsx`

**Interfaces:**
- Produces (added to `lib/api/ongs.ts`): `Ong` type; `listOngs(): Promise<{ data: Ong[] }>`
  (distinct from `listActiveOngs` from Task 7, which stays for the assign-picker use case).

- [ ] **Step 1: Write `app/api/ongs/route.ts`**

```ts
import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";

export async function GET() {
  try {
    const data = await serverApiFetch("/api/ongs");
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "A apărut o eroare.";
    const status = err instanceof ApiError ? err.status : 500;
    return NextResponse.json({ message }, { status: status || 500 });
  }
}
```

- [ ] **Step 2: Extend `lib/api/ongs.ts`**

Add to the existing file (keep `ActiveOng`/`listActiveOngs` from Task 7 as-is):

```ts
export interface Ong {
  documentId: string;
  name: string;
  cui: string;
  website: string;
  adresa: string;
  dataInfiintare: string;
  domeniuActivitate: string;
  judet: { documentId: string; nume: string } | null;
  localitate: { documentId: string; nume: string } | null;
}

export function listOngs() {
  return localApiFetch<{ data: Ong[] }>("/api/ongs");
}
```

- [ ] **Step 3: Write `OngCard.tsx`**

```tsx
// components/features/organizatii/OngCard.tsx
import type { Ong } from "@/lib/api/ongs";

export function OngCard({ ong }: { ong: Ong }) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <h3 className="font-semibold mb-1" style={{ color: "#162040" }}>
        {ong.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {ong.localitate?.nume ?? "—"}, {ong.judet?.nume ?? "—"}
      </p>
      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">CUI</dt>
          <dd style={{ color: "#334155" }}>{ong.cui}</dd>
        </div>
        {ong.domeniuActivitate && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Domeniu</dt>
            <dd className="text-right" style={{ color: "#334155" }}>{ong.domeniuActivitate}</dd>
          </div>
        )}
        {ong.website && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Website</dt>
            <dd className="truncate max-w-[60%]" style={{ color: "#334155" }}>{ong.website}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
```

- [ ] **Step 4: Write `OrganizatiiGrid.tsx`**

```tsx
// components/features/organizatii/OrganizatiiGrid.tsx
"use client";

import { useMemo, useState } from "react";
import type { Ong } from "@/lib/api/ongs";
import { OngCard } from "./OngCard";

export function OrganizatiiGrid({ ongs }: { ongs: Ong[] }) {
  const [search, setSearch] = useState("");
  const [judetFilter, setJudetFilter] = useState("");

  const judete = useMemo(() => {
    const unique = new Map<string, string>();
    for (const ong of ongs) {
      if (ong.judet) unique.set(ong.judet.documentId, ong.judet.nume);
    }
    return [...unique.entries()].sort((a, b) => a[1].localeCompare(b[1], "ro"));
  }, [ongs]);

  const filtered = useMemo(
    () =>
      ongs.filter((ong) => {
        const matchesSearch = ong.name.toLowerCase().includes(search.toLowerCase());
        const matchesJudet = !judetFilter || ong.judet?.documentId === judetFilter;
        return matchesSearch && matchesJudet;
      }),
    [ongs, search, judetFilter],
  );

  return (
    <div>
      <h1 className="text-2xl font-heading font-extrabold mb-6" style={{ color: "#162040" }}>
        Organizații
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          placeholder="Caută după nume..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-border text-sm"
        />
        <select
          value={judetFilter}
          onChange={(e) => setJudetFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-lg border border-border text-sm bg-white"
        >
          <option value="">Toate județele</option>
          {judete.map(([documentId, nume]) => (
            <option key={documentId} value={documentId}>{nume}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nicio organizație găsită.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ong) => (
            <OngCard key={ong.documentId} ong={ong} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Write the page**

```tsx
// app/dashboard/fdsc/organizatii/page.tsx
import { serverApiFetch } from "@/lib/api/server";
import type { Ong } from "@/lib/api/ongs";
import { OrganizatiiGrid } from "@/components/features/organizatii/OrganizatiiGrid";

export default async function OrganizatiiPage() {
  const { data: ongs } = await serverApiFetch<{ data: Ong[] }>("/api/ongs");
  return <OrganizatiiGrid ongs={ongs} />;
}
```

- [ ] **Step 6: Typecheck and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 7: Manual verification**

Navigate to `/dashboard/fdsc/organizatii` (via the sidebar). Expected: a card grid of
organizations, search box filters by name live, județ dropdown filters by county, no delete
button and no "Vezi ONG" link anywhere (intentionally dropped per the design doc).

- [ ] **Step 8: Leave changes uncommitted**

Per standing instruction, do not run `git add` or `git commit` at any point — not here, not in any later task. Leave the files you created/modified as uncommitted working-tree changes; the task reviewer will diff them directly.

---

### Task 13: Full manual QA pass

**Files:** none (verification only).

- [ ] **Step 1: Build check**

Run: `npm run build`
Expected: builds successfully with no type or lint errors surfaced during build.

- [ ] **Step 2: Full flow QA**

With both dev servers running and a real `super-admin` account (create one directly in Strapi
admin if needed, per the design doc's note that FDSC accounts are provisioned there):

1. Visit `/dashboard/fdsc` while logged out → redirected to `/autentificare`.
2. Log in as `super-admin` at `/autentificare` → redirected to `/dashboard/fdsc/programe`.
3. Sidebar shows only "Programe" → "Management programe" / "Organizații"; user block shows the
   real name and "Super Admin".
4. Create a program with two phases (at least one with evaluation checked) → appears in the
   correct status group.
5. Edit the program (rename it, add a third phase) → changes persist after refresh.
6. Open "Gestionează" → assign an organization and a mentor, then remove each → list updates
   without a full page reload.
7. Delete the program (with no reports attached, this should succeed) → disappears from the list.
8. Navigate to "Organizații" → search and județ filter both narrow the grid correctly.
9. Click "Deconectare" → redirected to `/`, then visiting `/dashboard/fdsc/programe` directly
   redirects to `/autentificare` (session is actually gone, not just UI-hidden).
10. Log in as a non-`super-admin` account (e.g. an NGO admin from the existing registration
    flow) → redirected to `/` (not `/dashboard/fdsc/*`), and manually visiting
    `/dashboard/fdsc/programe` also redirects to `/`.

- [ ] **Step 3: Report results**

If every step in Step 2 passes, the feature is complete. If any step fails, treat it as a bug in
the relevant task above — fix it in that task's files, re-run that task's typecheck/lint, and
re-run this QA pass from the top.
