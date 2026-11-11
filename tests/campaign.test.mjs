import test from 'node:test';
import assert from 'node:assert/strict';
import { api, evaluate, ROUNDS } from '../public/local-api.mjs';
import { QUESTIONS } from '../public/campaign.config.mjs';
import { TIERS } from '../public/rules.mjs';

const EXACT = [
  'Name something more exciting than Economics lessons.',
  'Name somewhere you could meet your billion dollar startup co-founder.',
  'Name something you would regret missing.',
];

async function play(answers) {
  let s = await api('start', {});
  const out = [];
  for (const answer of answers) {
    s.roundStart = Date.now() - 1; // skip the preview countdown
    const run = await api('next', { runId: s.runId });
    let r = await api('answer', { runId: run.runId, round: run.round, answer, previewCorrection: false });
    out.push(r.result); s = r.state;
  }
  return { out, state: s };
}

test('three questions, exact wording and order', async () => {
  assert.equal(ROUNDS, 3);
  assert.deepEqual(QUESTIONS.map(q => q.text), EXACT);
  assert.deepEqual((await api('today')).prompts.map(p => p.text), EXACT);
});

test('every Business Con variation is 1 IN A KRILLION on every question', () => {
  for (const q of QUESTIONS) for (const v of ['Business Con', 'business con', 'BUSINESS CON', 'BusinessCon', 'business-con', '  BUSINESS CON  ', 'businesscon']) {
    const m = evaluate(q, v);
    assert.equal(m.tier, 'krillion', `${q.id} ${v}`);
    assert.equal(m.correction, false);
    assert.equal(m.special, true);
  }
  assert.equal(TIERS.krillion.name.toUpperCase(), '1 IN A KRILLION');
});

test('ordinary answers keep normal scoring and are never special', () => {
  const football = evaluate(QUESTIONS[0], 'Football');
  assert.equal(football.tier, 'plankton'); assert.ok(!football.special);
  assert.equal(evaluate(QUESTIONS[1], 'linkedin').tier, 'plankton');
  assert.equal(evaluate(QUESTIONS[2], 'a solar eclipse').tier, 'rare');
  const unlisted = evaluate(QUESTIONS[2], 'my dentist appointment');
  assert.equal(unlisted.tier, 'schooler'); assert.ok(!unlisted.special);
  for (const q of QUESTIONS) for (const a of q.answers) assert.notEqual(a.tier, 'krillion', `${a.answer} should not share the special tier`);
});

test('full playthrough ends the dive, restart begins at question 1, repeatable', async () => {
  for (let i = 0; i < 3; i++) {
    const { out, state } = await play(['Business Con', 'businesscon', ' BUSINESS CON ']);
    assert.deepEqual(out.map(r => r.tier), ['krillion', 'krillion', 'krillion']);
    assert.equal(state.completed, true); assert.equal(state.score, 300);
    const fresh = await api('start', {});
    assert.equal(fresh.round, 0); assert.equal(fresh.results.length, 0);
  }
  const mixed = await play(['Football', 'Business Con', 'graduation']);
  assert.deepEqual(mixed.out.map(r => r.tier), ['plankton', 'krillion', 'plankton']);
});
