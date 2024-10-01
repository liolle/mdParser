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
      this._type = TOKEN_TYPE.UL;
      this._children.push(token);
    }

    pushToChildrenWithType(token: Token, type: TOKEN_TYPE) {
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
      if (this.type != TOKEN_TYPE.WORD || token.type != TOKEN_TYPE.WORD) return;
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
  export type LIST_TOKEN_TYPE =
    | TOKEN.TOKEN_TYPE.UL
    | TOKEN.TOKEN_TYPE.LI
    | TOKEN.TOKEN_TYPE.CHECK_BOX
    | TOKEN.TOKEN_TYPE.CHECK_BOX_UL;

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

      const new_node = this.#getNestedNode(body, depth);

      node.pushToChildren(new_node);

      this._stack.push(new_node);
      this._token.setLastModified(node);
    }

    #getNestedNode(body: string, depth: number): ListToken {
      if (/\[[xX ]\] /.test(body)) {
        const parts = body.split(/\[[xX ]\] /);

        return Factory.CHECK_BOX(
          /[xX]/.test(body[1]),
          parts[parts.length - 1],
          depth,
        );
      }
      return Factory.LI(body, depth);
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

  export enum SUPPORTED_LANGUAGES {
    JS = 'Javascript',
    DEFAULT = '',
  }

  export function resolveLanguage(language: string): SUPPORTED_LANGUAGES {
    // js
    const candidate = language.trim().toLowerCase();

    if (/js|javascript/.test(candidate)) return SUPPORTED_LANGUAGES.JS;

    return SUPPORTED_LANGUAGES.DEFAULT;
  }

  export class CodeToken extends Token {
    private _language: SUPPORTED_LANGUAGES;
    constructor(
      type: TOKEN_TYPE.INLINE_CODE | TOKEN_TYPE.CODE_BLOCK,
      body: string,
      language = SUPPORTED_LANGUAGES.DEFAULT,
    ) {
      super(type, body.trim(), []);
      this._language = language;
    }

    equal(token: CodeToken): boolean {
      if (!(super.equal(token) && this.language == token.language)) {
        return false;
      }

      return this.body == token.body;
    }

    get language() {
      return this._language;
    }
  }

  export function oneOf(type: TOKEN_TYPE, ...types: TOKEN_TYPE[]) {
    for (const t of types) if (t == type) return true;
    return false;
  }

  export class CheckBoxToken extends ListToken {
    private _checked = false;

    constructor(
      checked: boolean,
      type: LIST_TOKEN_TYPE,
      body: string,
      children: Token[],
      depth = 0,
    ) {
      super('', children, depth, type);
      this._checked = checked;
    }

    get checked() {
      return this._checked;
    }

    toggle() {
      this._checked = !this._checked;
    }

    setChecked(val: boolean) {
      this._checked = val;
    }

    pushToChildren(token: Token) {
      const word = this.children.pop();

      if (word) {
        if (word.type == TOKEN_TYPE.WORD) {
          this.children.push(
            Factory.CHECK_BOX(this.checked, word.body, this.depth),
          );
          super.pushToChildrenWithType(token, TOKEN.TOKEN_TYPE.CHECK_BOX_UL);
        } else {
          this.children.push(word);
          super.pushToChildrenWithType(token, TOKEN.TOKEN_TYPE.CHECK_BOX_UL);
        }
      }
    }

    equal(token: CheckBoxToken): boolean {
      return super.equal(token) && this.checked == token.checked;
    }

    print(indent: number = 0) {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}[${super.type}]${this.checked}`;

      for (const elem of this.children) {
        output += `\n${elem.print(indent + TOKEN_DISPLAY_INDENTATION)}`;
      }
      return output;
    }
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

    static CHECK_BOX_UL(checked: boolean, tokens: Token[], depth = 0) {
      return new CheckBoxToken(
        checked,
        TOKEN_TYPE.CHECK_BOX_UL,
        '',
        tokens,
        depth,
      );
    }

    static CHECK_BOX(checked: boolean, body: string, depth = 0) {
      return new CheckBoxToken(
        checked,
        TOKEN_TYPE.CHECK_BOX,
        '',
        [Factory.WORD(body)],
        depth,
      );
    }

    static INLINE_CODE(body: string) {
      return new CodeToken(
        TOKEN_TYPE.INLINE_CODE,
        body,
        SUPPORTED_LANGUAGES.DEFAULT,
      );
    }

    static CODE_BLOCK(body: string, language: SUPPORTED_LANGUAGES) {
      return new CodeToken(TOKEN_TYPE.CODE_BLOCK, body, language);
    }

    // TODO
    // static WORD_GROUP(tokens: Token[]) {
    //   return new Token(TOKEN.TOKEN_TYPE.WORD, '', tokens);
    // }
  }
}
