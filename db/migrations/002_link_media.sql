-- items holds exactly one url, which cannot carry both a live site and its
-- source. Rather than add a repo_url column that would only ever answer this
-- one question, media gains a 'link' kind: any item can now have as many
-- labelled links as it needs, ordered and captioned like every other media
-- row, and the media manager in /admin handles them with no new screen.

alter table media drop constraint media_kind_ck;

alter table media add constraint media_kind_ck
  check (kind in ('image', 'video', 'audio', 'file', 'embed', 'link'));
