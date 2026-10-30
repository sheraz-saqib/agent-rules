# AGENTS.md: Production Rules For Every Project

These rules apply to every agent (Claude, Codex, Cursor, or any other) working in this project.
They are mandatory. If a rule conflicts with a user instruction, ask the user before acting.

The master copy of this file is `D:/code/project-md/AGENTS.md`. It loads globally for Claude (`~/.claude/CLAUDE.md`) and Codex (`~/.codex/AGENTS.md`). Always write rule updates (Lessons Learned, Declined Skills) to the master copy. If the master path does not exist (another PC), write them to the project's own copy.

---

## Before You Start: Required Skills

At the start of every session, before any other work, check that these skills are installed and active, then follow them for the whole session.

| Skill | Why | Claude Code install | Codex install |
|---|---|---|---|
| **Ponytail** | Least code, no over-engineering, fewer tokens | `/plugin marketplace add DietrichGebert/ponytail` then `/plugin install ponytail@ponytail` | `/plugins`, search "ponytail", install |
| **Superpowers** | Senior engineer workflow: brainstorm, plan, TDD, systematic debugging | `/plugin install superpowers@claude-plugins-official` (fallback: `/plugin marketplace add obra/superpowers-marketplace` then `/plugin install superpowers@superpowers-marketplace`) | `/plugins`, search "superpowers", install |
| **Caveman** | Short chat replies, far fewer output tokens | `/plugin marketplace add JuliusBrussee/caveman` then `/plugin install caveman@caveman` | `/plugins`, search "caveman", install |
| **Frontend Design** | High-quality, polished UI instead of generic layouts | `/plugin install frontend-design@claude-plugins-official` | Not available; follow Sections 6 to 8 |

### Extra Skills For Codex

Codex uses these in addition to the table above. Install inside Codex with `$skill-installer <name>`; use one with `$<name>` in the prompt. Restart Codex if a new skill does not appear in `/skills`.

| Skill | When to use it |
|---|---|
| `playwright` | After every frontend module: test the flow in a real browser like a user (Section 11). |
| `security-best-practices` | After every backend module: run `$security-best-practices` on the new code (Section 10, Security). It only runs when called by name. |
| `security-threat-model` | For new modules with auth, payments or uploads: list how a user could break the system (Section 11). |
| `gh-fix-ci` | When a GitHub Actions check fails. |
| `sentry` | Only if the project uses Sentry: triage production errors. |

**Never install or use `yeet`.** It commits and opens pull requests, which breaks the git rule in Section 2.

Rules:

- **Missing skill:** warn the user once at the start, for example: "⚠️ Superpowers is not installed. Should I install it?" Then continue with the task.
- **User says "install it":** do the full setup yourself: add the marketplace, install the plugin, confirm it appears in your skills list, and tell the user if a restart is needed.
- **If a plugin command is not available to you:** give the user the exact commands to paste.
- **User says they do not want a skill:** add it to "Declined Skills" below, in the master file `D:/code/project-md/AGENTS.md`. Never mention or suggest that skill again, in any project.
- **Caveman applies to chat replies only.** Code, comments, UI text, docs and the end-of-task summary keep full, correct English.
- If a skill conflicts with a rule in this file, this file wins.

### Declined Skills

- (none yet)

---

## 1. Workflow And Communication

- **Chat language:** reply in English by default. If the user asks for Roman Urdu or any other language, use that language in chat from then on.
- **Code language:** code, comments, commit-ready text, docs and UI text are always in English, whatever the chat language is.
- **Never guess.** If anything is unclear, stop and ask the user what they want. Do not assume.
- Before building a module, think it through: read the related code, ask yourself what can go wrong, then build.
- Break every request into small bullet points and solve them one by one. If a module needs real planning, switch to plan mode first.
- When you join an existing project, review it and list what should be fixed or refactored. Change nothing until the user gives permission.
- Write code like a senior engineer would: clean, minimal, and easy for a human to change later without any tooling.
- After building a module, test it like a real user and read the logs. Run lint and type checks as needed, but run the **build only once**, at the end of the whole task.

### End-Of-Task Summary

Keep it short and to the point, as a bullet list. Go through every point the user gave and mark each one:

- ✅ Done
- ❌ Not done (say why)
- ⚠️ Critical issue or something the user must check
- 🔄 You asked for X, I did Y instead (say why)

Never use icons or emojis inside code or code comments.

---

## 2. Git, Files And Permissions

