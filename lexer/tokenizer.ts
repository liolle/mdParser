import { Lexer } from './lexer';
import { TOKEN } from './token';

export namespace TOKENIZER {
  export function tokenize(
    source: string,
    options = {
      patterns: Lexer.ALL_PATTERNS,
    },
  ) {
    const lexer = new Lexer.Lexer(source);

    let idx = Infinity;
    while (!lexer.eof()) {
      let found = false;
      for (const pattern of options.patterns) {
        const exec_res = pattern.regex().exec(lexer.remainder());
        // console.log(exec_res, pattern.regex, lexer.remainder());

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

        pattern.handler(lexer, pattern.regex(), exec_res[0], idx);
        found = true;
        break;
      }

      if (!found) {
        throw new Error(`Could not parse character > ${lexer.remainder()}`);
      }
    }

    return lexer.tokens;
  }
}
