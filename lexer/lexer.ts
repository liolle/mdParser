import { TOKEN } from './token';
import { TOKENIZER } from './tokenizer';

export type Pattern = {
  regex: () => RegExp;
  type: TOKEN.TOKEN_TYPE;
  handler: (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => void;
};

export namespace Lexer {
  const PATTERNS = {
    BOLD: {
      regex: () =>
        /((?<=[^\*]|^)\*{2}(?=[^\*]|$))[^\n]+((?<=[^\*]|^)\*{2}(?=[^\*]|$))/g,
      handler: wrapperHandler(TOKEN.TOKEN_TYPE.BOLD),
      type: TOKEN.TOKEN_TYPE.BOLD,
    },
    ITALIC: {
      regex: () => /((?<=[^_]|^)_(?=[^_]|$))[^\n]+((?<=[^_]|^)_(?=[^_]|$))/g,
      handler: wrapperHandler(TOKEN.TOKEN_TYPE.ITALIC),
      type: TOKEN.TOKEN_TYPE.ITALIC,
    },
    STRIKETHROUGH: {
      regex: () =>
        /((?<=[^~~]|^)~~(?=[^~~]|$))[^\n]+((?<=[^~~]|^)~~(?=[^~~]|$))/g,
      handler: wrapperHandler(TOKEN.TOKEN_TYPE.STRIKETHROUGH),
      type: TOKEN.TOKEN_TYPE.STRIKETHROUGH,
    },
    HIGHLIGHT: {
      regex: () =>
        /((?<=[^==]|^)==(?=[^==]|$))[^\n]+((?<=[^==]|^)==(?=[^==]|$))/g,
      handler: wrapperHandler(TOKEN.TOKEN_TYPE.HIGHLIGHT),
      type: TOKEN.TOKEN_TYPE.HIGHLIGHT,
    },
    SPACE: {
      regex: () => / /,
      handler: defaultHandler(TOKEN.TOKEN_TYPE.SPACE),
      type: TOKEN.TOKEN_TYPE.SPACE,
    },
    WORD: {
      regex: () => /[^\n\\]+/,
      handler: wordHandler(TOKEN.TOKEN_TYPE.WORD),
      type: TOKEN.TOKEN_TYPE.WORD,
    },
    H6: {
      regex: () => /^###### [^\n]+\n?/,
      handler: headerHandler(TOKEN.TOKEN_TYPE.H6, '###### '),
      type: TOKEN.TOKEN_TYPE.H6,
    },
    H5: {
      regex: () => /^##### [^\n]+\n?/,
      handler: headerHandler(TOKEN.TOKEN_TYPE.H5, '##### '),
      type: TOKEN.TOKEN_TYPE.H5,
    },
    H4: {
      regex: () => /^#### [^\n]+\n?/,
      handler: headerHandler(TOKEN.TOKEN_TYPE.H4, '#### '),
      type: TOKEN.TOKEN_TYPE.H4,
    },
    H3: {
      regex: () => /^### [^\n]+\n?/,
      handler: headerHandler(TOKEN.TOKEN_TYPE.H3, '### '),
      type: TOKEN.TOKEN_TYPE.H3,
    },
    H2: {
      regex: () => /^## [^\n]+\n?/,
      handler: headerHandler(TOKEN.TOKEN_TYPE.H2, '## '),
      type: TOKEN.TOKEN_TYPE.H2,
    },

    H1: {
      regex: () => /^# [^\n]+\n?/,
      handler: headerHandler(TOKEN.TOKEN_TYPE.H1, '# '),
      type: TOKEN.TOKEN_TYPE.H1,
    },
    NEW_LINE: {
      regex: () => /\n/,
      handler: defaultHandler(TOKEN.TOKEN_TYPE.NEW_LINE),
      type: TOKEN.TOKEN_TYPE.NEW_LINE,
    },
    ESCAPE: {
      regex: () => /\\./,
      handler: escapeHandler(TOKEN.TOKEN_TYPE.ESCAPE),
      type: TOKEN.TOKEN_TYPE.ESCAPE,
    },
    PARAGRAPH: {
      regex: () => /[^\n]+\n/,
      handler: paragraphHandler(TOKEN.TOKEN_TYPE.PARAGRAPH, ''),
      type: TOKEN.TOKEN_TYPE.PARAGRAPH,
    },
    EXTERNAL_LINK: {
      regex: () => /!?\[[^\n]*\]([^\n]+)\n?/,
      handler: externalLinkHandler(TOKEN.TOKEN_TYPE.EXTERNAL_LINK),
      type: TOKEN.TOKEN_TYPE.EXTERNAL_LINK,
    },
  };
  export const ALL_PATTERNS: Pattern[] = [
    //
    PATTERNS.ESCAPE,
    PATTERNS.NEW_LINE,
    PATTERNS.EXTERNAL_LINK,
    PATTERNS.H6,
    PATTERNS.H5,
    PATTERNS.H4,
    PATTERNS.H3,
    PATTERNS.H2,
    PATTERNS.H1,
    PATTERNS.PARAGRAPH,
    PATTERNS.BOLD,
    PATTERNS.ITALIC,
    PATTERNS.STRIKETHROUGH,
    PATTERNS.HIGHLIGHT,
    PATTERNS.SPACE,
    PATTERNS.WORD,
  ];
  export const PARAGRAPH_NESTED_PATTERNS: Pattern[] = [
    //
    PATTERNS.BOLD,
    PATTERNS.ITALIC,
    PATTERNS.STRIKETHROUGH,
    PATTERNS.HIGHLIGHT,
    PATTERNS.WORD,
  ];

  export const HEADER_NESTED_PATTERNS: Pattern[] = [
    //
    PATTERNS.BOLD,
    PATTERNS.ITALIC,
    PATTERNS.STRIKETHROUGH,
    PATTERNS.HIGHLIGHT,
    PATTERNS.WORD,
  ];

  export const BOLD_NESTED_PATTERNS: Pattern[] = [
    //
    PATTERNS.ITALIC,
    PATTERNS.STRIKETHROUGH,
    PATTERNS.HIGHLIGHT,
    PATTERNS.WORD,
  ];
  export const ITALIC_NESTED_PATTERNS: Pattern[] = [
    //
    PATTERNS.BOLD,
    PATTERNS.STRIKETHROUGH,
    PATTERNS.HIGHLIGHT,
    PATTERNS.WORD,
  ];

  export const STRIKETHROUGH_NESTED_PATTER: Pattern[] = [
    //
    PATTERNS.BOLD,
    PATTERNS.ITALIC,
    PATTERNS.HIGHLIGHT,
    PATTERNS.WORD,
  ];

  export const HIGHLIGHT_NESTED_PATTER: Pattern[] = [
    //
    PATTERNS.BOLD,
    PATTERNS.ITALIC,
    PATTERNS.STRIKETHROUGH,
    PATTERNS.WORD,
  ];

  export const EXTERNAL_LINK_NESTED_PATTER: Pattern[] = [
    //
    PATTERNS.BOLD,
    PATTERNS.ITALIC,
    PATTERNS.STRIKETHROUGH,
    PATTERNS.HIGHLIGHT,
    PATTERNS.WORD,
  ];

  export const WORD_NESTED_PATTER: Pattern[] = [
    //
    PATTERNS.ESCAPE,
    PATTERNS.WORD,
  ];

  export class Lexer {
    private _tokens: TOKEN.Token[] = [];
    private offset = 0;
    private source: string;
    private lines = 0;

    constructor(source: string) {
      this.source = source;
    }

    push(token: TOKEN.Token) {
      this._tokens.push(token);
    }

    bump(len: number) {
      this.offset += len;
    }

    bumpLine() {
      this.lines++;
    }

    remainder() {
      return this.source.slice(this.offset);
    }

    eof() {
      return this.source.length <= this.offset;
    }

    get tokens() {
      return this._tokens;
    }
    get isFirstLineCharacter() {
      return this.offset == 0 || this.source.charAt(this.offset - 1) == '\n';
    }
  }
}

function defaultHandler(type: TOKEN.TOKEN_TYPE) {
  return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
    lexer.push(new TOKEN.Token(type, [raw_value]));
    lexer.bump(raw_value.length);

    if (raw_value == '\n') lexer.bumpLine();
  };
}

