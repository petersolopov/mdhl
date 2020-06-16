import Yace from "https://unpkg.com/yace@0.0.4/dist/esm/index.esm.js";
import { highlight } from "../mdhl.js";

const value = `# h1 Heading
## h2 Heading
### h3 Heading

Emphasis
========

1. **This is** __bold text__
2. *This is* _italic text_


Links
=====

- [text](http://awesome.link.com)
- ![title](https://awesome.image.com)

Blockquotes
===========

> awesome quote

Code
====

- Inline \`code\`
- Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


- Block code "fences"

\`\`\`
Sample text here...
\`\`\`

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
highlighted.innerHTML = highlight(value);

editor.onUpdate((value) => {
  highlighted.innerHTML = highlight(value);
});
