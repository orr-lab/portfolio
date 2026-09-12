-- The player wants to show a track's length before anyone presses play. The
-- only other way to know it is preload="metadata", which on a list of forty
-- compositions means forty range requests just to fill in the numbers. Measured
-- once in the browser at upload instead, and stored.
alter table media add column duration_seconds int;

alter table media add constraint media_duration_ck
  check (duration_seconds is null or duration_seconds >= 0);
