// In-browser replacement for the Cloudflare Worker API (src/worker.mjs).
// Same endpoints, same response shapes, same matching and scoring rules,
// but the question bank comes from campaign.config.mjs and nothing leaves the
// browser. This is what lets the game run as plain static files (GitHub Pages).
import { TIERS, matchAnswer, normalize } from './rules.mjs';
import { GAME, QUESTIONS } from './campaign.config.mjs';

export const ROUNDS = QUESTIONS.length;
export const ROUND_MS = GAME.answerSeconds * 1000;
export const PREVIEW_MS = GAME.previewSeconds * 1000;

const runs = new Map();
const uuid = () => crypto.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16));
const fail = message => { throw new Error(message); };

// Special answer goes first so it always wins an exact match.
export const answersFor = question => [
  ...(question.special ? [{ answer: question.special.answer, tier: question.special.tier, aliases: question.special.aliases || [], ...(question.special.quip ? { quip: question.special.quip } : {}), special: true }] : []),
  ...question.answers,
];

export function evaluate(question, raw) {
  const match = matchAnswer(raw, answersFor(question));
  // An exact hit on any special alias scores straight away, no "did you mean".
  if (match?.special && [match.answer, ...match.aliases].some(x => normalize(x) === normalize(raw))) return { ...match, correction: false };
  if (match) return match;
  const { tier, minLength = 2 } = GAME.unlisted || {};
  if (tier && TIERS[tier] && normalize(raw).length >= minLength) return { answer: raw.replace(/\s+/g, ' ').trim(), tier, correction: false, unlisted: true };
  return null;
}

const today = () => ({ date: new Date().toISOString().slice(0, 10), dayNumber: GAME.diveNumber, sample: false, source: 'Business Con × Krillion', resetsAt: Date.now() + 86400000, prompts: QUESTIONS.map(({ id, text }) => ({ id, text })) });
function state(run) {
  return { ...today(), runId: run.id, mode: run.mode, round: run.nextRound, roundStart: run.roundStart, pausedAt: run.pausedAt, serverNow: Date.now(), completed: run.completed, results: run.results.map(r => ({ round: r.round, rawAnswer: r.rawAnswer, answer: r.answer, tier: r.tier, score: r.score })), score: run.results.reduce((s, r) => s + r.score, 0) };
}
const own = id => runs.get(id) || fail('Dive not found on this browser.');

const routes = {
  today: () => today(),
  start: ({ practice } = {}) => {
    const run = { id: uuid(), mode: practice === true ? 'practice' : 'daily', nextRound: 0, roundStart: Date.now() + PREVIEW_MS, pausedAt: null, completed: false, results: [] };
    runs.set(run.id, run);
    return state(run);
  },
  state: (_, q) => state(own(q.get('run'))),
  pause: ({ runId, paused }) => {
    const run = own(runId);
    if (paused === true && !run.completed && run.roundStart !== null && !run.pausedAt && Date.now() <= run.roundStart + ROUND_MS) run.pausedAt = Date.now();
    else if (paused === false && run.pausedAt) { run.roundStart += Date.now() - run.pausedAt; run.pausedAt = null; }
    return state(run);
  },
  next: ({ runId }) => {
    const run = own(runId);
    if (run.pausedAt) fail('Close the menu to resume your dive.');
    if (!run.completed && run.roundStart === null) run.roundStart = Date.now() + PREVIEW_MS;
    return state(run);
  },
  answer: ({ runId, round, answer, timeout, confirm, previewCorrection }) => {
    const run = own(runId);
    if (run.pausedAt) fail('Close the menu to resume your dive.');
    if (run.completed || run.roundStart === null || round !== run.nextRound) return { state: state(run), alreadyScored: true };
    const question = QUESTIONS[run.nextRound];
    const raw = typeof answer === 'string' ? answer.trim().slice(0, 256) : '';
    const late = Date.now() > run.roundStart + ROUND_MS;
    const timely = !late || (timeout === true && Date.now() <= run.roundStart + ROUND_MS + 1500);
    const match = raw && timely ? evaluate(question, raw) : null;
    if (!match && raw && !late && !timeout) return { rejected: true, message: `“${raw}”: no echo. try again` };
    if (match?.correction && confirm !== true && !late && !timeout && previewCorrection !== false) return { correction: match.answer, original: raw };
    const result = { round: run.nextRound, rawAnswer: raw || null, answer: match?.answer || null, tier: match?.tier || null, score: match ? TIERS[match.tier].score : 0, quip: match?.quip || null, special: !!match?.special, promptText: question.text };
    run.results.push(result);
    run.nextRound += 1; run.roundStart = null; run.completed = run.nextRound >= ROUNDS;
    return { result, state: state(run) };
  },
  review: (_, q) => {
    const run = own(q.get('run'));
    if (!run.completed) fail('Finish your dive before opening the answer sheet.');
    return { prompts: QUESTIONS.map(question => ({ id: question.id, text: question.text, answers: answersFor(question).map(x => ({ answer: x.answer, tier: x.tier, quip: x.quip, score: TIERS[x.tier].score })).sort((x, y) => y.score - x.score || x.answer.localeCompare(y.answer)) })), population: 0, betterThan: null, dist: [] };
  },
  feedback: () => ({ ok: true }),
};

export async function api(path, data) {
  const [name, query = ''] = path.split('?');
  const route = routes[name] || fail('Unknown endpoint.');
  return structuredClone(route(data, new URLSearchParams(query)));
}
