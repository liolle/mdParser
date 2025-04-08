import { TOKEN } from '../token/token';
import { HANDLERS } from './handlers';
import { Lexer } from './lexer';

export type Pattern = {
  regex: () => RegExp;
  type: TOKEN.TOKEN_TYPE;
  handler: (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => boolean;
};

export namespace PATTERNS {
  const PAT = {
    BOLD: {
      regex: () =>
        /((?<=[^\*]|^)\*{2}(?=[^\*]|$))[^\n]*?((?<=[^\*]|^)\*{2}(?=[^\*]|$))/g,
      handler: HANDLERS.wrapperHandler(TOKEN.TOKEN_TYPE.BOLD),
      type: TOKEN.TOKEN_TYPE.BOLD,
    },
    ITALIC: {
      regex: () => /((?<=[^_]|^)_(?=[^_]|$))[^\n]+?((?<=[^_]|^)_(?=[^_]|$))/g,
      handler: HANDLERS.wrapperHandler(TOKEN.TOKEN_TYPE.ITALIC),
      type: TOKEN.TOKEN_TYPE.ITALIC,
    },
    STRIKETHROUGH: {
      regex: () =>
        /((?<=[^~~]|^)~~(?=[^~~]|$))[^\n]+?((?<=[^~~]|^)~~(?=[^~~]|$))/g,
      handler: HANDLERS.wrapperHandler(TOKEN.TOKEN_TYPE.STRIKETHROUGH),
      type: TOKEN.TOKEN_TYPE.STRIKETHROUGH,
    },
    HIGHLIGHT: {
      regex: () =>
        /((?<=[^==]|^)==(?=[^==]|$))[^\n]+?((?<=[^==]|^)==(?=[^==]|$))/g,
      handler: HANDLERS.wrapperHandler(TOKEN.TOKEN_TYPE.HIGHLIGHT),
      type: TOKEN.TOKEN_TYPE.HIGHLIGHT,
    },
    INLINE_CODE: {
      regex: () => /((?<=[^`]|^)`(?=[^`]|$))[^\n]+?((?<=[^`]|^)`(?=[^`]|$))/g,
      handler: HANDLERS.codeHandler(TOKEN.TOKEN_TYPE.INLINE_CODE),
      type: TOKEN.TOKEN_TYPE.INLINE_CODE,
    },
    CODE_BLOCK: {
      regex: () =>
        /((?<=[^`]|^)`{3}(?=[^`]|$))(.|\n)*?((?<=[^`]|^)`{3}(?=[^`]|$))/g,
      handler: HANDLERS.codeHandler(TOKEN.TOKEN_TYPE.CODE_BLOCK),
      type: TOKEN.TOKEN_TYPE.CODE_BLOCK,
    },
    SPACE: {
      regex: () => / /g,
      handler: HANDLERS.wordHandler(TOKEN.TOKEN_TYPE.WORD),
      type: TOKEN.TOKEN_TYPE.WORD,
    },
    WORD: {
      regex: () => /[^\n]+/g,
      handler: HANDLERS.wordHandler(TOKEN.TOKEN_TYPE.WORD),
      type: TOKEN.TOKEN_TYPE.WORD,
    },
    H6: {
      regex: () => /^###### [^\n]+\n?/g,
      handler: HANDLERS.headerHandler(TOKEN.TOKEN_TYPE.H6, '###### '),
      type: TOKEN.TOKEN_TYPE.H6,
    },
    H5: {
      regex: () => /^##### [^\n]+\n?/g,
      handler: HANDLERS.headerHandler(TOKEN.TOKEN_TYPE.H5, '##### '),
      type: TOKEN.TOKEN_TYPE.H5,
    },
    H4: {
      regex: () => /^#### [^\n]+\n?/g,
      handler: HANDLERS.headerHandler(TOKEN.TOKEN_TYPE.H4, '#### '),
      type: TOKEN.TOKEN_TYPE.H4,
    },
    H3: {
      regex: () => /^### [^\n]+\n?/g,
      handler: HANDLERS.headerHandler(TOKEN.TOKEN_TYPE.H3, '### '),
      type: TOKEN.TOKEN_TYPE.H3,
    },
    H2: {
      regex: () => /^## [^\n]+\n?/g,
      handler: HANDLERS.headerHandler(TOKEN.TOKEN_TYPE.H2, '## '),
      type: TOKEN.TOKEN_TYPE.H2,
    },

    H1: {
      regex: () => /^# [^\n]+\n?/g,
      handler: HANDLERS.headerHandler(TOKEN.TOKEN_TYPE.H1, '# '),
      type: TOKEN.TOKEN_TYPE.H1,
    },
    NEW_LINE: {
      regex: () => /\n|\s\n/g,
      handler: HANDLERS.newLineHandler(TOKEN.TOKEN_TYPE.NEW_LINE),
      type: TOKEN.TOKEN_TYPE.NEW_LINE,
    },
    ESCAPE: {
      regex: () => /\\./g,
      handler: HANDLERS.escapeHandler(TOKEN.TOKEN_TYPE.ESCAPE),
      type: TOKEN.TOKEN_TYPE.ESCAPE,
    },
    PARAGRAPH: {
      regex: () => /([^\n]+\n)+/g,
      handler: HANDLERS.paragraphHandler(TOKEN.TOKEN_TYPE.PARAGRAPH, ''),
      type: TOKEN.TOKEN_TYPE.PARAGRAPH,
    },
    EXTERNAL_LINK: {
      regex: () => /!?\[([^\n\]\[]|!\[[^\n]+\]\([^\n]+\))*?\]\([^\n]*?\)\n?/g,
      handler: HANDLERS.externalLinkHandler(TOKEN.TOKEN_TYPE.EXTERNAL_LINK),
      type: TOKEN.TOKEN_TYPE.EXTERNAL_LINK,
    },
    UL: {
      regex: () => /(([ \t]*- [^\n]+)\n?)+/g,
      handler: HANDLERS.listHandler(TOKEN.TOKEN_TYPE.UL),
      type: TOKEN.TOKEN_TYPE.UL,
    },
    OL: {
      regex: () => /(([ \t]*([0-9]+)\. [^\n]+)\n?)+/g,
      handler: HANDLERS.listHandler(TOKEN.TOKEN_TYPE.OL),
      type: TOKEN.TOKEN_TYPE.OL,
    },
    LI: {
      regex: () => /([ \t]*- [^\n]+)\n?/g,
      handler: HANDLERS.listHandler(TOKEN.TOKEN_TYPE.LI),
      type: TOKEN.TOKEN_TYPE.LI,
    },
    CHECK_BOX: {
      regex: () => /\[[ xX]\]/g,
      handler: HANDLERS.listHandler(TOKEN.TOKEN_TYPE.UL),
      type: TOKEN.TOKEN_TYPE.UL,
    },
  };
  export const ALL_PATTERNS: Pattern[] = [
    //
    PAT.OL,
    PAT.UL,
    PAT.LI,
    PAT.NEW_LINE,
    PAT.CODE_BLOCK,
    PAT.EXTERNAL_LINK,
    PAT.H6,
    PAT.H5,
    PAT.H4,
    PAT.H3,
    PAT.H2,
    PAT.H1,
    PAT.PARAGRAPH,
    PAT.ESCAPE,
    PAT.INLINE_CODE,
    PAT.BOLD,
    PAT.ITALIC,
    PAT.STRIKETHROUGH,
    PAT.HIGHLIGHT,
    PAT.WORD,
  ];
  export const PARAGRAPH_NESTED_PATTERNS: Pattern[] = [
    //
    PAT.ESCAPE,
    PAT.INLINE_CODE,
    PAT.EXTERNAL_LINK,
    PAT.BOLD,
    PAT.ITALIC,
    PAT.STRIKETHROUGH,
    PAT.HIGHLIGHT,
    PAT.WORD,
  ];

  export const HEADER_NESTED_PATTERNS: Pattern[] = [
    //
    PAT.ESCAPE,
    PAT.INLINE_CODE,
    PAT.EXTERNAL_LINK,
    PAT.BOLD,
    PAT.ITALIC,
    PAT.STRIKETHROUGH,
    PAT.HIGHLIGHT,
    PAT.WORD,
  ];

  export const BOLD_NESTED_PATTERNS: Pattern[] = [
    //
    PAT.ESCAPE,
    PAT.INLINE_CODE,
    PAT.EXTERNAL_LINK,
    PAT.ITALIC,
    PAT.STRIKETHROUGH,
    PAT.HIGHLIGHT,
    PAT.WORD,
  ];
  export const ITALIC_NESTED_PATTERNS: Pattern[] = [
    //
    PAT.ESCAPE,
    PAT.INLINE_CODE,
    PAT.EXTERNAL_LINK,
    PAT.BOLD,
    PAT.STRIKETHROUGH,
    PAT.HIGHLIGHT,
    PAT.WORD,
  ];

  export const STRIKETHROUGH_NESTED_PATTER: Pattern[] = [
    //
    PAT.ESCAPE,
    PAT.INLINE_CODE,
    PAT.EXTERNAL_LINK,
    PAT.BOLD,
    PAT.ITALIC,
    PAT.HIGHLIGHT,
    PAT.WORD,
  ];

  export const HIGHLIGHT_NESTED_PATTER: Pattern[] = [
    //
    PAT.ESCAPE,
    PAT.INLINE_CODE,
    PAT.EXTERNAL_LINK,
    PAT.BOLD,
    PAT.ITALIC,
    PAT.STRIKETHROUGH,
    PAT.WORD,
  ];

  export const EXTERNAL_LINK_NESTED_PATTER: Pattern[] = [
    //
    PAT.EXTERNAL_LINK,
    PAT.ESCAPE,
    PAT.BOLD,
    PAT.ITALIC,
    PAT.STRIKETHROUGH,
    PAT.HIGHLIGHT,
    PAT.WORD,
  ];

  export const WORD_NESTED_PATTER: Pattern[] = [
    //
    PAT.ESCAPE,
    PAT.INLINE_CODE,
    PAT.EXTERNAL_LINK,
    PAT.BOLD,
    PAT.ITALIC,
    PAT.STRIKETHROUGH,
    PAT.HIGHLIGHT,
    PAT.WORD,
  ];
}
