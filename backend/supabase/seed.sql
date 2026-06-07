-- ============================================================
-- KrackIT Seed Data
-- ============================================================

-- App settings
INSERT INTO app_settings (id, app_name, tagline, version, description, support_email,
  website_url, privacy_url, terms_url, play_store_url, app_store_url, team_members, social_links)
VALUES (1, 'KrackIT', 'One trick ahead', '2.1.0',
  'KrackIT is India''s smartest exam-prep app. We help aspirants crack competitive exams using powerful memory tricks, mnemonics, and bite-sized learning.',
  'support@krackit.app', 'https://krackit.app', 'https://krackit.app/privacy',
  'https://krackit.app/terms', 'https://play.google.com/store/apps/details?id=app.krackit',
  'https://apps.apple.com/app/krackit/id000000000',
  '[{"name":"Rahul Mehta","role":"Founder & CEO"},{"name":"Priya Singh","role":"Head of Content"},{"name":"Ankit Sharma","role":"Lead Developer"},{"name":"Kavya Reddy","role":"Product Designer"}]',
  '[{"platform":"Twitter","url":"https://twitter.com/krackitapp"},{"platform":"Instagram","url":"https://instagram.com/krackitapp"},{"platform":"YouTube","url":"https://youtube.com/@krackitapp"},{"platform":"LinkedIn","url":"https://linkedin.com/company/krackit"}]'
);

-- ============================================================
-- EXAMS
-- ============================================================
INSERT INTO exams (id, name, short, description, accent, sort_order) VALUES
  ('upsc', 'UPSC CSE',  'UPSC', 'Civil Services Examination',  'from-amber-400/30 to-amber-700/10',   1),
  ('ssc',  'SSC CGL',   'SSC',  'Staff Selection Commission',   'from-rose-400/30 to-rose-700/10',     2),
  ('neet', 'NEET UG',   'NEET', 'Medical Entrance Exam',        'from-emerald-400/30 to-emerald-700/10', 3),
  ('jee',  'JEE Main',  'JEE',  'Engineering Entrance',         'from-sky-400/30 to-sky-700/10',       4),
  ('cat',  'CAT',       'CAT',  'MBA Entrance Exam',            'from-violet-400/30 to-violet-700/10', 5),
  ('bank', 'Banking',   'IBPS', 'PO, Clerk & RRB',              'from-cyan-400/30 to-cyan-700/10',     6);

-- ============================================================
-- EXAM PRICING
-- ============================================================
INSERT INTO exam_pricing (exam_id, monthly, sixmonths, yearly) VALUES
  ('upsc', 199, 999,  1699),
  ('ssc',  149, 749,  1299),
  ('neet', 249, 1299, 2199),
  ('jee',  249, 1299, 2199),
  ('cat',  179, 899,  1499),
  ('bank', 129, 649,  1099);

-- ============================================================
-- SUBJECTS
-- ============================================================
INSERT INTO subjects (id, name, icon, exam_id, color, sort_order) VALUES
  ('history', 'History',          '📜', 'upsc', 'from-amber-500/25 to-amber-900/5',    1),
  ('polity',  'Polity',           '⚖️', 'upsc', 'from-rose-500/25 to-rose-900/5',      2),
  ('geo',     'Geography',        '🌍', 'upsc', 'from-emerald-500/25 to-emerald-900/5',3),
  ('eco',     'Economy',          '📈', 'upsc', 'from-sky-500/25 to-sky-900/5',        4),
  ('sci',     'Science & Tech',   '🧪', 'upsc', 'from-violet-500/25 to-violet-900/5',  5),
  ('env',     'Environment',      '🌱', 'upsc', 'from-cyan-500/25 to-cyan-900/5',      6),
  ('qa',      'Quant Aptitude',   '🔢', 'ssc',  'from-amber-500/25 to-amber-900/5',    1),
  ('rea',     'Reasoning',        '🧩', 'ssc',  'from-rose-500/25 to-rose-900/5',      2),
  ('eng',     'English',          '🔤', 'ssc',  'from-sky-500/25 to-sky-900/5',        3),
  ('ga',      'General Awareness','🌐', 'ssc',  'from-emerald-500/25 to-emerald-900/5',4),
  ('phy',     'Physics',          '⚛️', 'neet', 'from-sky-500/25 to-sky-900/5',        1),
  ('chem',    'Chemistry',        '⚗️', 'neet', 'from-emerald-500/25 to-emerald-900/5',2),
  ('bio',     'Biology',          '🧬', 'neet', 'from-rose-500/25 to-rose-900/5',      3);

