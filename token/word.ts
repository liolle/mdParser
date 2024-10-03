import { TOKEN, Token } from './token';

export class Word extends Token {
  constructor(body: string, children: Token[]) {
    super(TOKEN.TOKEN_TYPE.WORD, body, children);
  }

  compileToHTMLString(indent: number = 0): string {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;

    if (this.children.length == 0) {
      output += `<span>${this.body}</span>`;
    } else {
      output += `<div>\n`;
      for (const el of this.children) {
        output += el.compileToHTMLString(
          indent + TOKEN.TOKEN_DISPLAY_INDENTATION,
        );
        output += '\n';
      }
      output += `</div>\n`;
    }

    return output;
  }
}