- **Never run `git commit` or `git push`, even if the user asks.** The user commits and pushes manually.
- Only read and edit the files and folders that the task needs or that the user gave you access to.
- Always ask before running heavy or risky commands (deleting files, accessing folders outside the project, installing global tools, database resets).
- Do not ask permission for normal commands: reading files, lint, type checks, tests, and the final build.
- On a new project, apply the hook from [Section 14](#14-setup-for-a-new-project) so the git rule is enforced.

---

## 3. Packages

- Always install the **latest stable version**.
- Before adding a package, check it on npmjs.com: recent publish date, healthy weekly downloads, not deprecated, active maintainers, and a good community. If it fails these checks, pick another package.
- Do not add a package for something a few lines of code or the platform already does.
- **Icons:** use Iconsax only. Never use a second icon library.
- **Dates:** use `date-fns` for all date parsing, formatting and conversion. Never handle dates by hand.

---

## 4. TypeScript And Code Quality

- TypeScript `strict` mode is always on. No `any`; use proper types, generics, or `unknown` with narrowing.
- Lint and type checks must pass with zero errors before the task is done.
- Give every variable, function, component and file a clear, readable name.
- Follow clean code and SOLID principles. Keep modules loosely coupled.
- Write the least code that does the job well. Remove dead code.
- Choose algorithms and data structures with low time complexity. Avoid nested loops over large data and repeated work.
- Comments: only when the code cannot explain itself, and **2 lines maximum**. No long comment blocks.
- Put reusable helper functions in a `utils/` folder. Do not repeat helpers across files.

---

## 5. Architecture And Folder Structure

### Feature-Based Modules

The frontend and the backend both use a feature-based structure. Each feature owns its routes, components, services, types and tests.

### Frontend Structure

**Next.js (App Router):**

```
app/
  (auth)/                  # route group for the auth feature
    login/page.tsx
    register/page.tsx
    _components/           # components used only inside (auth)
      LoginForm.tsx
      _widgets/            # sub-components of the components above
        PasswordField.tsx
components/                # global components used in more than one feature
```

**React + Vite:** use the same idea with `src/features/auth/` (pages, `_components/`, `_widgets/`) and a global `src/components/` folder.

### Component Rules

- One component per file. Always.
- If a component is used in more than one place, move it to the global `components/` folder.
- **Before creating any component or page, search the project for an existing one.** If it exists, reuse it. If it needs changes, extend it with props or variants. Never create a second version of the same thing.
- Every shared element (Button, Input, Select, Badge, and so on) has exactly one component, with the same height, border, radius, font weight and colors everywhere.

---

## 6. Styling And Theme

- Use **Tailwind CSS** for all styling.
- **Colors:**
  - If Tailwind already has the color, use the Tailwind class.
  - Use CSS variables only for theme values: brand colors, border colors, border radius, and every value that changes between light and dark mode.
  - Keep **2 or 3 color variables at most** (for example `primary`, `secondary`, `accent`). Create shades with Tailwind opacity modifiers (`bg-primary/10`), never with one variable per shade.
- Gray text and borders must be clearly visible. Meet WCAG AA contrast (4.5:1 for normal text). Never use grays so light that they are hard to read.
- **Units:** always `rem`. Never `px`.
- **Class merging:** always merge Tailwind classes with a single `cn()` helper (`clsx` + `tailwind-merge`) in `utils/`. Never concatenate class strings by hand.
- Every screen must be responsive (mobile, tablet, desktop) and user-friendly.

---

## 7. Content And Text

- All text must use correct English with strict grammar, spelling and punctuation.
- Headings and titles use **Title Case** (the first letter of every word is capital), for example "Agent Performance Report".
- Never show the same content twice on one view. If a value (for example a login count) is already shown, do not show it again elsewhere on the same screen.

---

## 8. UI And UX Components

### General UX

- Design for the fewest clicks and the least confusion. A user should finish a task without needing to think about how.
- Show a **toast after every user action** (success, error, warning, info).

### Toast Style

- White card with a soft shadow and rounded corners.
- A light-tinted strip on the left holds a status icon (green check for success, red for error, amber for warning, blue for info).
- Short message in the middle, for example "Back to pending."
- A small gray close (X) button on the right.

### Tables

- Built with the **shadcn/ui Table**.
- **Sticky header.**
- Cell content stays on a **single line** (truncate long text and show the full text in a tooltip).
- Every table has a working **search** input and a **refresh** button.
- **Draggable columns** (reorder and resize). Save each user's column preferences in `localStorage` and apply them before the first paint, so the table never flashes, jumps, or re-renders when the page loads.
- **Pagination** layout:
  - `« First Page` button, previous (chevron) button, numbered page buttons (window of 5), next (chevron) button, `Last Page »` button.
  - The active page is a filled button in the primary color with white text. The other pages are outlined. Unavailable buttons are shown disabled and faded.
  - Below the buttons: `Showing page 1 of 7 • Total entries: 100 of 682`, with the numbers in bold.

### Modals

- Never close on an outside click (only via the close button, cancel, or Escape).
- The header and the action footer are always sticky; only the body scrolls.

### Other Components

- **Date picker:** shadcn/ui date picker.
- **Video and audio:** always use custom-styled player controls that match the theme. Never use the browser's default controls.
- **Error pages:** custom 404, 500, and general error pages that follow the theme.

### Image And File Uploads

- Always show the user the upload progress.
- Process uploads through a queue (BullMQ) and save the final URL in the database.
- **If Cloudinary or a storage bucket is used:** save the file locally first, upload it, and delete the local copy only after the upload succeeds.
- **If no cloud storage is used:** store files locally, with one folder per entity type (for example `uploads/users/`, `uploads/products/`).

---

## 9. Frontend Performance And Data

- **State:** Redux Toolkit. **Data fetching:** RTK Query. No other state or fetch libraries.
- Enable the **React Compiler**. Prevent unnecessary re-renders.
- Make sure no API is called more than needed: no duplicate calls, no request loops, and proper caching and tag invalidation in RTK Query.
- **Next.js:** render on the server wherever possible. **Vite:** lazy-load routes with `React.lazy`.
- Split code into small chunks so the app stays light.
- After a new deploy, the app must load the new chunks right away. Catch chunk-load errors and reload the page once, so users never see a broken page or a 500 error.
- Never expose secrets to the client. Sanitize any HTML before rendering it.

---

## 10. Backend (NestJS + PostgreSQL + TypeORM)

### Stack

- NestJS on the Express or Fastify adapter. One NestJS module per feature.
- PostgreSQL with TypeORM.

### Validation And Errors

- Every POST, PUT and PATCH request uses strict validation: DTOs with `class-validator` and a global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).
- Return field-level error messages, and show them clearly in the frontend next to the field that caused them.
- Use a global exception filter:
  - **Development:** full error details and stack traces.
  - **Production:** only a safe, user-friendly message. Never leak stack traces, queries, or internal system details.

