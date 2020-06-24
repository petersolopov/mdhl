import Yace from "https://unpkg.com/yace@0.0.5/dist/esm/index.esm.js";
import { highlight, defaultRenderers } from "../mdhl.js";

const value = `# h1 Heading

Emphasis
========

1. **This is** __bold text__
2. *This is* _italic text_

Code
====

- Inline \`code\`
- Block code "fences"

\`\`\`js
function sum(a, b) {
  return a + b;
}
\`\`\`

- Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code

Links
=====

- [text](http://awesome.link.com)
- ![title](https://awesome.image.com)

Blockquotes
===========

> awesome quote

Markup
======

<div>some html</div>
`;

const editor = new Yace("#editor", {
  style: {
    fontSize: "16px",
  },
  value,
});

editor.textarea.focus();
editor.textarea.spellcheck = false;

const highlighted = document.querySelector(".highlighted");

const renderers = {
  ...defaultRenderers,
  codeInFences: (code, language) => {
    try {
      return hljs.highlight(language, code).value;
    } catch (error) {
      return defaultRenderers.codeInFences(code, language);
    }
  },
};

highlighted.innerHTML = highlight(value, renderers);

editor.onUpdate((value) => {
  highlighted.innerHTML = highlight(value, renderers);
});
