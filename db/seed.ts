// Seeds the real collections and items. Safe to re-run: existing rows are left
// alone. Pass --force to overwrite seeded rows with the copy in this file.
import { connect } from './client.ts'

const force = process.argv.includes('--force')

const collections = [
  { slug: 'films', title: 'Films', blurb: "Short films I've made.",
    layout: 'feature', columns: 1, show_year: true, show_tags: true, show_blurb: true,
    media_mode: 'cover', sort_mode: 'manual', density: 'comfortable',
    item_noun_plural: 'films', sort_order: 1, visible: true },

  { slug: 'music', title: 'Music', blurb: 'Piano compositions and arrangements.',
    layout: 'list', columns: 1, show_year: true, show_tags: false, show_blurb: true,
    media_mode: 'player', sort_mode: 'manual', density: 'comfortable',
    item_noun_plural: 'compositions', sort_order: 2, visible: true },

  { slug: 'code', title: 'Code', blurb: "Things I've built.",
    layout: 'grid', columns: 2, show_year: false, show_tags: true, show_blurb: true,
    media_mode: 'none', sort_mode: 'manual', density: 'comfortable',
    item_noun_plural: 'projects', sort_order: 3, visible: true },

  { slug: 'drawings', title: 'Daily drawings', blurb: 'One drawing a day.',
    layout: 'gallery', columns: 3, show_year: false, show_tags: false, show_blurb: true,
    media_mode: 'cover', sort_mode: 'manual', density: 'comfortable',
    item_noun_plural: 'drawings', sort_order: 4, visible: true },

  { slug: 'education', title: 'Education', blurb: null,
    layout: 'index', columns: 1, show_year: true, show_tags: false, show_blurb: false,
    media_mode: 'none', sort_mode: 'year_desc', density: 'compact',
    item_noun_plural: null, sort_order: 5, visible: true },
]

const SAFE_HOUSE_BODY = `A nine-minute black-and-white short set during the battle for Jerusalem in
June 1967, based on a true story from my grandfather.

I made it on my own — directing, camera, sound and edit — with a cast of
family and friends.

It premiered on YouTube in August 2026, subtitled in six languages.`

