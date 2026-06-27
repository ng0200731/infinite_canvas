# Testing checklist

The app runs with **zero keys** in local/demo mode (data in `localStorage`).
Run through this checklist in a browser after `pnpm dev`. Items marked 🔑 need the
matching key in `.env.local`.

> Note: automated browser (E2E) testing is intentionally not included in this
> repo. The local persistence layer is covered by unit tests (`pnpm test`); the
> canvas interactions below should be verified manually.

## Local / demo mode (no keys)

- [ ] `/` landing renders with a “Local/demo mode” + “AI generation off” line.
- [ ] `/login` and `/signup` show the “No authentication in demo mode” notice with a link into the app.
- [ ] `/projects` dashboard shows the empty state, then a project after creating one.
- [ ] Create a project → redirected to the project page.
- [ ] Create a canvas → redirected into the canvas editor.
- [ ] Canvas: click palette items to drop **Note / Image / Group / Generate** nodes; drag them around; pan/zoom; minimap + controls work.
- [ ] Type in a Note node; the text persists after a full page reload (autosave → localStorage).
- [ ] **Image node**: click or drop an image file → it appears (resized); reload persists it.
- [ ] Drag an Image node’s reference handle (top-right link icon) onto a **Generate** node’s reference slot → it’s listed there.
- [ ] **Generate** node: with no `FAL_KEY`, the Generate button is disabled with a hint.
- [ ] Delete a project from the dashboard → its canvases are gone too.

## With `FAL_KEY` 🔑

- [ ] Generate node (text → image): enter a prompt, Generate → an image node appears next to it.
- [ ] Generate node (Kontext edit): add a reference image, prompt an edit → result image appears.

## With Supabase keys 🔑 (run `supabase/migrations/0001_init.sql` first)

- [ ] Sign up / log in / sign out round-trips; protected routes redirect to `/login`.
- [ ] Projects & canvases persist to Postgres across reloads and a second device.
- [ ] Uploaded images are stored in the private-per-user `uploads` bucket.

## Automated

- [ ] `pnpm test` — unit tests for the local store + store selector pass.
- [ ] `pnpm lint` — eslint passes.
- [ ] `pnpm build` — production build succeeds.