-- ============================================================
-- CHAPTERS
-- ============================================================
INSERT INTO chapters (id, name, subject_id, icon, sort_order) VALUES
  ('anc',         'Ancient India',       'history',  '🏺', 1),
  ('med',         'Medieval India',      'history',  '🏰', 2),
  ('mod',         'Modern India',        'history',  '✊', 3),
  ('world',       'World History',       'history',  '🌍', 4),
  ('fr',          'Fundamental Rights',  'polity',   '⚖️', 1),
  ('dpsp',        'DPSP',                'polity',   '📜', 2),
  ('parl',        'Parliament',          'polity',   '🏛️', 3),
  ('jud',         'Judiciary',           'polity',   '👨‍⚖️', 4),
  ('phys',        'Physical Geography',  'geo',      '🗺️', 1),
  ('ind',         'Indian Geography',    'geo',      '🇮🇳', 2),
  ('ss',          'Solar System',        'geo',      '🌌', 3),
  ('trig-ch',     'Trigonometry',        'qa',       '📐', 1),
  ('alg-ch',      'Algebra',             'qa',       '✏️', 2),
  ('arith-ch',    'Arithmetic',          'qa',       '🔢', 3),
  ('cell-ch',     'Cell Biology',        'bio',      '🧫', 1),
  ('bio-resp-ch', 'Cellular Respiration','bio',      '⚡', 2),
  ('genetics-ch', 'Genetics',            'bio',      '🧬', 3);

-- ============================================================
-- TOPICS
-- ============================================================
INSERT INTO topics (id, name, chapter_id, icon, sort_order) VALUES
  ('anc-indus',     'Indus Valley Civilization', 'anc',         '🌊', 1),
  ('anc-vedic',     'Vedic Period',              'anc',         '🕉️', 2),
  ('anc-maurya',    'Mauryan Empire',            'anc',         '🦁', 3),
  ('anc-gupta',     'Gupta Period',              'anc',         '✨', 4),
  ('med-delhi',     'Delhi Sultanate',           'med',         '🕌', 1),
  ('med-mughal',    'Mughal Empire',             'med',         '👑', 2),
  ('med-south',     'South Indian Kingdoms',     'med',         '🛕', 3),
  ('mod-revolt',    '1857 Revolt',               'mod',         '⚔️', 1),
  ('mod-movements', 'Freedom Movements',         'mod',         '🕊️', 2),
  ('mod-leaders',   'National Leaders',          'mod',         '🧑‍💼', 3),
  ('mod-acts',      'Important Acts',            'mod',         '📋', 4),
  ('wh-wars',       'World Wars',                'world',       '🪖', 1),
  ('wh-revolutions','Revolutions',               'world',       '🔥', 2),
  ('wh-orgs',       'International Orgs',        'world',       '🌐', 3),
  ('fr-rights',     '6 Fundamental Rights',      'fr',          '🛡️', 1),
  ('fr-duties',     'Fundamental Duties',        'fr',          '📌', 2),
  ('fr-amend',      'Key Amendments',            'fr',          '📝', 3),
  ('dpsp-art',      'DPSP Articles',             'dpsp',        '📖', 1),
  ('dpsp-types',    'Types of Directives',       'dpsp',        '🗂️', 2),
  ('parl-lok',      'Lok Sabha',                 'parl',        '🏛️', 1),
  ('parl-rajya',    'Rajya Sabha',               'parl',        '🏛️', 2),
  ('parl-sessions', 'Parliamentary Sessions',    'parl',        '🗓️', 3),
  ('jud-sc',        'Supreme Court',             'jud',         '⚖️', 1),
  ('jud-hc',        'High Courts',               'jud',         '🏛️', 2),
  ('ss-planets',    'Planets & Order',           'ss',          '🪐', 1),
  ('ss-moon',       'Moon & Satellites',         'ss',          '🌙', 2),
  ('ss-misc',       'Stars & Phenomena',         'ss',          '⭐', 3),
  ('trig',          'Trig Ratios (SOH-CAH-TOA)', 'trig-ch',     '📐', 1),
  ('trig-ids',      'Trig Identities',           'trig-ch',     '🔁', 2),
  ('trig-graphs',   'Trig Graphs',               'trig-ch',     '📈', 3),
  ('bio-resp',      'Krebs Cycle',               'bio-resp-ch', '🔄', 1),
  ('bio-glyco',     'Glycolysis',                'bio-resp-ch', '🍬', 2),
  ('bio-atp',       'ATP Synthesis',             'bio-resp-ch', '⚡', 3);

