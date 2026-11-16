-- Replaces the six gibberish sample issues (0023, 0026, 0031, 0032, 0033, 0034) with
-- readable Lakewood, NJ issues, each with three proposed solutions.
-- Run once in the Supabase dashboard: SQL Editor -> paste -> Run.
-- No statistics or quotes are invented; the text is general community-problem copy.

begin;

-- 1) Clear junk attached to these issues (old solutions, the junk Action Plan on 0033)
update solutions set deleted = true
where issue_id in (select id from issues where display_code in ('0023','0026','0031','0032','0033','0034'));

delete from action_tasks
where action_plan_id in (
  select id from action_plans
  where issue_id in (select id from issues where display_code in ('0023','0026','0031','0032','0033','0034'))
);
delete from action_plans
where issue_id in (select id from issues where display_code in ('0023','0026','0031','0032','0033','0034'));

-- 2) Proper titles, descriptions and location
update issues i set
  title = v.title, description = v.descr, location = 'Lakewood, NJ',
  status = 'solutions-proposed', first_chosen_prompted_at = null, action_plan_visible = false
from (values
  ('0034', 'Classrooms are overcrowded and families want a clear plan',
           'Many Lakewood families report classes running well past a comfortable size, with little room for new students. Parents and teachers want a public, realistic plan for adding classroom capacity before the next school year.'),
  ('0033', 'Elderly neighbors need volunteers for groceries and errands',
           'Older residents who live alone often have no one to help with groceries, pharmacy pickups or rides. Neighbors want a simple, reliable way to match willing volunteers with people who need a hand.'),
  ('0032', 'Rents are rising faster than young families can keep up',
           'Young couples and growing families are being priced out of the neighborhoods they grew up in. Residents want practical options for more affordable, legal housing close to schools and shuls.'),
  ('0031', 'Meals for families after a birth or illness are inconsistent',
           'When a family is going through a birth, surgery or illness, meal help depends on who happens to hear about it. Neighbors want one dependable system so no family is missed.'),
  ('0026', 'Students with special needs lack enough after-school support',
           'Families of children with special needs say after-school help, therapy access and trained aides are hard to find. Parents want shared resources and a place to coordinate.'),
  ('0023', 'Bochurim need safer, better-lit walking routes to the beis medrash',
           'Several routes used every evening have dim lighting and poor crossings. Residents want a simple safety review and quick, visible fixes.')
) as v(code, title, descr)
where i.display_code = v.code;

-- 3) Three proposed solutions per issue (submitted by the issue owner, already approved)
insert into solutions (issue_id, title, description, pros, cons, status, review_status, submitted_by, sort_order)
select i.id, s.title, s.descr, s.pros, s.cons, 'proposed', 'approved', i.owner_id, s.ord
from issues i
join (values
  ('0034', 0, 'Open a shared after-school learning space', 'Use underused community buildings in the afternoons so classroom pressure eases without waiting for new construction.', array['Fast to start','Uses space that already exists'], array['Needs volunteers and insurance']),
  ('0034', 1, 'Publish a yearly enrollment and capacity report', 'Ask schools and the township to share simple enrollment and capacity numbers so families and leaders plan from the same facts.', array['Builds trust','Low cost'], array['Depends on schools agreeing to share']),
  ('0034', 2, 'Coordinate staggered schedules between nearby schools', 'Stagger start times and shared-room use so existing buildings serve more students.', array['No construction needed'], array['Hard on families with kids in several schools']),

  ('0033', 0, 'Start a neighborhood volunteer roster', 'A simple signup so volunteers list their streets and availability, and requests are matched the same day.', array['Easy to launch','Personal and local'], array['Needs someone to coordinate']),
  ('0033', 1, 'Partner with existing gemachim and shuls', 'Work through organizations that already know who needs help instead of building something new.', array['Trusted networks','Less duplication'], array['Coverage varies by neighborhood']),
  ('0033', 2, 'Pair each shul block with a volunteer buddy', 'Assign a regular buddy to every older neighbor living alone so check-ins are automatic.', array['Builds real relationships'], array['Requires steady commitment']),

  ('0032', 0, 'Create a community housing fund', 'Pool community donations and low-interest loans to help young families with down payments and security deposits.', array['Direct help to families'], array['Needs significant seed funding']),
  ('0032', 1, 'Publish a guide to legal basement and accessory apartments', 'Explain the township rules and approval steps so more safe, legal rental units can be added.', array['Adds supply','Low cost'], array['Neighbors may object','Slow approvals']),
  ('0032', 2, 'Ask the township to review zoning for smaller homes', 'Request a public review of zoning near existing shuls and schools so smaller, cheaper homes can be built.', array['Long-term fix'], array['Slow political process']),

  ('0031', 0, 'One shared meal signup for the whole community', 'A single calendar where families request help and neighbors claim a night, so every family is covered.', array['Simple','Nobody gets missed'], array['Needs a maintainer']),
  ('0031', 1, 'Assign street captains', 'One volunteer per street watches for new needs and starts the meal chain.', array['Fast response'], array['Depends on captains staying active']),
  ('0031', 2, 'Recruit volunteer drivers for deliveries', 'A small pool of drivers so meals reach families across town, not just next door.', array['Wider reach'], array['Needs a dependable schedule']),

  ('0026', 0, 'Set up a shared resource and referral center', 'One place where parents find therapists, tutors and aides, with a list of who has openings.', array['Saves parents time'], array['Needs space and a coordinator']),
  ('0026', 1, 'Train volunteer after-school aides', 'Run short training sessions so volunteers can safely support students in after-school programs.', array['Builds a local bench of helpers'], array['Training takes time']),
  ('0026', 2, 'Form a parent support and advocacy group', 'A regular meeting where parents share what works and bring unified requests to schools and the township.', array['Strong collective voice'], array['Relies on parent volunteers']),

  ('0023', 0, 'Request a lighting survey from the township', 'Ask the township to walk the main evening routes and fix dim or broken lights.', array['Official fix','Free to residents'], array['Can take weeks or months']),
  ('0023', 1, 'Organize a volunteer evening walking escort', 'A rotating schedule of volunteers walking with students during the darkest hours.', array['Immediate help'], array['Needs ongoing volunteers']),
  ('0023', 2, 'Add reflective signs and crosswalk markings', 'Low-cost reflective signage at the busiest crossings along the route.', array['Cheap and quick'], array['Does not solve poor lighting'])
) as s(code, ord, title, descr, pros, cons) on i.display_code = s.code;

commit;
