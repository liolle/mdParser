import { TOKEN, Token } from './token';

export type HEADING_TYPE =
  | TOKEN.TOKEN_TYPE.H1
  | TOKEN.TOKEN_TYPE.H2
  | TOKEN.TOKEN_TYPE.H3
  | TOKEN.TOKEN_TYPE.H4
  | TOKEN.TOKEN_TYPE.H5
  | TOKEN.TOKEN_TYPE.H6;

export class Heading extends Token {
  constructor(type: HEADING_TYPE, body: string, children: Token[]) {
    super(type, body, children);
  }

  compileToHTML(): HTMLElement {
    const element = document.createElement('h1', {});
    for (const el of this.children) {
      element.appendChild(el.compileToHTML());
    }
    element.textContent = `${this.body}`;
    return element;
  }

  compileToHTMLString(indent: number = 0): string {
    const tag = this.type.toLowerCase();

    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;

    output += `<${tag}>\n`;
    for (const el of this.children) {
      output += el.compileToHTMLString(
        indent + TOKEN.TOKEN_DISPLAY_INDENTATION,
      );
      output += '\n';
    }
    output += indentation;
    output += `</${tag}>\n`;
    return output;
  }
}