-- ============================================================
-- TRICKS
-- ============================================================
INSERT INTO tricks (id, title, content, explanation, difficulty, subject_tag, topic_id, sort_order) VALUES
  ('t1',  'Remember Mughal Emperors in Order',       'BHAJI SABJI FAM',               'Babur → Humayun → Akbar → Jahangir → Shah Jahan → Aurangzeb. A spicy mnemonic that sticks because it sounds like an Indian kitchen order.', 'Easy',   'History',   'med-mughal',    1),
  ('t2',  'Fundamental Rights — Indian Constitution','RECREE — 6 Rights',             'Right to Equality, Right against Exploitation, Cultural & Educational, Religion, Equality before law, Education. Memorize as RECREE.',          'Medium', 'Polity',    'fr-rights',     1),
  ('t3',  'Trigonometric Identities (SOH-CAH-TOA)', 'SOH-CAH-TOA',                   'Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent. The classic — never miss a ratio again.',                       'Easy',   'Maths',     'trig',          1),
  ('t4',  'Order of Planets from Sun',               'My Very Educated Mother Just Served Us Noodles', 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. First-letter sentence trick — works every time.',              'Easy',   'Geography', 'ss-planets',    1),
  ('t5',  'Krebs Cycle Intermediates',               'Citric Krebs Sirf Sukoon Se Funky Music Online', 'Citrate → Aconitate → Isocitrate → α-Ketoglutarate → Succinyl-CoA → Succinate → Fumarate → Malate → Oxaloacetate.',          'Hard',   'Biology',   'bio-resp',      1),
  ('t6',  'Maurya Dynasty Rulers',                   'Chandragupta Built A Bigger Dasharatha',         'Chandragupta → Bindusara → Ashoka → Dasharatha. Sentence keeps the order locked in.',                                         'Medium', 'History',   'anc-maurya',    1),
  ('t7',  'Delhi Sultanate Dynasties',               'Slave Khilji Tughlaq Sayyid Lodi',               'The five dynasties of the Delhi Sultanate in chronological order. Pure rhythm — say it 3 times and it sticks.',               'Easy',   'History',   'med-delhi',     1),
  ('t8',  'Indus Valley Cities — Location',          'MoHen Harappa Kalibangan Lothal',                'Mohenjo-daro (Sindh), Harappa (Punjab), Kalibangan (Rajasthan), Lothal (Gujarat). Each city had a distinct feature.',          'Medium', 'History',   'anc-indus',     1),
  ('t9',  'Four Vedas in Order',                     'Rig Sama Yajur Atharva — RSYA',                  'Rigveda (hymns), Samaveda (melodies), Yajurveda (rituals), Atharvaveda (charms). Acronym RSYA helps recall all four instantly.', 'Easy', 'History',   'anc-vedic',     1),
  ('t10', 'Gupta Period Literary Works',             'Kalidasa Wrote Great Stories for All',            'Kalidasa — Abhijnanasakuntalam, Meghaduta. Aryabhatta — Aryabhatiya. Golden Age of art, science and literature.',              'Medium', 'History',   'anc-gupta',     1),
  ('t11', 'Directive Principles — Key Articles',     '36 to 51 — DPSP Range',                          'Articles 36 to 51 cover Directive Principles. They are non-justiciable but fundamental for governance.',                        'Easy',   'Polity',    'dpsp-art',      1),
  ('t12', 'Fundamental Duties — Article 51A',        '51A has 11 duties — Remember: SAVE RRN UPDF',    'Sovereignty, Abolish discriminating, Vigilance, Environment, Renounce violence, Respect culture, Natural environment, Unity, Public property, Develop scientific temper, Free compulsory education.', 'Hard', 'Polity', 'fr-duties', 1);

-- Seed trick_ratings for demo data
INSERT INTO trick_ratings (trick_id, avg_rating, total_ratings, star1, star2, star3, star4, star5) VALUES
  ('t1',  4.60, 1247,  12,  31,  78, 298, 828),
  ('t2',  4.20,  893,  18,  44, 112, 312, 407),
  ('t3',  4.80, 2104,   8,  19,  47, 189, 1841);

-- ============================================================
-- SHORT NOTES
-- ============================================================
INSERT INTO short_notes (id, topic_id, title, content, sort_order) VALUES
  ('sn1',  'med-mughal',  'Timeline',                 '1526–1857 CE. Founded by Babur after First Battle of Panipat (1526). Capital: Agra → Fatehpur Sikri → Delhi.',                                                              1),
  ('sn2',  'med-mughal',  'Six Emperors (BHAJI SABJI)','Babur → Humayun → Akbar → Jahangir → Shah Jahan → Aurangzeb. Akbar: longest reign (49 yrs), greatest administrator.',                                                      2),
  ('sn3',  'med-mughal',  'Akbar''s Legacy',            'Abolished jizya, introduced Din-i-Ilahi (1582), built Fatehpur Sikri, had nine Navratnas in court including Birbal & Todar Mal.',                                            3),
  ('sn4',  'med-mughal',  'Shah Jahan',                'Built Taj Mahal (1632–48) in memory of Mumtaz Mahal, Red Fort, Jama Masjid. Deposed by son Aurangzeb in 1658.',                                                             4),
  ('sn5',  'med-mughal',  'Aurangzeb',                 'Largest Mughal empire geographically. Reimposed jizya. Compiled Fatawa-e-Alamgiri. Died 1707 — decline began after him.',                                                    5),
  ('sn6',  'fr-rights',   '6 Fundamental Rights',      '1. Equality (14–18)  2. Freedom (19–22)  3. Against Exploitation (23–24)  4. Religion (25–28)  5. Cultural & Educational (29–30)  6. Constitutional Remedies (32)',         1),
  ('sn7',  'fr-rights',   'Right to Equality',         'Art 14: Equality before law. Art 15: No discrimination. Art 16: Equal employment. Art 17: Abolish untouchability. Art 18: Abolish titles.',                                  2),
  ('sn8',  'fr-rights',   'Key Points',                'Originally 7 Rights — Right to Property removed by 44th Amendment (1978). Art 32 called ''soul of Constitution'' by Ambedkar.',                                              3),
  ('sn9',  'fr-duties',   'Article 51A (11 Duties)',   'Added by 42nd Amendment (1976). 11th duty added by 86th Amendment (2002): free compulsory education for children aged 6–14.',                                               1),
  ('sn10', 'fr-duties',   'Key Duties',                'Abide by Constitution · Cherish national movement · Uphold sovereignty · Protect environment · Develop scientific temper · Safeguard public property.',                       2),
  ('sn11', 'dpsp-art',    'DPSP Basics',               'Articles 36–51. Non-justiciable. Inspired by Irish Constitution. Represent ''positive obligations'' on the state.',                                                           1),
  ('sn12', 'dpsp-art',    'Key DPSP Articles',         'Art 39: Equal pay. Art 40: Village Panchayats. Art 44: Uniform Civil Code. Art 45: Free education. Art 48: Cow protection.',                                                 2),
  ('sn13', 'ss-planets',  '8 Planets in Order',        'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. Mnemonic: My Very Educated Mother Just Served Us Noodles.',                                                   1),
  ('sn14', 'ss-planets',  'Key Planet Facts',          'Largest: Jupiter. Smallest: Mercury. Hottest: Venus. Fastest orbit: Mercury (88 days). Rings: Saturn (prominent), Uranus, Neptune, Jupiter.',                                2),
  ('sn15', 'ss-planets',  'Dwarf Planets',             'Pluto (reclassified 2006), Eris, Ceres, Makemake, Haumea. IAU definition: orbits Sun, hydrostatic equilibrium, has NOT cleared its orbital neighbourhood.',                  3),
  ('sn16', 'trig',        'SOH-CAH-TOA',               'sin θ = Opposite/Hypotenuse · cos θ = Adjacent/Hypotenuse · tan θ = Opposite/Adjacent. Reciprocals: cosec, sec, cot.',                                                      1),
  ('sn17', 'trig',        'Standard Values',           'sin 0°=0, 30°=½, 45°=1/√2, 60°=√3/2, 90°=1. Cos values are the reverse. tan 45°=1, tan 60°=√3, tan 90°=undefined.',                                                        2),
  ('sn18', 'trig',        'Key Identities',            'sin²θ + cos²θ = 1 · 1 + tan²θ = sec²θ · 1 + cot²θ = cosec²θ · tan θ = sin θ / cos θ.',                                                                                     3),
  ('sn19', 'bio-resp',    'Location & Overview',       'Occurs in mitochondrial matrix. 8 steps. Per turn: 3 NADH, 1 FADH₂, 1 GTP/ATP, 2 CO₂. Runs TWICE per glucose molecule.',                                                   1),
  ('sn20', 'bio-resp',    '8 Intermediates',           'Citrate → Isocitrate → α-Ketoglutarate → Succinyl-CoA → Succinate → Fumarate → Malate → Oxaloacetate.',                                                                      2),
  ('sn21', 'bio-resp',    'Energy Accounting',         'Per glucose (2 cycles): 6 NADH, 2 FADH₂, 2 ATP. NADH → 2.5 ATP, FADH₂ → 1.5 ATP via oxidative phosphorylation.',                                                           3),
  ('sn22', 'anc-maurya',  'Timeline & Capital',        '322–185 BCE. Founded by Chandragupta Maurya with Chanakya''s help. Capital: Pataliputra (modern Patna, Bihar).',                                                              1),
  ('sn23', 'anc-maurya',  'Rulers (CBAD)',             'Chandragupta → Bindusara → Ashoka → Dasharatha. Ashoka (268–232 BCE): converted to Buddhism after Kalinga War (261 BCE).',                                                   2),
  ('sn24', 'anc-maurya',  'Ashoka''s Legacy',           'Rock Edicts & Pillar Edicts spread Dhamma. Sent missions to Sri Lanka, Greece, Egypt. Built 84,000 stupas. Lion Capital (Sarnath) = India''s national emblem.',               3),
  ('sn25', 'med-delhi',   '5 Dynasties',               'Slave (1206–90) → Khilji (1290–1320) → Tughlaq (1320–1414) → Sayyid (1414–51) → Lodi (1451–1526). All ruled from Delhi.',                                                   1),
  ('sn26', 'med-delhi',   'Notable Rulers',            'Iltutmish: first to get Caliph''s recognition. Raziya Sultan: first female ruler. Alauddin Khilji: market reforms.',                                                          2),
  ('sn27', 'med-delhi',   'End of Sultanate',          'Ibrahim Lodi defeated by Babur at First Battle of Panipat (1526) → Established Mughal Empire.',                                                                              3),
  ('sn28', 'anc-indus',   'Overview',                  '3300–1300 BCE (mature phase: 2600–1900 BCE). Also called Harappan Civilization. Bronze Age.',                                                                                 1),
  ('sn29', 'anc-indus',   'Major Sites',               'Mohenjo-daro (Great Bath, Sindh) · Harappa (Punjab) · Kalibangan (fire altars, Rajasthan) · Lothal (dockyard, Gujarat) · Dholavira (Gujarat, UNESCO 2021).',                 2),
  ('sn30', 'anc-indus',   'Key Features',              'Grid-pattern town planning · Advanced drainage · Standardised weights & measures · Undeciphered Indus script · No iron or temples found.',                                   3),
  ('sn31', 'anc-vedic',   'Two Phases',                'Early Vedic (1500–1000 BCE): Rig-Vedic, tribal, cattle economy. Later Vedic (1000–600 BCE): Jana Mahajanapadas, caste rigidity, agriculture expands.',                       1),
  ('sn32', 'anc-vedic',   'Four Vedas (RSYA)',         'Rigveda (hymns) · Samaveda (melodies) · Yajurveda (rituals) · Atharvaveda (charms). Rigveda is the oldest.',                                                                  2),
  ('sn33', 'anc-gupta',   'Golden Age of India',       '320–550 CE. Founded by Sri Gupta. Greatest under Chandragupta II (Vikramaditya). Known for art, science, literature and trade.',                                              1),
  ('sn34', 'anc-gupta',   'Key Contributions',         'Aryabhata: zero, decimal system, π≈3.14. Kalidasa: Shakuntala. Varahamihira: astronomy. University of Nalanda flourished.',                                                   2);

-- ============================================================
-- EXAM NEWS
-- ============================================================
INSERT INTO exam_news (id, exam_id, title, date_label, tag, accent) VALUES
  ('n1', 'upsc', 'CSE Prelims 2026 notification released',  'Feb 14', 'Notification', 'from-amber-500/30 to-amber-900/10'),
  ('n2', 'neet', 'NEET UG admit cards out next week',       'Apr 28', 'Admit Card',   'from-emerald-500/30 to-emerald-900/10'),
  ('n3', 'ssc',  'CGL Tier 1 exam dates announced',         'Jun 09', 'Exam Date',    'from-rose-500/30 to-rose-900/10'),
  ('n4', 'jee',  'JEE Main Session 2 results declared',     'May 02', 'Result',       'from-sky-500/30 to-sky-900/10'),
  ('n5', 'bank', 'PO 2026 prelims notification live',       'Jul 18', 'Notification', 'from-cyan-500/30 to-cyan-900/10');

-- ============================================================
-- TRICK OF DAY
-- ============================================================
INSERT INTO trick_of_day (id, trick_id, date, note) VALUES
  ('tod1', 't1', CURRENT_DATE,       'Great for UPSC History prep'),
  ('tod2', 't3', CURRENT_DATE + 1,   'Math basics for all exams'),
  ('tod3', 't2', CURRENT_DATE + 2,   'Polity fundamentals');