function wordHandler(type: TOKEN.TOKEN_TYPE) {
  return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
    const tokens: (TOKEN.Token | string)[] = [];

    nestedSearch(Lexer.WORD_NESTED_PATTER, raw_value, type, tokens);

    lexer.push(new TOKEN.Token(type, tokens));
    lexer.bump(raw_value.length);
  };
}

function externalLinkHandler(type: TOKEN.TOKEN_TYPE) {
  return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
    const tokens: (TOKEN.Token | string)[] = [];
    let offset = 1;
    if (raw_value[0] == '!') offset++;

    const [name, url] = raw_value
      .slice(offset, raw_value.length - 1)
      .split('](');

    let next_idx = Infinity;

    for (const pattern of Lexer.EXTERNAL_LINK_NESTED_PATTER) {
      const exec_res = pattern.regex().exec(name);
      if (!exec_res) continue;
      if (
        exec_res['index'] != 0 ||
        (pattern.type != type && pattern.type != TOKEN.TOKEN_TYPE.WORD)
      ) {
        next_idx = Math.min(next_idx, exec_res['index']);
      }
    }

    if (next_idx != Infinity) {
      const word = name.slice(0, next_idx);
      if (word.length > 0) {
        tokens.push(new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [word]));
      }
      tokens.push(
        ...TOKENIZER.tokenize(name.slice(next_idx), {
          patterns: Lexer.EXTERNAL_LINK_NESTED_PATTER,
        }),
      );
    } else if (name && name != '') {
      tokens.push(new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [name]));
    }

    lexer.push(
      new TOKEN.LinkToken(
        url,
        tokens,
        offset == 2
          ? TOKEN.LINK_TOKEN_TYPE.IMAGE
          : TOKEN.LINK_TOKEN_TYPE.DEFAULT,
      ),
    );
    lexer.bump(raw_value.length);
  };
}

