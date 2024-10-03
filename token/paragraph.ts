import { TOKEN, Token } from './token';

export class Paragraph extends Token {
  constructor(body: string, children: Token[]) {
    super(TOKEN.TOKEN_TYPE.PARAGRAPH, body, children);
  }

  compileToHTMLString(indent: number = 0): string {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;

    output += `<p>\n`;
    for (const el of this.children) {
      output += el.compileToHTMLString(
        indent + TOKEN.TOKEN_DISPLAY_INDENTATION,
      );
      output += '\n';
    }
    output += indentation;
    output += `</p>\n`;

    return output;
  }
}
