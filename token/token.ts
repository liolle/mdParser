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
    this._type = TOKEN.TOKEN_TYPE.UL;
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

  appendWord(token: Token) {
    if (
      this.type != TOKEN.TOKEN_TYPE.WORD ||
      token.type != TOKEN.TOKEN_TYPE.WORD
    )
      return;
    this._body += token.body;
  }

  equal(token: Token) {
    if (token.type != this.type) return false;
    if (token.body != this.body) return false;
    if (token.children.length != this.children.length) return false;

    for (let i = 0; i < this.children.length; i++) {
      if (!this.children[i].equal(token.children[i])) return false;
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

  compileToHTML(): HTMLElement {
    const element = document.createElement('div', {});
    for (const el of this.children) {
      element.appendChild(el.compileToHTML());
    }
    element.textContent = `${this.type} - TODO`;
    return element;
  }

  compileToHTMLString(indent: number = 0): string {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;

    if (this.type != TOKEN.TOKEN_TYPE.ROOT) {
      output += `<span>${this.type}TODO</span>`;
    } else {
      output += `<div id="root">`;
      output += '\n';
      for (const el of this.children) {
        output += el.compileToHTMLString(
          indent + TOKEN.TOKEN_DISPLAY_INDENTATION,
        );
        output += '\n';
      }

      output += `</div>`;
      output += '\n';
    }
    return output;
  }
}
