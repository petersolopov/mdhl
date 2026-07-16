import test from "node:test";
import assert from "node:assert/strict";
import { loadMdhl, recover } from "./helpers.js";

const { highlight, blockLexer } = await loadMdhl();

const roundTrips = (s) => recover(highlight(s)) === s;
const types = (s) => blockLexer(s).map((t) => t.type);
const fenceToken = (s) => blockLexer(s).find((t) => t.type === "fences");

test("fences: capture groups map to indent, open, language, newline, code, close", () => {
  const f = fenceToken("  ```js\ncode\n```");
  assert.equal(f.cap[1], "  ");
  assert.equal(f.cap[2], "```");
  assert.equal(f.cap[3], "js");
  assert.equal(f.cap[4], "\n");
  assert.equal(f.cap[5], "code\n");
  assert.equal(f.cap[6], "```");
});

test("fences: the closing backreference stops the code group, trailing content is its own block", () => {
  // a wrong closing backreference would let the code group swallow "```\nafter"
  assert.equal(fenceToken("```\ncode\n```\nafter").cap[5], "code\n");
  assert.deepEqual(types("```\ncode\n```\nafter"), ["fences", "paragraph"]);
  assert.ok(roundTrips("```\ncode\n```\nafter"));
});

test("space-only line: 4 spaces is not blockCode, 5+ is; both keep every space", () => {
  assert.deepEqual(types("    "), ["paragraph"]);
  assert.deepEqual(types("     "), ["blockCode"]);
  assert.ok(roundTrips("a\n    \nb"));
  assert.ok(roundTrips("a\n     \nb"));
});

test("space-only line with CRLF keeps its spaces", () => {
  assert.ok(roundTrips("a\r\n    \r\nb"));
});

test("space-only line adjacent to a Setext underline is preserved", () => {
  assert.ok(roundTrips("Title\n   \n==="));
  assert.ok(roundTrips("Title\n===\n   \nbody"));
});

test("space-only lines inside a list are preserved", () => {
  assert.ok(roundTrips("- a\n   \n- b"));
  assert.ok(roundTrips("* a\n  \n  b"));
});

test("generic HTML block with an internal whitespace-only line keeps its spaces", () => {
  assert.ok(roundTrips("<div>\n   \ntext\n\nafter"));
  assert.ok(roundTrips("<section>\n   \n</section>"));
});

test("whitespace around bare CR and U+2028/U+2029 separators is preserved", () => {
  const ls = String.fromCharCode(0x2028);
  const ps = String.fromCharCode(0x2029);
  assert.ok(roundTrips("a\r   \rb"));
  assert.ok(roundTrips(`a${ls}   ${ls}b`));
  assert.ok(roundTrips(`a${ps}   ${ps}b`));
});
