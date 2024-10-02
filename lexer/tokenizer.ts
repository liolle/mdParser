import { Lexer } from './lexer';
import { PATTERNS } from './patterns';
import { TOKEN } from './token';

export namespace TOKENIZER {
  export function tokenize(
    source: string,
    options = {
      patterns: PATTERNS.ALL_PATTERNS,
    },
  ) {
    const input = prepareInput(source);
    const lexer = new Lexer.Lexer(input);

    while (!lexer.eof()) {
      let found = false;
      for (const pattern of options.patterns) {
        const exec_res = pattern.regex().exec(lexer.remainder());

        if (!exec_res) continue;
        if (exec_res['index'] != 0) {
          continue;
        }

        // avoid processing Header marks that are not at the beginning of a line
        if (
          TOKEN.oneOf(
            pattern.type, //
            ...TOKEN.TOKEN_TYPE_HEADERS,
          ) &&
          !lexer.isFirstLineCharacter
        )
          continue;

        pattern.handler(lexer, pattern.regex(), exec_res[0]);
        found = true;
        break;
      }

      if (!found) {
        throw new Error(`Could not parse character > ${lexer.remainder()}`);
      }
    }

    return lexer.tokens;
  }

  export function prepareInput(source: string) {
    // remove carriage return
    return String.raw`${source.replace(/\r\n/g, '\n')}`;
  }
}
