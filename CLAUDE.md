@AGENTS.md

# Project Rules for Claude

## Stack

- Next.js (App Router) with TypeScript in strict mode.
- Styling: Tailwind CSS. Do not mix in CSS Modules, styled-components, or inline styles unless explicitly asked.
- Package manager: npm.
- State: prefer React state/Context for local/UI state; only reach for a library (Zustand, React Query, etc.) if data-fetching/caching complexity actually requires it — ask before adding new dependencies.

## Figma → Code Workflow

- Always pull real values from the Figma MCP server (spacing, color, typography, radius, shadows, component names) — never estimate or eyeball from a screenshot.
- If the Figma file has design tokens/variables, use those instead of hardcoded values. Map them to Tailwind theme config (`tailwind.config.ts`) rather than sprinkling arbitrary values (`p-[13px]`) throughout components.
- Match spacing, font sizes, and colors exactly as specified in Figma. If a value doesn't cleanly map to the Tailwind scale, extend the theme config rather than rounding to the nearest default.
- Use real copy and asset references from the Figma file. Do not invent placeholder text/images when real content exists in the design.
- If a Figma frame only shows one breakpoint, ask how it should adapt at other sizes rather than guessing responsive behavior.
- If Figma data is ambiguous, missing, or the MCP call fails, say so explicitly rather than filling in a plausible-looking guess.

## Component Architecture

- Structure:
  - `/components/ui` — small reusable primitives (Button, Input, Card, etc.)
  - `/components/features` — composed, feature-specific components
  - `/app` — routes/pages only, minimal logic
- Before creating a new component, check whether an existing one in `/components/ui` already covers it — reuse and extend via props rather than duplicating.
- Keep components small and composable. Split a component if it's doing more than one clear job.
- Co-locate component-specific types/utils with the component unless they're shared.

## Accessibility & Quality Baseline

- Use semantic HTML elements (`button`, `nav`, `header`, etc.) over generic `div`s with click handlers.
- All images need meaningful `alt` text (from Figma layer/content context, not filler).
- Interactive elements need visible focus states and keyboard support.
- Maintain sufficient color contrast per the design — flag it if Figma's chosen colors fail WCAG AA.

## Process

- After any code change, run lint, typecheck, and build — don't rely on "looks right" alone. Report and fix errors before considering a task done.
- Don't add new dependencies without asking first.
- When implementing a Figma frame, briefly state which frame/node you pulled from and any values you couldn't resolve, so I can verify.
- Prefer small, reviewable diffs over large multi-feature changes in one pass.

---
