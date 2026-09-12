# Portfolio

A portfolio site for work that does not all look alike — films, music, code,
drawings, writing. Add a piece from your phone in one form. Add a whole new
*kind* of work the same way.

**Live example: [orrknaan.com](https://orrknaan.com)** — films, piano
compositions, code projects, a daily drawing. Each renders differently, and
none of it is hardcoded.

---

## Why this exists

Most portfolio templates give you one card style and expect every piece of work
to fit it. A nine-minute film, a piano arrangement and a pencil sketch are not
the same shape and should not be shown as though they were.

Three rules hold the whole thing together:

1. **Adding a piece of work is one form on a phone.** One row in `items`, plus
   its files. Never a code change, never a deploy.
2. **Adding a whole new kind of work is also just a form.** A new collection is
   a row in `collections`. Never a code change.
3. **Different kinds render differently.** Seven layouts, picked per
   collection. One universal card style would be a design failure.

Invariant 2 is held by exactly one file — `components/layouts/index.ts` maps a
layout name to a component. Adding a *layout* touches that file. Adding a
*collection* touches no file at all.

## The seven layouts

Pick one per collection in `/admin`. This is the ceiling; there is no eighth.

| Layout | Good for | Shape |
|---|---|---|
| `feature` | films | one per row, full width, large player or cover |
| `grid` | projects | cards with a cover on top, title, blurb |
| `list` | compositions | compact rows, date right, inline audio. Fine at 40+ |
| `gallery` | drawings, photos | masonry at true proportions, lightbox on tap |
| `prose` | writing | title, date, opening lines. No image slot, no card |
| `timeline` | anything chronological | vertical rail, sticky year markers |
| `index` | credits, schooling | one line: title left, date right |

Each collection also carries flags — show the date, show tags, show the blurb,
columns, sort order, spacing, whether media is a cover, a player or nothing at
all. Every layout takes identical props, so every flag works with every layout.

## Stack

Next.js (App Router) · TypeScript · Tailwind · Neon Postgres · Vercel Blob.

No auth library, no CMS, no component library, no state library, no markdown
editor. `marked` renders item bodies on the server. That is the whole
dependency list, and it is deliberate.

> Neon, not "Vercel Postgres" — that product moved into the Vercel Marketplace.
> The driver is `@neondatabase/serverless`; `@vercel/postgres` is deprecated.

---

## Make it yours

You need a [Vercel](https://vercel.com) account and a GitHub account. No credit
card: Neon and Blob both have free tiers this fits inside.

### 1. Fork and clone

```bash
gh repo fork orr-lab/portfolio --clone --fork-name my-portfolio
cd my-portfolio
npm install
```

### 2. Create the Vercel project

```bash
vercel link --project my-portfolio --yes
```

### 3. Add a database and a file store

```bash
vercel integration add neon --name my-portfolio-db
vercel blob create-store my-portfolio-media --access public --yes
```

Both write their credentials into `.env.local` for you. `--access public` is
right here: these are images and audio meant to be seen and heard on a public
site.

### 4. Set your admin password

```bash
vercel env add ADMIN_PASSWORD production
```

It prompts, so the password is never typed into a file or a shell history. Pick
something real — this is the only thing standing between the internet and your
`/admin`.

To use `/admin` on your own machine, add it for development too and re-pull:

```bash
vercel env add ADMIN_PASSWORD development
vercel env pull .env.local
```

### 5. Create the tables

```bash
npm run db:migrate
npm run db:seed:starter    # five empty collections to start from
```

Use `npm run db:seed` instead if you want the example site's actual content to
look at. Both are safe to re-run; neither overwrites rows you have edited.

### 6. Say who you are

Edit **`site.config.ts`** — your name, one line about what you do, your URL,
and where else to find you. That is the only file with anything personal in it.
Replace `public/portrait.jpg` with your own photo, or set `portrait.enabled` to
`false` to drop it.

Then swap the icon: `app/favicon.ico` and `app/apple-icon.png`.

### 7. Deploy

```bash
git add -A && git commit -m "Make it mine" && git push
vercel --prod --yes
```

Open `/admin`, sign in, and start adding work.

---

## Adding your own domain

```bash
vercel domains add example.com
```

Then point DNS at Vercel. **If your DNS is on Cloudflare, set the record to
DNS-only — the grey cloud, not the orange one.** Proxying puts Cloudflare in
front of Vercel's CDN and breaks the image optimiser's cache headers.

Also check for a Cloudflare Redirect Rule on the domain. Those fire *before*
the origin is consulted, so a leftover rule will quietly win over your new DNS
record and you will spend an hour wondering why.

## Using /admin

Everything is designed to work one-handed on a phone, because that is where
you will actually be when you want to add something.

- **Items** — grouped by collection, searchable, reorder with arrows, publish
  or unpublish with one tap, star one item to feature it on the home page.
- **Item editor** — every field. Leave the body empty and the item has no page
  of its own; write one and it gets `/work/your-slug`.
- **Media** — upload many files at once straight from the camera roll, with
  per-file progress. Paste a YouTube or Vimeo link and it becomes a player;
  paste anything else and it becomes a labelled link. Caption, date, reorder
  and delete each one.
- **Collections** — create, rename, reorder, hide, and change any flag, with a
  live preview of the first three items that redraws *before* you save.

A few behaviours worth knowing:

- The **first media row is the cover**. There is no cover field to get out of
  sync — reorder the media and the cover follows.
- **Drafts appear in `/admin` and nowhere else.**
- **Slugs auto-generate from Latin titles only.** A title in Hebrew, Arabic,
  Greek or Cyrillic produces nothing, so `/admin` asks you to type one.
- In a gallery, **new uploads go to the top by default**, which makes the newest
  image the cover for free. Drawings are numbered from their dates, oldest
  first, so the numbering can never disagree with the dates.

## Local development

```bash
npm run dev          # http://localhost:3000
npm run build        # run before pushing
npm run lint         # typecheck
npm run db:check     # assert the database invariants still hold
```

`db:check` is worth running after any schema change. It proves, against the
real database and inside a transaction it rolls back, that only one item can be
featured, that reserved slugs are refused, that deleting a collection with work
in it fails, and that media cascades with its item.

## Things that will bite you

- **Every internal link must be `next/link`.** A plain `<a href="/films">`
  reloads the document, which stops any audio playing and throws away the
  render React could have reused. Anchors *within* a page (`href="#films"`)
  are correct as plain `<a>`.
- **Rotating `ADMIN_PASSWORD` signs everyone out**, because the session cookie
  is derived from it rather than stored anywhere.
- **Every server action re-checks the session.** A server action is its own
  public HTTP endpoint; the redirect in the admin layout is navigation
  convenience, not the security boundary. The same goes for the upload route,
  which checks before it will hand out a token.
- **`/[collection]` sits at the site root**, so `admin`, `work`, `api` and
  `_next` are reserved slugs. `/admin` refuses them, and so does the database.

## Project structure

```
site.config.ts           who you are — the only personal file
app/
  page.tsx               home: hero, featured item, a section per collection
  [collection]/          one page per collection
  work/[slug]/           detail pages, only for items with a body
  admin/                 password-gated editor
components/
  layouts/index.ts       layout name -> component. The registry
  layouts/*.tsx          the seven layouts
  AudioProvider.tsx      one <audio> for the whole site
lib/
  queries.ts             every read the public site does
  session.ts             the whole of /admin's security
db/
  migrations/*.sql       applied in order, once each
  seed.ts                the example site's content
  seed-starter.ts        five empty collections
```

## Licence

MIT. Take it, change it, publish it. Please replace the example content with
your own — `db/seed.ts` and `public/portrait.jpg` are somebody's actual life.