function escapeHandler(type: TOKEN.TOKEN_TYPE) {
  return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
    const body = raw_value.slice(1);

    lexer.push(new TOKEN.Token(type, [body]));
    lexer.bump(raw_value.length);
  };
}

function wrapperHandler(type: TOKEN.TOKEN_TYPE) {
  return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
    let size = 1;
    let patterns: Pattern[] = [];

    switch (type) {
      case TOKEN.TOKEN_TYPE.BOLD:
        size = 2;
        patterns = Lexer.BOLD_NESTED_PATTERNS;
        break;

      case TOKEN.TOKEN_TYPE.ITALIC:
        size = 1;
        patterns = Lexer.ITALIC_NESTED_PATTERNS;
        break;
      case TOKEN.TOKEN_TYPE.STRIKETHROUGH:
        size = 2;
        patterns = Lexer.STRIKETHROUGH_NESTED_PATTER;
        break;

      case TOKEN.TOKEN_TYPE.HIGHLIGHT:
        size = 2;
        patterns = Lexer.STRIKETHROUGH_NESTED_PATTER;
        break;

      default:
        break;
    }

    // extract body
    const body = raw_value.slice(size, raw_value.length - size);
    const tokens: (TOKEN.Token | string)[] = [];

    nestedSearch(patterns, body, type, tokens);

    lexer.push(new TOKEN.Token(type, tokens));
    lexer.bump(raw_value.length);

    return true;
  };
}

function paragraphHandler(type: TOKEN.TOKEN_TYPE, key: string) {
  return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
    // extract body
    const body = raw_value.slice(0, raw_value.length - 1);
    const tokens: (TOKEN.Token | string)[] = [];

    nestedSearch(Lexer.PARAGRAPH_NESTED_PATTERNS, body, type, tokens);

    lexer.push(new TOKEN.Token(type, tokens));
    lexer.bump(raw_value.length);

    return true;
  };
}

function headerHandler(type: TOKEN.TOKEN_TYPE, key: string) {
  return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
    // extract body
    const body =
      raw_value[raw_value.length - 1] == '\n'
        ? raw_value.slice(key.length, raw_value.length - 1)
        : raw_value.slice(key.length);
    const tokens: (TOKEN.Token | string)[] = [];

    nestedSearch(Lexer.HEADER_NESTED_PATTERNS, body, type, tokens);

    lexer.push(new TOKEN.Token(type, tokens));
    lexer.bump(raw_value.length);

    return true;
  };
}

function nestedSearch(
  patterns: Pattern[],
  body: string,
  type: TOKEN.TOKEN_TYPE,
  tokens: (TOKEN.Token | string)[],
) {
  let next_idx = Infinity;

  for (const pattern of patterns) {
    const exec_res = pattern.regex().exec(body);
    if (!exec_res) continue;
    if (
      exec_res['index'] != 0 ||
      (pattern.type != type && pattern.type != TOKEN.TOKEN_TYPE.WORD)
    ) {
      next_idx = Math.min(next_idx, exec_res['index']);
    }
  }

  if (next_idx != Infinity) {
    const word = body.slice(0, next_idx);
    if (word.length > 0) {
      tokens.push(new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [word]));
    }
    tokens.push(
      ...TOKENIZER.tokenize(body.slice(next_idx), {
        patterns: patterns,
      }),
    );
  } else {
    if (type != TOKEN.TOKEN_TYPE.WORD)
      tokens.push(new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [body]));
    else tokens.push(body);
  }
}
