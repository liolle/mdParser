import { TOKEN, Token } from './token';

export enum LINK_TOKEN_TYPE {
  DEFAULT = 'Default',
  IMAGE = 'Image',
}

export class LinkToken extends Token {
  private _kind: LINK_TOKEN_TYPE;
  constructor(
    body: string,
    children: Token[],
    kind: LINK_TOKEN_TYPE = LINK_TOKEN_TYPE.DEFAULT,
  ) {
    super(TOKEN.TOKEN_TYPE.EXTERNAL_LINK, body, children);
    this._kind = kind;
  }

  get kind() {
    return this._kind;
  }

  get isNamed() {
    return super.children[0] != undefined;
  }

  get name() {
    return this.children[0].body;
  }

  get isUrlSet() {
    return super.body != undefined && super.body != '';
  }

  print(indent: number = 0) {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}[${this.type}]: ${super.body || ''}`;

    for (const elem of this.children) {
      output += `\n${elem.print(indent + TOKEN.TOKEN_DISPLAY_INDENTATION)}`;
    }

    return output;
  }

  compileToHTMLString(indent: number = 0): string {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;

    output += `<a href="${this.body}">`;
    if (this.kind == 'Image') {
      output += '\n';
      output += indentation + ' '.repeat(TOKEN.TOKEN_DISPLAY_INDENTATION);
      output += `<img src="${this.body}" width="200" style="object-fit: contain;">\n`;
      output += indentation + ' '.repeat(TOKEN.TOKEN_DISPLAY_INDENTATION);
      output += `</img>\n`;
      output += indentation;
    } else {
      output += `${this.name}`;
    }
    output += `</a>\n`;

    return output;
  }
}
