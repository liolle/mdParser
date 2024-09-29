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

    pushToChildren(token: Token) {
      if (this.type != TOKEN_TYPE.UL) this._type = TOKEN_TYPE.UL;
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
      if (this.type != TOKEN_TYPE.WORD || token.type != TOKEN_TYPE.WORD) return;
      this._body += token.body;
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
    private _depth: number;
    private _last_modified_token: ListToken;
    constructor(
      body: string,
      children: Token[],
      depth: number,
      kind: LIST_TOKEN_TYPE = TOKEN_TYPE.LI,
    ) {
      super(kind, body, children || []);
      this._depth = depth;
    }

    get depth() {
      return this._depth;
    }

    get last_modified_token() {
      return this._last_modified_token;
    }

    #fuseParagraph(token: Token) {
      let node = this.children[this.children.length - 1];
      while (node && node.children.length > 1) {
        node = node.children[node.children.length - 1];
      }

      const n = token.children.length;
      for (const t of token.children) {
      }
      let i = 0;
      for (; i < n; i++) {
        if (token.children[i].type != TOKEN_TYPE.WORD) break;
        node.children[0].appendWord(token.children[i]);
      }

      for (; i < n; i++) {
        node.children.push(token.children[i]);
      }
    }

    setLastModified(token: ListToken) {
      this._last_modified_token = token;
    }

    fuse(token: Token) {
      if (
        token.type != TOKEN_TYPE.UL &&
        token.type != TOKEN_TYPE.LI &&
        token.type != TOKEN_TYPE.PARAGRAPH
      ) {
        return;
      }

      if (token.type == TOKEN_TYPE.PARAGRAPH) {
        this.#fuseParagraph(token);
      }
    }

    print(indent: number = 0) {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}[${this.type}]`;

      for (const elem of this.children) {
        output += `\n${elem.print(indent + TOKEN_DISPLAY_INDENTATION)}`;
      }
      return output;
    }
  }

  class NestedList {
    private _stack: ListToken[] = [];
    private _token: ListToken;

    constructor(token: ListToken) {
      this._token = token;
      this._stack.push(token);
      if (token.last_modified_token)
        this._stack.push(token.last_modified_token);
    }

    pushElement(body: string, depth: number) {
      let node = this.#last;
      while (depth <= node.depth) {
        this._stack.pop();
        node = this.#last;
      }
      const new_node = new ListToken(
        '',
        [new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, body, [])],
        depth,
      );
      node.pushToChildren(new_node);
      this._stack.push(new_node);
      this._token.setLastModified(node);
    }

    get #size() {
      return this._stack.length;
    }

    get #last() {
      return this._stack[this.#size - 1];
    }

    get token() {
      return this._token;
    }
  }

  export class ListTokenBuilder {
    private list: NestedList;
    private _token: ListToken;

    constructor(token = new ListToken('', [], 0, TOKEN_TYPE.UL)) {
      this._token = token;
      this.list = new NestedList(this._token);
    }

    pushElement(raw_value: string) {
      // count depth
      if (raw_value == '') return;
      const [spaces, body] = raw_value.split('- ');
      let depth = (spaces ? spaces.length : 0) + 1;
      this.list.pushElement(body, depth);
    }

    get token() {
      return this.list.token;
    }
  }

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

  export class Factory {
    constructor() {}

    static NEW_LINE() {
      return new Token(TOKEN.TOKEN_TYPE.NEW_LINE, '', []);
    }

    static WORD(body: string) {
      return new Token(TOKEN.TOKEN_TYPE.WORD, body, []);
    }

    static LI(body: string, depth = 0) {
      return new ListToken(
        '',
        [Factory.WORD(body)],
        depth,
        TOKEN.TOKEN_TYPE.LI,
      );
    }

    static UL(tokens: Token[], depth = 0) {
      return new ListToken('', tokens, depth, TOKEN.TOKEN_TYPE.UL);
    }

    static ROOT(tokens: Token[]) {
      return new Token(TOKEN_TYPE.ROOT, '', tokens);
    }

    // TODO
    // static WORD_GROUP(tokens: Token[]) {
    //   return new Token(TOKEN.TOKEN_TYPE.WORD, '', tokens);
    // }
  }
}
