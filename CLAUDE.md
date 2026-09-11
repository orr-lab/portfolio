# orrknaan.com

Personal portfolio for Orr Knaan. Work across film, music, code and drawing.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Neon Postgres · Vercel Blob.

No auth library, no CMS, no component library, no state library, no markdown
editor. `marked` renders `body` markdown server-side. **Ask before adding any
dependency.**

Neon, not "Vercel Postgres" — that product was folded into the Vercel
Marketplace. Driver is `@neondatabase/serverless`; `@vercel/postgres` is dead.

## The three invariants

Everything in this repo follows from these. Break one and the site is wrong.

1. **Adding a piece of work is one form on a phone.** One `items` row plus
   `media` rows. Never a code change, never a deploy.
2. **Adding a whole new KIND of work is also just a form.** A new collection is
   a row in `collections`. Never a code change.
3. **Different kinds render differently.** A film is not a composition is not a
   drawing. One universal card style would be a design failure.

Invariant 2 is held by exactly one file: `components/layouts/index.ts` maps the
`collections.layout` string to a component. Adding a *layout* touches that file.
Adding a *collection* touches no file at all.

## Data model

`collections` → `items` → `media`. See `db/migrations/`.

Rules that matter more than the schema:

- **The first `media` row by `sort_order` is the cover.** No cover column, no
  `is_cover` flag, nothing that can desync.
- **`body IS NULL` means no detail page** and the card links nowhere internal.
- **Every optional field degrades gracefully.** Title + blurb alone must render
  correctly. A poem is an item with a body and zero media; that must look right.
- **Drafts appear in `/admin` and nowhere else.**
- **Slugs auto-generate from ASCII titles only.** A Hebrew title yields an empty
  slug, so the admin requires a manual one and checks uniqueness before saving.
- **`items.date_label` overrides the displayed date**; `year` stays an int and
  does the sorting. Ranges like `2016–2020` and `2026–` live in `date_label`.
- **At most one featured item site-wide**, enforced by a partial unique index,
  not by convention. The admin clears then sets inside one transaction.
- **Reserved slugs:** `admin`, `work`, `api`, `_next`. `/[collection]` is at the
  root, so a collection slugged `admin` would be permanently unreachable.

## The seven layouts

This is the ceiling. Do not add an eighth without asking Orr.

| Layout | For | Shape |
|---|---|---|
| `feature` | films | one per row, full width, large cover or player |
| `grid` | code | cards, cover on top, title, blurb |
| `list` | compositions | compact rows, year right, inline audio, comfortable at 40+ |
| `gallery` | drawings | image grid, no titles, no cards, lightbox on tap |
| `prose` | writing | title, date, first lines of body. No image slot, no border |
| `timeline` | chronological work | vertical rail, sticky year markers |
| `index` | credits, education | one line, title left, year right. No blurb, no media |

All seven take identical props, so every layout composes with every collection
flag by construction. Combinations that must not break:

- `grid` + `media_mode: 'none'` → a text card, **not** an empty image box
- `list` + `show_year: false` → right-aligns nothing, leaves no gap
- `gallery` + `media_mode: 'none'` → invalid, warned in `/admin`

## Audio

Plain `<audio>` with a minimal custom skin. **No persistent cross-page player.**
Music stops on navigation; that is accepted and deliberate.

## Icons

`app/favicon.ico` and `app/apple-icon.png` — an amber "OK" monogram on near-black.
Next serves them at `/favicon.ico` and `/apple-icon.png` and emits the link tags.

**Deliberately no SVG icon.** Firefox is unreliable with SVG favicons, especially
ones carrying a `prefers-color-scheme` media query, and it always probes the bare
`/favicon.ico`. An ICO plus a PNG is the combination nothing argues with.

The ICO holds **32x32 and 48x48 only**. 16x16 was cut: two bold letters in
sixteen pixels closes the O's counter and muddies the K. Browsers that want 16
downscale the 32 with better filtering than hand-rasterised tiny text.

Don't change the icon casually — people find a tab by its icon. If you do
regenerate it, render at 4x and downsample, and fit the mark to its *ink* box
(`actualBoundingBoxLeft/Right`), not its advance width: K's diagonal overhangs
the advance width and pushes the mark off-canvas at small sizes.

## Deployment

Live at **https://orrknaan.com** (the apex serves; `www` 308s to it, matching
the other `*.orrknaan.com` subdomains, none of which use `www`).

- Repo: `github.com/orr-lab/portfolio`, public, connected to the Vercel project
  `portfolio` — pushing to `main` deploys production.
- Database: Neon resource `portfolio-db`. Blob store: `portfolio-media`.
- Cloudflare holds DNS: the apex points at Vercel **DNS-only (grey cloud)**.
  Proxying it would put Cloudflare in front of Vercel's own CDN and break
  Next's image optimisation cache headers. Leave it grey.

Public pages are static and revalidated on write: every server action in
`app/admin/actions.ts` calls `revalidateSite()`, which clears the whole public
tree. That breadth is deliberate — the nav bar is built from the collections
table and appears on every page, and publishing one item can change whether
its collection is listed at all, so almost any write can alter almost any page.

## Commands

```bash
npm run dev              # local dev
npm run build            # production build, run before every push
npm run lint             # typecheck
npm run db:migrate       # apply db/migrations/*.sql in order
npm run db:seed          # seed collections + items (idempotent)
vercel env pull .env.local   # refresh Neon + Blob credentials
```

`ADMIN_PASSWORD` is a Vercel env var, set for Production only. It is never
committed, never written to a file, and never printed. Rotate with
`vercel env add ADMIN_PASSWORD production` — note that rotating it invalidates
every existing admin session, because the cookie is derived from it.

To use `/admin` on localhost, add it for development too
(`vercel env add ADMIN_PASSWORD development`) and re-run `vercel env pull`.

**Every server action re-checks the session.** A server action is its own
public HTTP endpoint, so the redirect in `app/admin/(authed)/layout.tsx` is
navigation convenience, not the security boundary. The same is true of
`app/api/blob/upload/route.ts`, which checks before a token exists.

## Writing code here

Orr knows JavaScript, Python/Flask and Java, and has not used React or
TypeScript. When a React/Next concept appears that he has not met — props,
`useState`, `'use client'`, server actions, revalidation — add **one** comment
line where it appears explaining it. One line. Do not write a tutorial, and do
not re-explain a concept that already has its comment somewhere above.
