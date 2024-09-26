export namespace TOKEN {
  export enum TOKEN_TYPE {
    BOLD = 'Bold',
    ITALIC = 'Italic',
    STRIKETHROUGH = 'StrikeThrough',
    HIGHLIGHT = 'Highlight',
    H1 = 'H1',
    H2 = 'H2',
    H3 = 'H3',
    H4 = 'H4',
    H5 = 'H5',
    H6 = 'H6',
    NEW_LINE = 'New_line',
    SPACE = 'Space',
    TILDE = 'Tilde',
    WORD = 'Word',
    ROOT = 'Root',
    PARAGRAPH = 'Paragraph',
    ESCAPE = 'Escape',
    EXTERNAL_LINK = 'External_link',
    UL = 'Ul',
    LI = 'Li',
  }

  export const TOKEN_TYPE_HEADERS = [
    //
    TOKEN_TYPE.H1,
    TOKEN_TYPE.H2,
    TOKEN_TYPE.H3,
    TOKEN_TYPE.H4,
    TOKEN_TYPE.H5,
    TOKEN_TYPE.H6,
  ];

  const TOKEN_DISPLAY_INDENTATION = 4;

  export class Token {
    private _type: TOKEN_TYPE;
    private _children: Token[];
    private _body: string;

    constructor(type: TOKEN_TYPE, body: string, children: Token[]) {
      this._type = type;
      this._children = children || [];
      this._body = body;
    }

    get children() {
      return this._children;
    }

    get type() {
      return this._type;
    }

    get body() {
      return this._body;
    }

    print(indent: number = 0): string {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}[${this.type}]: ${this.body}`;

      for (const elem of this.children) {
        output += `\n${elem.print(indent + TOKEN_DISPLAY_INDENTATION)}`;
      }

      return output;
    }
  }

  export enum LINK_TOKEN_TYPE {
    DEFAULT = 'Default',
    IMAGE = 'Image',
  }
  export type LIST_TOKEN_TYPE = TOKEN.TOKEN_TYPE.UL | TOKEN.TOKEN_TYPE.LI;

  export class LinkToken extends Token {
    private _kind: LINK_TOKEN_TYPE;
    constructor(
      body: string,
      children: Token[],
      kind: LINK_TOKEN_TYPE = LINK_TOKEN_TYPE.DEFAULT,
    ) {
      super(TOKEN_TYPE.EXTERNAL_LINK, body, children || []);
      this._kind = kind;
    }

    get kind() {
      return this._kind;
    }

    get isNamed() {
      return super.children[0] != undefined;
    }

    get isUrlSet() {
      return super.body != undefined && super.body != '';
    }

    print(indent: number = 0) {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}[${this.type}]: ${super.body || ''}`;

      for (const elem of this.children) {
        output += `\n${elem.print(indent + TOKEN_DISPLAY_INDENTATION)}`;
      }

      return output;
    }
  }

  export class ListToken extends Token {
    private _kind: TOKEN_TYPE;
    constructor(
      body: string,
      children: Token[],
      kind: LIST_TOKEN_TYPE = TOKEN_TYPE.UL,
    ) {
      super(TOKEN_TYPE.EXTERNAL_LINK, body, children || []);
      this._kind = kind;
    }

    get kind() {
      return this._kind;
    }

    print(indent: number = 0) {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}[${this.type}]: ${super.body || ''}`;

      for (const elem of this.children) {
        if (typeof elem === 'string') {
        } else output += `\n${elem.print(indent + TOKEN_DISPLAY_INDENTATION)}`;
      }

      return output;
    }
  }

  // export function displayToken(token: Token, indent: number = 0): string {
  //   const indentation = ' '.repeat(indent);
  //   let output = `${indentation}[${token.type}]`;

  //   token.children.forEach(item => {
  //     if (typeof item === 'string') {
  //       output += `: ${item != '\n' ? item : ''}`;
  //     } else {
  //       output += `\n${displayToken(item, indent + TOKEN_DISPLAY_INDENTATION)}`;
  //     }
  //   });
  //   return output;
  // }

  export function tokenEquals(t1: Token, t2: Token) {
    if (t1.type != this.type) return false;

    if (t1.type == TOKEN_TYPE.WORD) return t1.children[0] == t2.children[0];

    for (let i = 0; i < t1.children.length; i++) {
      if (!tokenEquals(t1[i], t2[i])) return false;
    }
    return true;
  }

  export function oneOf(type: TOKEN_TYPE, ...types: TOKEN_TYPE[]) {
    for (const t of types) if (t == type) return true;
    return false;
  }
}