const items = [
  // films
  { c: 'films', slug: 'safe-house', title: 'Safe House', subtitle: 'בית טוב',
    blurb: "A nine-minute black-and-white short set during the 1967 battle for Jerusalem, based on my grandfather's story. I directed, shot, recorded and edited it, with a cast of family and friends.",
    body: SAFE_HOUSE_BODY, tags: [], year: 2026, date_label: 'August 2026',
    url: null, url_label: null, featured: true, sort_order: 1, status: 'published' },

  // The subtitle does the disambiguating at a glance: in the feature layout
  // this sits among actual films, so it needs to announce itself as a group.
  { c: 'films', slug: 'kolnoa-iasa', title: 'Kolnoa IASA', subtitle: 'Film group',
    blurb: 'The film group at my school, not a film in itself. It will make one or two serious films a year.',
    body: null, tags: [], year: null, date_label: null,
    url: 'https://www.youtube.com/@iasacinema', url_label: 'YouTube',
    featured: false, sort_order: 2, status: 'published' },

  // music
  { c: 'music', slug: 'game-music-medley', title: 'Game music medley', subtitle: null,
    blurb: 'An arrangement stringing together pieces from Celeste, Hollow Knight, Undertale and Stardew Valley, with my own transitions.',
    body: null, tags: ['arrangement'], year: null, date_label: null,
    url: null, url_label: null, featured: false, sort_order: 1, status: 'published' },

  // code — every URL below was verified live before seeding
  { c: 'code', slug: 'piano-log', title: 'Piano Log', subtitle: null,
    blurb: 'Practice tracker. Recordings, pieces, time spent, streaks.',
    body: null, tags: [], year: null, date_label: null,
    url: 'https://piano.orrknaan.com', url_label: 'piano.orrknaan.com',
    featured: false, sort_order: 1, status: 'published' },

  { c: 'code', slug: 'cubing-site', title: 'Cubing site', subtitle: null,
    blurb: 'Speedcubing timer with accounts and a global leaderboard. Built by hand for my Bagrut.',
    body: null, tags: [], year: null, date_label: null,
    url: 'https://cubingsite.orrknaan.com', url_label: 'cubingsite.orrknaan.com',
    featured: false, sort_order: 2, status: 'published' },

  { c: 'code', slug: 'music-theory-trainer', title: 'Music theory trainer', subtitle: null,
    blurb: 'Drills for intervals, staff reading and the circle of fifths.',
    body: null, tags: [], year: null, date_label: null,
    url: 'https://learntheory.orrknaan.com', url_label: 'learntheory.orrknaan.com',
    featured: false, sort_order: 3, status: 'published' },

  { c: 'code', slug: 'iasa-schedule-app', title: 'IASA schedule app', subtitle: null,
    blurb: 'Turns the school timetable spreadsheet into a personal calendar for each student.',
    body: null, tags: [], year: null, date_label: null,
    url: 'https://schedule.orrknaan.com', url_label: 'schedule.orrknaan.com',
    featured: false, sort_order: 4, status: 'published' },

  { c: 'code', slug: 'board-game-tracker', title: 'Board game tracker', subtitle: null,
    blurb: 'Tracks the games we play at home.',
    body: null, tags: [], year: null, date_label: null,
    url: 'https://boardgames.orrknaan.com', url_label: 'boardgames.orrknaan.com',
    featured: false, sort_order: 5, status: 'published' },

  { c: 'code', slug: 'this-site', title: 'This site', subtitle: null,
    blurb: 'Next.js, Postgres, and a form I can fill from my phone.',
    body: null, tags: ['next.js', 'typescript', 'postgres'], year: null, date_label: null,
    url: 'https://github.com/orr-lab/portfolio', url_label: 'github.com/orr-lab/portfolio',
    featured: false, sort_order: 6, status: 'published' },

  // drawings — draft until the first image is uploaded, then one tap to publish
  { c: 'drawings', slug: 'daily-drawings', title: 'Daily drawings', subtitle: null,
    blurb: 'One drawing a day.',
    body: null, tags: [], year: null, date_label: null,
    url: null, url_label: null, featured: false, sort_order: 1, status: 'draft' },

  // education — year sorts, date_label displays
  { c: 'education', slug: 'iasa-music-program', title: 'Israel Arts and Science Academy — music',
    subtitle: null, blurb: null, body: null, tags: [], year: 2026, date_label: '2026–',
    url: null, url_label: null, featured: false, sort_order: 1, status: 'published' },

  { c: 'education', slug: 'open-university', title: 'The Open University of Israel',
    subtitle: null, blurb: null, body: null, tags: [], year: 2025, date_label: '2025–2026',
    url: null, url_label: null, featured: false, sort_order: 2, status: 'published' },

  { c: 'education', slug: 'shamir-gifted-class', title: 'Shamir Public Gifted Class',
    subtitle: null, blurb: null, body: null, tags: [], year: 2023, date_label: '2023–2026',
    url: null, url_label: null, featured: false, sort_order: 3, status: 'published' },

  { c: 'education', slug: 'illanot-elementary', title: 'Illanot Public Elementary School',
    subtitle: null, blurb: null, body: null, tags: [], year: 2020, date_label: '2020–2023',
    url: null, url_label: null, featured: false, sort_order: 4, status: 'published' },

  { c: 'education', slug: 'gideon-hausner', title: 'Gideon Hausner Day School',
    subtitle: null, blurb: null, body: null, tags: [], year: 2016, date_label: '2016–2020',
    url: null, url_label: null, featured: false, sort_order: 5, status: 'published' },
]

const client = await connect()
const ids: Record<string, string> = {}

const cOnConflict = force
  ? `do update set title = excluded.title, blurb = excluded.blurb, layout = excluded.layout,
       columns = excluded.columns, show_year = excluded.show_year, show_tags = excluded.show_tags,
       show_blurb = excluded.show_blurb, media_mode = excluded.media_mode,
       sort_mode = excluded.sort_mode, density = excluded.density,
       item_noun_plural = excluded.item_noun_plural, sort_order = excluded.sort_order`
  : 'do nothing'

