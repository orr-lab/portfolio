-- Drawings are not square. Without the real pixel dimensions a gallery can
-- only crop every image to a fixed box, which for a tall pencil study means
-- showing the trunk and discarding the tree. Storing width and height lets the
-- gallery lay tiles out at their true proportions while Next still generates
-- the small sizes a phone on cellular needs.
--
-- Nullable on purpose: rows that predate this, and embeds and links, have no
-- dimensions, and the gallery falls back to a square for those.

alter table media add column width  int,
                  add column height int;

alter table media add constraint media_dimensions_ck
  check ((width is null and height is null) or (width > 0 and height > 0));
