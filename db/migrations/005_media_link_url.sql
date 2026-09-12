-- Any media row can now point somewhere. A drawing might live on Instagram, a
-- recording on Spotify; the image or file stays the thing on the page and the
-- link is where it came from. Distinct from a 'link' media row, which IS the
-- link — this hangs a destination off a picture that already exists.
alter table media add column link_url text;
