// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS CON × KRILLION — the one file to edit.
// Questions, answer banks, the special answer, timing and the end screen all
// live here. Nothing else in the codebase hardcodes Business Con behaviour.
// Tiers (low → high): plankton 10 · tooclever 15 · schooler 30 · rare 60 ·
// deepcut 85 · krillion 100. The krillion tier displays as "1 IN A KRILLION".
// The rarity is a scripted game result, not a measured probability.
// ─────────────────────────────────────────────────────────────────────────────
const a = (answer, tier, aliases = [], quip) => ({ answer, tier, aliases, ...(quip ? { quip } : {}) });

// Special answer shared by every round. Matching ignores case, spaces, hyphens
// and punctuation, so "BusinessCon", "business-con" and " BUSINESS CON " all match.
export const SPECIAL_ANSWER = {
  answer: 'Business Con',
  aliases: ['businesscon', 'business-con', 'biz con', 'bizcon', 'the business con'],
  tier: 'krillion',
  quip: 'the designated gem. trench floor.',
};

export const GAME = {
  title: 'KRILLION',           // big pixel word on the start screen
  pageTitle: 'Krillion',       // browser tab title
  tagline: 'THE DAILY DIVE',
  diveNumber: 117,             // the "DIVE #" label on the start screen
  previewSeconds: 3,           // countdown before typing opens
  answerSeconds: 25,           // answer timer per question
  // Answers not in a bank: set tier to null to reject them ("no echo. try
  // again"), exactly like the original game. Otherwise they score as this tier.
  unlisted: { tier: 'schooler', minLength: 2 },
};

// Exact wording and order are part of the brief. Do not reword.
export const QUESTIONS = [
  {
    id: 'q1',
    text: 'Name something more exciting than Economics lessons.',
    special: SPECIAL_ANSWER,
    answers: [
      a('Football', 'plankton', ['soccer', 'playing football', 'watching football']),
      a('Gaming', 'plankton', ['video games', 'games', 'playing games', 'fortnite', 'minecraft']),
      a('Sleeping', 'plankton', ['sleep', 'napping', 'a nap', 'nap']),
      a('Holidays', 'plankton', ['holiday', 'vacation', 'vacations', 'summer holidays']),
      a('Parties', 'plankton', ['party', 'partying']),
      a('Lunch', 'plankton', ['lunch break', 'food', 'eating', 'break', 'recess']),
      a('Literally anything', 'plankton', ['anything', 'everything', 'anything else']),
      a('Netflix', 'schooler', ['tv', 'movies', 'films', 'watching tv']),
      a('TikTok', 'schooler', ['instagram', 'social media', 'scrolling', 'youtube']),
      a('Basketball', 'schooler', ['cricket', 'tennis', 'sports', 'sport', 'gym']),
      a('Concerts', 'schooler', ['concert', 'music', 'festival']),
      a('Shopping', 'schooler', ['the mall']),
      a('Maths lessons', 'tooclever', ['maths', 'math', 'math class', 'physics', 'chemistry']),
      a('Watching paint dry', 'tooclever', ['paint drying', 'watching grass grow']),
      a('Skydiving', 'rare', ['bungee jumping', 'rollercoasters', 'roller coasters', 'theme park']),
      a('A fire drill', 'rare', ['fire drill', 'fire alarm']),
      a('A snow day', 'deepcut', ['snow day', 'school cancelled', 'a day off']),
    ],
  },
  {
    id: 'q2',
    text: 'Name somewhere you could meet your billion dollar startup co-founder.',
    special: SPECIAL_ANSWER,
    answers: [
      a('University', 'plankton', ['uni', 'college', 'campus']),
      a('LinkedIn', 'plankton', ['linked in']),
      a('Harvard', 'plankton', ['stanford', 'mit', 'oxford', 'cambridge']),
      a('Networking events', 'plankton', ['networking event', 'networking', 'a networking event']),
      a('Startup conferences', 'plankton', ['startup conference', 'conference', 'a conference', 'tech conference']),
      a('School', 'schooler', ['high school', 'class', 'in class']),
      a('Silicon Valley', 'schooler', ['san francisco', 'sf', 'the bay area']),
      a('A hackathon', 'schooler', ['hackathon', 'hackathons']),
      a('Y Combinator', 'schooler', ['yc', 'an accelerator', 'accelerator', 'incubator']),
      a('Twitter', 'schooler', ['x', 'reddit', 'discord', 'online']),
      a('A coffee shop', 'tooclever', ['coffee shop', 'starbucks', 'cafe', 'a cafe']),
      a('A garage', 'tooclever', ['garage', 'my garage']),
      a('The gym', 'rare', ['gym']),
      a('A dorm room', 'rare', ['dorm', 'dorm room', 'dorms']),
      a('A wedding', 'deepcut', ['wedding']),
      a('Jail', 'deepcut', ['prison']),
    ],
  },
  {
    id: 'q3',
    text: 'Name something you would regret missing.',
    special: SPECIAL_ANSWER,
    answers: [
      a('Graduation', 'plankton', ['my graduation', 'prom']),
      a('A concert', 'plankton', ['concert', 'concerts', 'a gig']),
      a('The World Cup final', 'plankton', ['world cup final', 'world cup', 'the world cup', 'the final']),
      a("A friend's wedding", 'plankton', ['wedding', 'a wedding', 'friends wedding', 'best friends wedding']),
      a('A flight', 'plankton', ['flight', 'my flight', 'plane', 'the plane']),
      a('Birthday', 'schooler', ['birthday party', 'my birthday', 'a birthday']),
      a('Exams', 'schooler', ['exam', 'final exam', 'an exam', 'my exam']),
      a('The bus', 'schooler', ['bus', 'train', 'the train']),
      a('An opportunity', 'schooler', ['opportunity', 'a chance', 'the opportunity']),
      a('A job interview', 'schooler', ['job interview', 'interview']),
      a('Christmas', 'schooler', ['diwali', 'eid', 'new year', 'new years']),
      a('The Super Bowl', 'tooclever', ['super bowl', 'superbowl']),
      a('A solar eclipse', 'rare', ['eclipse', 'solar eclipse']),
      a('The birth of my child', 'deepcut', ['birth of my child', 'my kids birth']),
    ],
  },
];

// End screen. Leave a field empty ('') and its slot is not shown.
// Do not invent a date or link: fill these in once they are official.
export const END_SCREEN = {
  eyebrow: 'DIVE COMPLETE',          // small line at the top of the end screen
  eventName: "BUSINESS CON '27",
  date: '',                          // e.g. '14 March 2027' (shown under the name)
  venue: '@ SJII',                   // shown under the name
  tagline: "The opportunity you don't want to miss.",
  statusLead: 'Be there or',         // small line just above the boxed status
  status: 'BE SQUARE',               // gold boxed line, e.g. 'COMING SOON'
  details: '',                       // one extra line of copy
  logo: '',                          // path or URL, e.g. 'assets/business-con-logo.png'
  registrationUrl: '',               // shown as a button and as text
  registrationLabel: 'REGISTER',
  qrCode: '',                        // path or URL to a QR image, e.g. 'assets/qr.png'
  replayLabel: '↺ PLAY AGAIN',
};