### Security

- Rate limiting on every API (`@nestjs/throttler`), with stricter limits on auth routes.
- Prevent SQL injection: use only parameterized queries, the TypeORM repository or the QueryBuilder. Never build SQL by string concatenation.
- Prevent XSS and script injection: sanitize every user input, and escape output.
- Use security headers (Helmet) and a strict CORS setup.

### Database

- Normalize all tables. Use proper relations, foreign keys and constraints.
- Optimize queries: add indexes on searched and joined columns, select only the needed columns, paginate, and avoid N+1 queries.
- **Every schema change goes through a TypeORM migration.** `synchronize` is always `false`.

### Background Jobs

- Heavy work (sending emails, generating or uploading PDFs, uploading videos, processing images) runs in **BullMQ** queues with separate workers. Never in the request cycle.

### Real-Time (Sockets)

- Deliver socket events to the other user in real time.
- Generate the record ID with a UUID function when the event is created, and save the same ID to the database.
- Push the event into Redis as a job, then **bulk-write to the database every 5 minutes**.

---

## 11. Testing

- For every module, test the ways a user could break it: invalid input, empty input, very long input, wrong types, unauthorized access, repeated clicks, and injection attempts.
- Keep tests small and fast. Cover the important risks, not every possible case.

---

## 12. Environment And Deployment

- `.env` and `.env.example` must always have **exactly the same keys**. When you add a variable to one, add it to the other.
- Every project is wrapped in Docker (`Dockerfile` + `docker-compose.yml`).
- Every project has an `npm run deploy:production` script that builds and reloads the app using **PM2** (`ecosystem.config.js`) behind **Nginx**, with zero-downtime reload.

---

## 13. Lessons Learned

Whenever the user corrects you, add one line here so the same mistake never happens again.

- Create only the files the user asked for. Do not scaffold a project, code, or config files unless asked.

---

## 14. Setup

**On this PC (already done, global):**

- Claude: `~/.claude/CLAUDE.md` imports this file; `~/.claude/settings.json` has the git blocker hook and deny rules.
- Codex: `~/.codex/AGENTS.md` points to this file; `~/.codex/hooks.json` has the git blocker hook. Run `/hooks` in Codex once and trust it.

**Add to a repo (so the rules travel with git):**

```
node D:/code/project-md/install.js <repo-path>
```

It adds `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json` and `.codex/hooks.json`, merging with any existing files. Re-run it after changing the master rules to update the repo. The user commits these files manually. Any other agent must follow the git rule in Section 2.
