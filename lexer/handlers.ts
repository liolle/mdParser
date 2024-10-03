import { resolveLanguage } from '../token/code';
import { Factory } from '../token/factory';
import { Heading } from '../token/heading';
import { LinkToken, LINK_TOKEN_TYPE } from '../token/links';
import { ListToken, ListTokenBuilder } from '../token/list';
import { Token, TOKEN } from '../token/token';
import { Word } from '../token/word';
import { Lexer } from './lexer';
import { Pattern, PATTERNS } from './patterns';
import { TOKENIZER } from './tokenizer';

export namespace HANDLERS {
  export function defaultHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      lexer.push(Factory.NEW_LINE());
      lexer.bump(raw_value.length);

      if (raw_value == '\n') lexer.bumpLine();
    };
  }

  export function wordHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      const tokens: Token[] = [];
      let word = {
        word: '',
      };

      nestedSearch(PATTERNS.WORD_NESTED_PATTER, raw_value, type, tokens, word);

      lexer.push(new Word(word.word, tokens));
      lexer.bump(raw_value.length);
    };
  }

  export function externalLinkHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      const tokens: Token[] = [];
      let offset = 1;
      if (raw_value[0] == '!') offset++;

      const trimmed_value = raw_value.trim();

      const [name, url] = trimmed_value
        .slice(offset, trimmed_value.length - 1)
        .split(/\]\s*\(?/);

      let next_idx = Infinity;

      for (const pattern of PATTERNS.EXTERNAL_LINK_NESTED_PATTER) {
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
          tokens.push(new Token(TOKEN.TOKEN_TYPE.WORD, word, []));
        }
        tokens.push(
          ...TOKENIZER.tokenize(name.slice(next_idx), {
            patterns: PATTERNS.EXTERNAL_LINK_NESTED_PATTER,
          }),
        );
      } else if (name && name != '') {
        tokens.push(new Token(TOKEN.TOKEN_TYPE.WORD, name, []));
      }

      lexer.push(
        new LinkToken(
          url,
          tokens,
          offset == 2 ? LINK_TOKEN_TYPE.IMAGE : LINK_TOKEN_TYPE.DEFAULT,
        ),
      );
      lexer.bump(raw_value.length);
    };
  }

  export function escapeHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      const body = raw_value.slice(1);

      lexer.push(new Token(type, body, []));
      lexer.bump(raw_value.length);
    };
  }

  export function codeHandler(
    type: TOKEN.TOKEN_TYPE.INLINE_CODE | TOKEN.TOKEN_TYPE.CODE_BLOCK,
  ) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      let body = '';

      switch (type) {
        case TOKEN.TOKEN_TYPE.INLINE_CODE:
          body = raw_value.slice(1, raw_value.length - 1);
          lexer.push(Factory.INLINE_CODE(body));
          break;

        case TOKEN.TOKEN_TYPE.CODE_BLOCK:
          const parts = raw_value.slice(3, raw_value.length - 3).split('\n');
          const lg = resolveLanguage(parts.shift() || '');
          body = parts.join('\n');
          lexer.push(Factory.CODE_BLOCK(body, lg));
          break;
        default:
          break;
      }

      lexer.bump(raw_value.length);

      return true;
    };
  }

  export function wrapperHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      let size = 1;
      let patterns: Pattern[] = [];

      switch (type) {
        case TOKEN.TOKEN_TYPE.BOLD:
          size = 2;
          patterns = PATTERNS.BOLD_NESTED_PATTERNS;
          break;

        case TOKEN.TOKEN_TYPE.ITALIC:
          size = 1;
          patterns = PATTERNS.ITALIC_NESTED_PATTERNS;
          break;
        case TOKEN.TOKEN_TYPE.STRIKETHROUGH:
          size = 2;
          patterns = PATTERNS.STRIKETHROUGH_NESTED_PATTER;
          break;

        case TOKEN.TOKEN_TYPE.HIGHLIGHT:
          size = 2;
          patterns = PATTERNS.STRIKETHROUGH_NESTED_PATTER;
          break;

        case TOKEN.TOKEN_TYPE.INLINE_CODE:
          size = 1;

          break;

        default:
          break;
      }

      // extract body
      const body = raw_value.slice(size, raw_value.length - size);
      const tokens: Token[] = [];
      let word = {
        word: '',
      };

      nestedSearch(patterns, body, type, tokens, word);

      lexer.push(new Token(type, word.word, tokens));
      lexer.bump(raw_value.length);

      return true;
    };
  }

  export function paragraphHandler(type: TOKEN.TOKEN_TYPE, key: string) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      // extract body
      const body = raw_value.slice(0, raw_value.length - 1);
      const tokens: Token[] = [];
      let word = {
        word: '',
      };
      const last_element = lexer.tokens[lexer.tokens.length - 1];

      nestedSearch(
        PATTERNS.PARAGRAPH_NESTED_PATTERNS,
        body,
        type,
        tokens,
        word,
      );

      if (last_element && last_element.type == TOKEN.TOKEN_TYPE.UL) {
        const list_token = lexer.tokens[lexer.tokens.length - 1] as ListToken;
        list_token.fuse(new Token(type, word.word, tokens));
      } else {
        lexer.push(new Token(type, word.word, tokens));
      }
      lexer.bump(raw_value.length);

      return true;
    };
  }

  export function headerHandler(type: TOKEN.TOKEN_TYPE, key: string) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      // extract body
      const body =
        raw_value[raw_value.length - 1] == '\n'
          ? raw_value.slice(key.length, raw_value.length - 1)
          : raw_value.slice(key.length);
      const tokens: Token[] = [];
      let word = {
        word: '',
      };

      nestedSearch(PATTERNS.HEADER_NESTED_PATTERNS, body, type, tokens, word);

      lexer.push(new Heading(type as TOKEN.HEADING_TYPE, word.word, tokens));
      lexer.bump(raw_value.length);

      return true;
    };
  }

  export function listHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      // extract body
      const len = lexer.tokens.length;
      let list: ListTokenBuilder;
      const last_element = lexer.tokens[len - 1];

      if (last_element.type == TOKEN.TOKEN_TYPE.UL) {
        const list_token = lexer.tokens[len - 1] as ListToken;
        const list = new ListTokenBuilder(list_token);
        for (const line of raw_value.split('\n')) {
          list.pushElement(line);
        }
      } else {
        list = new ListTokenBuilder();
        for (const line of raw_value.split('\n')) {
          list.pushElement(line);
        }

        lexer.push(list.token);
      }

      lexer.bump(raw_value.length);

      return true;
    };
  }

  export function nestedSearch(
    patterns: Pattern[],
    body: string,
    type: TOKEN.TOKEN_TYPE,
    tokens: Token[],
    options: {
      word: string;
    },
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
        tokens.push(Factory.WORD(word));
      }
      tokens.push(
        ...TOKENIZER.tokenize(body.slice(next_idx), {
          patterns: patterns,
        }),
      );
    } else {
      if (type != TOKEN.TOKEN_TYPE.WORD) tokens.push(Factory.WORD(body));
      else {
        options.word += body;
      }
    }
  }
}
