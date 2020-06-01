function escape(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const blockRegexps = {
  space: /^\n+/,
  blockCode: /^( {4}[^\n]+\n*)+/,
  fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
  heading: /^#{1,6} [^\n]+(\n|$)/,
  lheading: /^[^\n]+\n {0,3}(=+|-+) *(\n+|$)/,
  hr: /^(([-_*]) *){3,}(\n+|$)/,
  list: /^( {0})((?:[*+-]|\d{1,9}\.)) [\s\S]+?(?:\n+(?! )(?!\1(?:[*+-]|\d{1,9}\.) )\n*|\s*$)/,
  blockquote: /^( {0,3}> ?([^\n]*)(?:\n|$))+/,
  html: /^ {0,3}(?:<(script|pre|style)[\s>][\s\S]*?(?:<\/\1>[^\n]*\n+|$)|<!--(?!-?>)[\s\S]*?-->[^\n]*(\n+|$)|<\/?(\w+)(?: +|\n|\/?>)[\s\S]*?(?:\n{2,}|$))/,

  // order matters. it should be last for correct parsed
  paragraph: /^[^\n]+/,
};

const inlineRegexps = {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
  inlineCode: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
  link: /^!?\[([\s\S]+)\]\(\s*([\s\S]+)(?:\s+([\s\S]+))?\s*\)/,

  // order matters. text should be last for correct parsed
  text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/,
};

const createSpan = (content, tokenType) =>
  `<span class="mdhl-${tokenType}">${content}</span>`;

// prettier-ignore
export const defaultRenderers = {
  heading: (token, renderers, renderLine) => createSpan(renderLine(token.text, renderers), token.type),
  lheading: (token, renderers, renderLine) => createSpan(renderLine(token.text, renderers), 'heading'),
  paragraph: (token, renderers, renderLine) => createSpan(renderLine(token.text, renderers), token.type),

  list: (token, renderers, renderLine) => {
    const items = token.text
      .split('\n')
      .map(item => {
        const bullet = item.substr(0,1);
        const rest = item.substr(1);
        const parsed = renderLine(rest, renderers);

        return `${createSpan(bullet, 'bullet')}${parsed}`
      })
      .join('\n');

    return createSpan(items, 'list')
  },

  space: (token) => token.text,
  text: (token) => token.text,

  defaultInlineRenderer: token => createSpan(token.text, token.type),
  defaultBlockRenderer: token => createSpan(escape(token.text), token.type),
};

function renderLine(line, renderers) {
  let outputLine = "";

  while (line) {
    const matched = Object.keys(inlineRegexps).some((type) => {
      const cap = inlineRegexps[type].exec(line);
      if (cap) {
        const text = cap[0];
        line = line.substring(text.length);
        const escapedText = escape(text);

        const renderer = renderers[type] || renderers.defaultInlineRenderer;

        outputLine += renderer(
          { type, text: escapedText, cap },
          renderers,
          renderLine
        );

        return true;
      }

      return false;
    });

    if (!matched) {
      throw new Error("Infinite loop on byte: " + line.charCodeAt(0));
    }
  }

  return outputLine;
}

function blockLexer(src) {
  const tokens = [];
  src = src.replace(/^ +$/gm, "");

  while (src) {
    const matched = Object.keys(blockRegexps).some((type) => {
      const cap = blockRegexps[type].exec(src);
      if (cap) {
        const text = cap[0];
        src = src.substring(text.length);
        tokens.push({ text, type, cap });

        return true;
      }

      return false;
    });

    if (!matched) {
      throw new Error("Infinite loop on byte: " + src.charCodeAt(0));
    }
  }

  return tokens;
}

function render(tokens, renderers) {
  return tokens
    .map((token) => {
      const renderer = renderers[token.type] || renderers.defaultBlockRenderer;
      return renderer(token, renderers, renderLine);
    })
    .join("")
    .replace(/\n/g, "<br/>");
}

export function highlight(src, renderers = defaultRenderers) {
  const blockTokens = blockLexer(src);

  return render(blockTokens, renderers);
}
