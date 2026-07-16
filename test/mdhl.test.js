import test from "node:test";
import assert from "node:assert/strict";
import { loadMdhl, recover } from "./helpers.js";

const { highlight, escape } = await loadMdhl();

const roundTrips = (input) => recover(highlight(input)) === input;

test("bug (a): space-only line keeps its spaces through lexing and rendering", () => {
  const input = "foo\n   \nbar";
  assert.ok(highlight(input).includes("   "), "the three spaces must survive into the output");
  assert.ok(roundTrips(input));
});

test("bug (a): a long space-only line is preserved", () => {
  const spaces = " ".repeat(200);
  assert.ok(roundTrips(`a\n${spaces}\nb`));
  assert.ok(roundTrips(spaces));
});

test("bug (a): consecutive whitespace-only lines are preserved", () => {
  assert.ok(roundTrips("a\n  \n   \n    \nb"));
});

test("bug (b): an indented code fence keeps its leading indent", () => {
  for (let indent = 1; indent <= 3; indent++) {
    const pad = " ".repeat(indent);
    const input = `${pad}\`\`\`\ncode\n\`\`\``;
    assert.ok(highlight(input).startsWith(pad), `${indent}-space indent must be preserved`);
    assert.ok(roundTrips(input), `round-trip failed for ${indent}-space indent`);
  }
});

test("bug (b): indented fences with language and tilde fences keep their indent", () => {
  assert.ok(roundTrips("  ```js\nx\n```"));
  assert.ok(roundTrips("   ~~~\ncode\n~~~"));
});

test("regression: unindented fence still round-trips", () => {
  assert.ok(roundTrips("```js\nfunction f() {}\n```"));
});

test("regression: common block and inline constructs round-trip", () => {
  const inputs = [
    "# Heading",
    "**bold** and _em_ and `code`",
    "- item one\n- item two",
    "1. first\n2. second",
    "> a quote",
    "[text](http://example.com)",
    "plain paragraph text",
    "<div>html block</div>",
  ];
  for (const input of inputs) assert.ok(roundTrips(input), `round-trip failed for ${JSON.stringify(input)}`);
});

test("regression: escape() covers the five entities", () => {
  assert.equal(escape("&<>\"'"), "&amp;&lt;&gt;&quot;&#039;");
});

test("regression: empty string does not throw and yields empty output", () => {
  assert.equal(highlight(""), "");
});
