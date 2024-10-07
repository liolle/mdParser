import { resolveLanguage } from '../token/code';
import { Factory } from '../token/factory';
import { LinkToken, LINK_TOKEN_TYPE } from '../token/links';
import { ListToken, ListTokenBuilder } from '../token/list';
import { Heading, HEADING_TYPE, Token, TOKEN, Word } from '../token/token';
import { Lexer } from './lexer';
import { Pattern, PATTERNS } from './patterns';
import { TOKENIZER } from './tokenizer';

export namespace HANDLERS {
  export function defaultHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      lexer.push(Factory.WORD(raw_value));
      lexer.bump(raw_value.length);
    };
  }

  export function newLineHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      const last_element = lexer.tokens[lexer.tokens.length - 1];
      if (!(last_element && last_element.type == TOKEN.TOKEN_TYPE.UL)) {
        lexer.push(Factory.NEW_LINE());
      }
      lexer.bump(raw_value.length);
      lexer.bumpLine();
    };
  }

  export function wordHandler(type: TOKEN.TOKEN_TYPE) {
    return (lexer: Lexer.Lexer, regex: RegExp, raw_value: string) => {
      const tokens: Token[] = [];
      let word = {
        word: '',
      };

      const last_element = lexer.tokens[lexer.tokens.length - 1];

      nestedSearch(PATTERNS.WORD_NESTED_PATTER, raw_value, type, tokens, word);

      if (last_element && last_element.type == TOKEN.TOKEN_TYPE.UL) {
        const list_token = lexer.tokens[lexer.tokens.length - 1] as ListToken;
        list_token.fuse(new Token(type, word.word, tokens));
      } else {
        if (tokens.length > 0) {
          for (const t of tokens) {
            lexer.push(t);
          }
        } else {
          lexer.push(Factory.WORD(word.word));
        }
      }

      lexer.bump(raw_value.length);
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
        url_arr ? url_arr[0] : '',
      ];

      let next_idx = Infinity;

      for (const pattern of PATTERNS.EXTERNAL_LINK_NESTED_PATTER) {
        const exec_res = pattern.regex().exec(name || '');
        if (!exec_res) continue;
        if (
          exec_res['index'] != 0 ||
          (pattern.type != type && pattern.type != TOKEN.TOKEN_TYPE.WORD)
        ) {
          next_idx = Math.min(next_idx, exec_res['index']);
        }
      }

      if (next_idx != Infinity) {
        const word = name ? name.slice(0, next_idx) : '';
        if (word.length > 0) {
          tokens.push(new Token(TOKEN.TOKEN_TYPE.WORD, word, []));
        }
        tokens.push(
          ...TOKENIZER.tokenize(name ? name.slice(next_idx) : '', {
            patterns: PATTERNS.EXTERNAL_LINK_NESTED_PATTER,
          }),
        );
      } else if (name && name != '') {
        tokens.push(new Token(TOKEN.TOKEN_TYPE.WORD, name, []));
      }

      lexer.push(
        new LinkToken(
          url || '',
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
      const body = raw_value.trim().replace(/\n/g, '');
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

      lexer.push(new Heading(type as HEADING_TYPE, word.word, tokens));
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

      if (last_element && last_element.type == TOKEN.TOKEN_TYPE.UL) {
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
    let idx_match: NestedIdx[] = [];
    const remainder = body.slice(0);
    for (const pattern of patterns) {
      const regex = pattern.regex();
      let match;

      while ((match = regex.exec(remainder))) {
        const n_body = match[0];
        idx_match.push({
          range: [match['index'], match['index'] + n_body.length - 1],
          type: pattern.type,
          text: n_body,
        });
      }
    }

    const nested_token = spitNestedToken(idx_match, body);

    for (const token of nested_token) {
      if (token.type == TOKEN.TOKEN_TYPE.WORD) {
        tokens.push(Factory.WORD(token.text));
      } else {
        tokens.push(...TOKENIZER.tokenize(token.text));
      }
    }
  }
}

type NestedIdx = {
  range: [number, number];
  type: TOKEN.TOKEN_TYPE;
  text: string;
};

function spitNestedToken(ranges: NestedIdx[], body: string) {
  const res: NestedIdx[] = [];
  const n = ranges.length;
  ranges.sort((a, b) => (a.range[0] || 0) - (b.range[0] || 0));

  for (let i = 0, idx = 0; i < n; i++) {
    const cur = ranges[i] as NestedIdx;
    const last = res.pop();
    if (!last) {
      res.push(cur);
    } else if (last.type == TOKEN.TOKEN_TYPE.WORD) {
      last.text = last.text.slice(last.range[0], cur.range[0]);
      last.range[1] = cur.range[0] - 1;
      res.push(last);
      res.push(cur);
    } else {
      if (last.range[1] < cur.range[0]) {
        res.push(last);
        const mid = [last.range[1] + 1, cur.range[0] - 1] as [number, number];
        if (mid[1] >= mid[0]) {
          res.push({
            range: mid,
            text: body.slice(mid[0], mid[1] + 1),
            type: TOKEN.TOKEN_TYPE.WORD,
          });
        }
        res.push(cur);
      } else {
        res.push(last);
        const right = [
          last.range[1] + 1,
          Math.max(last.range[1], cur.range[1]),
        ] as [number, number];

        if (right[1] >= right[0]) {
          res.push({
            range: right,
            text: body.slice(right[0], right[1] + 1),
            type: cur.type,
          });
        }
      }
    }
  }

  const last = res.pop();
  const len = body.length;

  if (last) {
    res.push(last);
    if (last.range[1] < len - 1) {
      res.push({
        range: [last.range[1] + 1, len - 1],
        text: body.slice(last.range[1] + 1),
        type: TOKEN.TOKEN_TYPE.WORD,
      });
    }
  }
  return res;
}
