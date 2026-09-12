-- Initial schema.
--
-- The shape here is doing real work. Read the constraints as documentation:
-- they are what stops /admin from producing a state the site cannot render.

create table collections (
  id                uuid primary key default gen_random_uuid(),
  slug              text        not null unique,
  title             text        not null,
  blurb             text,
  layout            text        not null default 'grid',
  columns           int         not null default 2,
  show_year         boolean     not null default true,
  show_tags         boolean     not null default true,
  show_blurb        boolean     not null default true,
  media_mode        text        not null default 'cover',
  sort_mode         text        not null default 'manual',
  density           text        not null default 'comfortable',
  -- Lets the hub write "All 14 compositions →". Without it the best we could
  -- build from {slug:'music', title:'Music'} is "All 14 Music →".
  item_noun_plural  text,
  sort_order        int         not null default 0,
  visible           boolean     not null default true,

  constraint collections_layout_ck
    check (layout in ('feature','grid','list','gallery','prose','timeline','index')),
  constraint collections_columns_ck     check (columns between 1 and 3),
  constraint collections_media_mode_ck  check (media_mode in ('cover','player','none')),
  constraint collections_sort_mode_ck   check (sort_mode in ('manual','year_desc','year_asc','alpha')),
  constraint collections_density_ck     check (density in ('comfortable','compact')),
  -- /[collection] sits at the site root, so a collection slugged 'admin' or
  -- 'work' would be shadowed by a static route and become unreachable forever.
  constraint collections_slug_ck
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
           and slug not in ('admin','work','api','_next'))
);

create table items (
  id             uuid        primary key default gen_random_uuid(),
  -- restrict, not cascade: deleting a collection must never silently delete
  -- the work inside it. /admin has no collection-delete for the same reason.
  collection_id  uuid        not null references collections(id) on delete restrict,
  slug           text        not null unique,
  title          text        not null,
  subtitle       text,
  blurb          text,
  body           text,
  tags           text[]      not null default '{}',
  year           int,
  -- Overrides the *displayed* date; `year` stays an int and does the sorting.
  -- Holds ranges ('2016–2020'), open ranges ('2026–'), months ('August 2026').
  date_label     text,
  url            text,
  url_label      text,
  featured       boolean     not null default false,
  sort_order     int         not null default 0,
  status         text        not null default 'draft',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint items_status_ck check (status in ('draft','published')),
  constraint items_slug_ck   check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint items_year_ck   check (year is null or year between 1900 and 2200)
);

-- "At most one featured item site-wide" as a database fact rather than a
-- convention. The index covers only rows where featured is true, and every
-- such row holds the same value, so exactly one can exist.
create unique index items_one_featured on items (featured) where featured;

create table media (
  id          uuid  primary key default gen_random_uuid(),
  item_id     uuid  not null references items(id) on delete cascade,
  kind        text  not null,
  url         text  not null,
  caption     text,
  -- The first media row by sort_order IS the cover. No cover column, no
  -- is_cover flag, nothing that can desync. Negative values are legal and
  -- expected: a gallery upload takes min(sort_order) - 1 to land at the top.
  sort_order  int   not null default 0,

  constraint media_kind_ck check (kind in ('image','video','audio','file','embed'))
);

create index collections_sort_idx  on collections (sort_order);
create index items_collection_idx  on items (collection_id, sort_order);
create index items_status_idx      on items (status);
create index media_item_idx        on media (item_id, sort_order);

-- Keeps updated_at honest without every write path having to remember it.
create function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger items_touch_updated_at
  before update on items
  for each row execute function touch_updated_at();
