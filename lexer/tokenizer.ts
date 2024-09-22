import { Lexer } from './lexer';
import { TOKEN } from './token';

export namespace TOKENIZER {
  export function tokenize(source: string) {
    const lexer = new Lexer(source);

    while (!lexer.eof()) {
      let found = false;
      for (const pattern of lexer.patterns) {
        const exec_res = pattern.regex.exec(lexer.remainder());
        if (!exec_res || exec_res['index'] != 0) continue;

        // avoid processing Header marks that are not at the beginning of a line
        if (
          TOKEN.oneOf(pattern.type, ...TOKEN.TOKEN_TYPE_HEADERS) &&
          !lexer.isFirstLineCharacter
        )
          continue;

        pattern.handler(lexer, pattern.regex, exec_res[0]);
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
