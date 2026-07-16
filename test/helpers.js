import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

export async function loadMdhl() {
  const target = process.env.MDHL_TARGET
    ? pathToFileURL(resolve(process.env.MDHL_TARGET)).href
    : new URL("../mdhl.js", import.meta.url).href;
  return import(target);
}

// Inverse of render(): <br/> back to \n, drop the mdhl-* tags, then undo the
// five escape() entities (&amp; last, so &amp;lt; round-trips to &lt;). Tags are
// stripped before entities so an escaped &lt; is never mistaken for markup.
export function recover(html) {
  return html
    .replace(/<br\/>/g, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&");
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildCorpus() {
  const cases = [];
  const add = (label, input) => cases.push({ label, input });

  for (let c = 0x20; c <= 0x7e; c++) {
    add(`ascii-${c}`, String.fromCharCode(c));
  }
  for (let c = 0x00; c <= 0x1f; c++) {
    add(`ctrl-${c}`, String.fromCharCode(c));
  }
  add("del-127", "\x7f");

  add("fence-open-only", "```");
  add("fence-open-lang", "```js");
  add("fence-open-code", "```\ncode");
  add("fence-open-code-nl", "```\ncode\n");
  add("tilde-open-code", "~~~\ncode");
  for (let n = 1; n <= 8; n++) add(`backticks-${n}`, "`".repeat(n));
  add("inline-code-unclosed", "`abc");
  add("inline-code-nested", "``a`b``");

  for (let ind = 1; ind <= 3; ind++) {
    const pad = " ".repeat(ind);
    add(`ind-fence-bt-${ind}`, `${pad}\`\`\`\ncode\n\`\`\``);
    add(`ind-fence-bt-lang-${ind}`, `${pad}\`\`\`js\nx\n\`\`\``);
    add(`ind-fence-tilde-${ind}`, `${pad}~~~\ncode\n~~~`);
    add(`ind-fence-open-${ind}`, `${pad}\`\`\`\ncode`);
  }

  for (const n of [1, 2, 3, 200, 250]) {
    const sp = " ".repeat(n);
    add(`ws-only-${n}`, sp);
    add(`ws-between-${n}`, `foo\n${sp}\nbar`);
    add(`ws-lead-${n}`, `${sp}\ntext`);
    add(`ws-trail-${n}`, `text\n${sp}`);
  }
  add("tabs-only", "\t\t\t");
  add("ws-tab-between", "a\n\t \t\nb");
  add("multi-ws-lines", "a\n  \n   \n    \nb");

  add("backslash", "\\");
  add("backslash-2", "\\\\");
  add("backslash-text", "a\\b");
  add("backslash-nl", "\\\n\\");
  add("backslash-star", "\\*not em\\*");

  add("crlf", "a\r\nb");
  add("cr-only", "a\rb");
  add("crlf-blank", "a\r\n\r\nb");
  add("crlf-ws", "a\r\n \r\nb");

  add("emoji", "😀");
  add("emoji-run", "😀😃😄😁");
  add("zwj-family", "👨‍👩‍👧");
  add("astral-math", "𝕏𝕐𝕫");
  add("lone-high-surrogate", "\uD800");
  add("lone-low-surrogate", "\uDC00");
  add("surrogate-in-md", "**😀**\n# 𝕏");

  for (const ch of ["*", "_", "`", "[", ">"]) {
    add(`deep-${ch}`, ch.repeat(200));
  }
  add("deep-mixed", "*_`[".repeat(60));
  add("deep-open-em", "*".repeat(50) + "text");
  add("deep-brackets", "[".repeat(100) + "x" + "]".repeat(100));
  add("deep-blockquote", "> ".repeat(80) + "q");
  add("deep-list-nest", Array.from({ length: 40 }, (_, i) => " ".repeat(i) + "* item").join("\n"));
  add("interleaved", "*[_`".repeat(40) + "]".repeat(40));

  const charset = "abc 123\n\t\r*_`[]()#>-+.!\\\"'~=<>&😀".split("");
  const rand = mulberry32(0x9e3779b9);
  for (let i = 0; i < 3000; i++) {
    const len = 1 + Math.floor(rand() * 400);
    let s = "";
    for (let j = 0; j < len; j++) {
      s += charset[Math.floor(rand() * charset.length)];
    }
    add(`random-${i}`, s);
  }

  return cases;
}
