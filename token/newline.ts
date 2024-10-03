import { Token, TOKEN } from './token';

export class NewLine extends Token {
  constructor() {
    super(TOKEN.TOKEN_TYPE.NEW_LINE, '', []);
  }

  compileToHTMLString(indent: number = 0): string {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}<div class="new_line"></div>`;
    return output;
  }
}
