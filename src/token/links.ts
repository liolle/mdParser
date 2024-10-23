import { TOKEN, Token } from './token';

export enum LINK_TOKEN_TYPE {
  DEFAULT = 'Default',
  NESTED_IMG = 'Nested_img',
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
    const token = this.children[0];
    return token ? token.body : '';
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
}
