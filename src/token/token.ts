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
    OL = 'Ol',
    INPUT = 'Input',
    CHECK_BOX = 'CheckBox',
    CHECK_BOX_UL = 'CheckBoxUL',
    INLINE_CODE = 'InlineCode',
    CODE_BLOCK = 'CodeBlock',
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

  export const TOKEN_DISPLAY_INDENTATION = 4;

  export function oneOf(type: TOKEN_TYPE, ...types: TOKEN_TYPE[]) {
    for (const t of types) if (t == type) return true;
    return false;
  }
}

export class Token {
  private _type: TOKEN.TOKEN_TYPE;
  private _children: Token[];
  private _body: string;

  constructor(type: TOKEN.TOKEN_TYPE, body: string, children: Token[]) {
    this._type = type;
    this._children = children || [];
    this._body = body;
  }

  pushToChildren(token: Token) {
    this._children.push(token);
  }

  pushToChildrenWithType(token: Token, type: TOKEN.TOKEN_TYPE) {
    this._type = type;
    this._children.push(token);
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

  appendWord(token: Word) {
    if (this.type == TOKEN.TOKEN_TYPE.WORD) {
      this._body += token.body;
    }
  }

  equal(token: Token) {
    if (token.type != this.type) return false;
    if (token.body != this.body) return false;
    if (token.children.length != this.children.length) return false;

    for (let i = 0; i < this.children.length; i++) {
      const c1 = this.children[i];
      const c2 = token.children[i];
      if (!c1 && !c2) {
        continue;
      } else if (!c1 || !c2) {
        return false;
      } else {
        if (!c1.equal(c2)) return false;
      }
    }
    return true;
  }

  print(indent: number = 0): string {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}[${this.type}]: ${
      this.type != TOKEN.TOKEN_TYPE.NEW_LINE ? this.body : ''
    }`;

    for (const elem of this.children) {
      output += `\n${elem.print(indent + TOKEN.TOKEN_DISPLAY_INDENTATION)}`;
    }

    return output;
  }
}

export class Word extends Token {
  constructor(body: string, children: Token[]) {
    super(TOKEN.TOKEN_TYPE.WORD, body, children);
  }

  appendWord(token: Word) {
    super.appendWord(token);
  }
}
export class Paragraph extends Token {
  constructor(body: string, children: Token[]) {
    super(TOKEN.TOKEN_TYPE.PARAGRAPH, body, children);
  }
}

export class NewLine extends Token {
  constructor() {
    super(TOKEN.TOKEN_TYPE.NEW_LINE, '', []);
  }
}
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
}
