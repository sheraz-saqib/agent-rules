# AGENTS.md: Production Rules For Every Project

These rules apply to every agent (Claude, Codex, Cursor, or any other) working in this project.
They are mandatory. If a rule conflicts with a user instruction, ask the user before acting.

---

## 1. Workflow And Communication

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

## 14. Setup For A New Project

1. Copy `AGENTS.md`, `CLAUDE.md`, the `.claude/` folder and the `.codex/` folder into the project root.
2. `.claude/settings.json` is the git blocker for Claude Code. It blocks `git commit` and `git push` with a hook and a deny rule, and lets normal read, lint, test and build commands run without asking.
3. `.codex/hooks.json` is the same git blocker for Codex. Codex loads project hooks only after the project is trusted, so run `/hooks` in Codex once and trust it.
4. Any other agent must follow the git rule in Section 2.