for (const c of collections) {
  await client.query(
    `insert into collections
       (slug, title, blurb, layout, columns, show_year, show_tags, show_blurb,
        media_mode, sort_mode, density, item_noun_plural, sort_order, visible)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     on conflict (slug) ${cOnConflict}`,
    [c.slug, c.title, c.blurb, c.layout, c.columns, c.show_year, c.show_tags,
     c.show_blurb, c.media_mode, c.sort_mode, c.density, c.item_noun_plural,
     c.sort_order, c.visible],
  )
  const r = await client.query('select id from collections where slug = $1', [c.slug])
  ids[c.slug] = r.rows[0].id
}

const iOnConflict = force
  ? `do update set title = excluded.title, subtitle = excluded.subtitle, blurb = excluded.blurb,
       body = excluded.body, tags = excluded.tags, year = excluded.year,
       date_label = excluded.date_label, url = excluded.url, url_label = excluded.url_label,
       sort_order = excluded.sort_order`
  : 'do nothing'

for (const i of items) {
  await client.query(
    `insert into items
       (collection_id, slug, title, subtitle, blurb, body, tags, year, date_label,
        url, url_label, featured, sort_order, status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     on conflict (slug) ${iOnConflict}`,
    [ids[i.c], i.slug, i.title, i.subtitle, i.blurb, i.body, i.tags, i.year,
     i.date_label, i.url, i.url_label, i.featured, i.sort_order, i.status],
  )
}

// Media. Idempotent by (item, url), so re-running never duplicates a row.
const media = [
  { item: 'safe-house', kind: 'embed', url: 'https://www.youtube.com/watch?v=uYi4nLWT7X8',
    caption: null, sort_order: 0 },
  { item: 'game-music-medley', kind: 'embed', url: 'https://youtu.be/3GrGEhB4eQQ',
    caption: null, sort_order: 0 },
  // sort_order -1 so the audio leads: if you can hear it, that is the point.
  { item: 'game-music-medley', kind: 'audio', caption: null, sort_order: -1,
    url: 'https://xbqrbml01ydz30oy.public.blob.vercel-storage.com/music/game-music-medley.mp3' },
  // Only the public repos. iasa-schedule and board-game-shelf are private, so
  // they get no link until Orr opens them.
  { item: 'kolnoa-iasa', kind: 'link', caption: 'Instagram', sort_order: 1,
    url: 'https://www.instagram.com/iasacinema/' },
  { item: 'piano-log', kind: 'link', caption: 'GitHub', sort_order: 1,
    url: 'https://github.com/orr-lab/piano-log' },
  { item: 'cubing-site', kind: 'link', caption: 'GitHub', sort_order: 1,
    url: 'https://github.com/orr-lab/cubingSite' },
  { item: 'music-theory-trainer', kind: 'link', caption: 'GitHub', sort_order: 1,
    url: 'https://github.com/orr-lab/music-trainer' },
  { item: 'game-music-medley', kind: 'file', caption: 'Score (PDF)', sort_order: 1,
    url: 'https://xbqrbml01ydz30oy.public.blob.vercel-storage.com/music/game-music-medley-score.pdf' },
]

for (const m of media) {
  await client.query(
    `insert into media (item_id, kind, url, caption, sort_order)
     select i.id, $2, $3, $4, $5 from items i
     where i.slug = $1
       and not exists (select 1 from media x where x.item_id = i.id and x.url = $3)`,
    [m.item, m.kind, m.url, m.caption, m.sort_order],
  )
}

const counts = await client.query(`
  select c.sort_order, c.slug, c.layout, c.visible,
         count(distinct i.id) filter (where i.status = 'published') as published,
         count(distinct i.id) filter (where i.status = 'draft')     as drafts,
         count(distinct m.id) as media
  from collections c left join items i on i.collection_id = c.id
       left join media m on m.item_id = i.id
  group by c.id order by c.sort_order
`)
console.table(counts.rows)
console.log(force ? 'Seeded (forced overwrite).' : 'Seeded. Existing rows untouched.')
await client.end()
