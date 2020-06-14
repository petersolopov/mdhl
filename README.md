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

```js
import { highlight } from "mdhl";

const markdown = "# hi there!";

highlight(markdown); // => "<span class='mdhl-heading'># hi there!</span>"
```

## License

[MIT](/LICENSE)
