import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { loadMdhl, recover, buildCorpus } from "./helpers.js";

const { highlight } = await loadMdhl();
const corpus = buildCorpus();
const MAX_MS = 200;

test(`corpus: no throw (${corpus.length} inputs)`, () => {
  const failures = [];
  for (const { label, input } of corpus) {
    try {
      highlight(input);
    } catch (e) {
      failures.push(`${label}: ${e.message} (input=${JSON.stringify(input).slice(0, 80)})`);
    }
  }
  assert.deepEqual(failures, [], `highlight() threw on ${failures.length} input(s):\n${failures.slice(0, 20).join("\n")}`);
});

test("corpus: text preservation (round-trips through recover)", () => {
  const failures = [];
  for (const { label, input } of corpus) {
    let out;
    try {
      out = highlight(input);
    } catch {
      continue; // no-throw test owns this class
    }
    const got = recover(out);
    if (got !== input) {
      failures.push(`${label}: in=${JSON.stringify(input).slice(0, 80)} got=${JSON.stringify(got).slice(0, 80)}`);
    }
  }
  assert.deepEqual(failures, [], `text not preserved on ${failures.length} input(s):\n${failures.slice(0, 20).join("\n")}`);
});

test(`corpus: bounded runtime (<${MAX_MS}ms per input)`, () => {
  const slow = [];
  let worst = { label: null, ms: 0 };
  for (const { label, input } of corpus) {
    const t0 = performance.now();
    try {
      highlight(input);
    } catch {
      // liveness is separate from correctness; the no-throw test owns throws
    }
    const ms = performance.now() - t0;
    if (ms > worst.ms) worst = { label, ms };
    if (ms > MAX_MS) slow.push(`${label}: ${ms.toFixed(1)}ms`);
  }
  assert.deepEqual(slow, [], `slow inputs:\n${slow.join("\n")}`);
  assert.ok(worst.ms < MAX_MS, `worst input ${worst.label} took ${worst.ms.toFixed(1)}ms`);
});
