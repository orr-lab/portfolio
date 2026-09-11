-- A daily drawing has a date, and captions are the wrong place for it: it
-- would have to be typed every time and could not be sorted or numbered.
-- The number is deliberately NOT stored. It is a position in a sequence, and
-- storing it would mean renumbering every row whenever one is inserted or
-- removed, with the usual chance of two rows claiming the same day. It is
-- derived from the dates instead, so it cannot disagree with them.

alter table media add column taken_on date;
