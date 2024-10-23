import { Factory } from '../token/factory';
import { LINK_TOKEN_TYPE, LinkToken } from '../token/links';
import { ListToken, ListTokenBuilder } from '../token/list';
import { Heading, HEADING_TYPE, Token, TOKEN } from '../token/token';
import { NestedIdx } from '../types';
import { combineRages } from '../utils';
import { Lexer } from './lexer';
import { Pattern, PATTERNS } from './patterns';
import { TOKENIZER } from './tokenizer';

export namespace HANDLERS {
  export function defaultHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      lexer.push(Factory.WORD(raw_value));
      lexer.bump(raw_value.length);
      return true;
    };
  }

  export function newLineHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      const last_element = lexer.last_pushed_token;
      const n_line = Factory.NEW_LINE();

      switch (true) {
        case last_element instanceof ListToken:
          if (!last_element.is_out) {
            last_element.bumpNewlineCount();
          } else {
            lexer.push(n_line);
          }
          break;
        default:
          lexer.push(n_line);
          break;
      }

      lexer.bump(raw_value.length);
      lexer.bumpLine();
      return true;
    };
  }

  export function wordHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      const tokens: Token[] = [];
      let word = {
        word: '',
      };

      const last_pushed_token = lexer.last_pushed_token;
      nestedSearch(PATTERNS.WORD_NESTED_PATTER, raw_value, type, tokens, word);

      switch (true) {
        case last_pushed_token instanceof ListToken:
          if (last_pushed_token.is_out) {
            if (tokens.length > 0) {
              for (const t of tokens) {
                lexer.push(t);
              }
            } else {
              lexer.push(Factory.WORD(word.word));
            }
          } else {
            last_pushed_token.fuse(word.word, tokens);
          }
          break;
        default:
          if (tokens.length > 0) {
            for (const t of tokens) {
              lexer.push(t);
            }
          } else {
            lexer.push(Factory.WORD(word.word));
          }
          break;
      }

      lexer.bump(raw_value.length);
      return true;
    };
  }

  export function externalLinkHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      const tokens: Token[] = [];
      let offset = 1;
      if (raw_value[0] == '!') offset++;

      const trimmed_value = raw_value.trim();

      const name_array = trimmed_value.match(/(?<=\[).*(?=\])/g) as [string];
      const url_arr = trimmed_value.match(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)(?=\)| )/g,
      ) as [string];

      const [name, url] = [
        name_array ? name_array[0] : '',
        url_arr ? url_arr[url_arr.length - 1] : '',
      ];

      let next_idx = Infinity;

      for (const pattern of PATTERNS.EXTERNAL_LINK_NESTED_PATTER) {
        const exec_res = pattern.regex().exec(name || '');
        if (!exec_res) continue;
        next_idx = Math.min(next_idx, exec_res['index']);
      }

      if (next_idx != Infinity) {
        const word = name.slice(0, next_idx);
        if (word.length > 0) {
          tokens.push(Factory.WORD(name.slice(0, next_idx)));
        }

        tokens.push(
          ...TOKENIZER.tokenize(name ? name.slice(next_idx) : '', {
            patterns: PATTERNS.EXTERNAL_LINK_NESTED_PATTER,
          }),
        );
      } else if (name && name != '') {
        tokens.push(Factory.WORD(name));
      }

      let kind = offset == 2 ? LINK_TOKEN_TYPE.IMAGE : LINK_TOKEN_TYPE.DEFAULT;

      if (tokens[0] instanceof LinkToken) {
        lexer.push(Factory.NESTED_LINK_IMG(url || '', tokens[0]));
      } else {
        lexer.push(new LinkToken(url || '', tokens, kind));
      }

      lexer.bump(raw_value.length);
      return true;
    };
  }

  export function escapeHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      const body = raw_value.slice(1);

      lexer.push(new Token(type, body, []));
      lexer.bump(raw_value.length);
      return true;
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
          const lg = (parts.shift() || '').trim().toLowerCase();
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
          patterns = PATTERNS.HIGHLIGHT_NESTED_PATTER;
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
      const body = raw_value.trim().replace(/\n/g, '');
      const tokens: Token[] = [];
      let word = {
        word: '',
      };
      const last_element = lexer.last_token;

      nestedSearch(
        PATTERNS.PARAGRAPH_NESTED_PATTERNS,
        body,
        type,
        tokens,
        word,
      );

      switch (true) {
        case last_element instanceof ListToken:
          return false;
        default:
          lexer.push(new Token(type, word.word, tokens));
          break;
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

      lexer.push(new Heading(type as HEADING_TYPE, word.word, tokens));
      lexer.bump(raw_value.length);

      return true;
    };
  }

  export function listHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      // extract body

      let list: ListTokenBuilder;
      const last_element = lexer.last_pushed_token;
      switch (true) {
        case last_element instanceof ListToken:
          list = new ListTokenBuilder(last_element);
          for (const line of raw_value.split('\n')) {
            list.pushElement(line);
          }
          break;
        default:
          list = new ListTokenBuilder();
          for (const line of raw_value.split('\n')) {
            list.pushElement(line);
          }

          lexer.push(list.token);
          break;
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
    let idx_match: NestedIdx[] = [];

    for (const pattern of patterns) {
      const regex = pattern.regex();
      let match;

      while ((match = regex.exec(body))) {
        const n_body = match[0];
        idx_match.push({
          range: [match['index'], match['index'] + n_body.length - 1],
          type: pattern.type,
          text: n_body,
        });
      }
    }

    const nested_token = combineRages(idx_match, body);

    for (const token of nested_token) {
      if (token.type == TOKEN.TOKEN_TYPE.WORD) {
        tokens.push(Factory.WORD(token.text));
      } else {
        tokens.push(...TOKENIZER.tokenize(token.text));
      }
    }
  }
}
