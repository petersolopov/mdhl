# mdhl ![build](https://github.com/petersolopov/mdhl/workflows/build/badge.svg) [![bundlephobia](https://badgen.net/bundlephobia/minzip/mdhl)](https://bundlephobia.com/result?p=mdhl) [![npm](https://badgen.net/npm/v/mdhl)](https://www.npmjs.com/package/mdhl)

Markdown highlighter

- **Tiny:** ~1KB gzipped
- **Simple:** pass markdown string, get highlighted html
- **Fast:** faster than popular highlighters

## Installation

via npm:

```bash
npm i mdhl
```

hotlinking from unpkg:

```js
import { higlight } from "https://unpkg.com/mdhl?module";
```

## Usage

`highlight` is function that takes markdown string and returns html:

```js
import { highlight } from "mdhl";

const markdown = "# hi there!";

highlight(markdown); // => "<span class='mdhl-heading'># hi there!</span>"
```

For highlighting use css `mdhl/mdhl.css` or define your styles.

## Advanced

You can define your renderers to override html elements. It's useful if you want to redefine classes or highlight code. `highlight` takes second optional argument `renderers`. There are three type of renderers:

- block level renderers: `space`, `blockCode`, `fences`, `heading`, `lheading`, `hr`, `list`, `blockquote`, `html`, `paragraph`.
- inline level renderers: `strong`,`em`,`inlineCode`,`link`,`text`.
- helper renderers `codeInFences`.

### Highlight code

You should redefine `codeInFences` renderer and use an external highlighter, for example [`highlight.js`](https://highlightjs.org/).

```js
import { highlight, defaultRenderers } from "mdhl";
import hljs from "highlight.js";

const renderers = {
  ...defaultRenderers,
  codeInFences: (code, language) => {
    const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
    return hljs.highlight(validLanguage, code).value;
  },
};

const html = highlight(value, renderers);
```

### Custom classes

You should redefine a renderer. Do not forget escape string.

```js
import { highlight, defaultRenderers, escape } from "mdhl";

const renderers = {
  ...defaultRenderers,
  inlineCode: (token) =>
    `<span class="my-awesome-class">${escape(token.text)}</span>`,
};

const html = highlight(value, renderers);
```

## License

[MIT](/LICENSE)
