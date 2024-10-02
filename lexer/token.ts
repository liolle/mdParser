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
      let output = `${indentation}[${this.type}]: ${
        this.type != TOKEN_TYPE.NEW_LINE ? this.body : ''
      }`;

      for (const elem of this.children) {
        output += `\n${elem.print(indent + TOKEN_DISPLAY_INDENTATION)}`;
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

      if (this.type != TOKEN_TYPE.ROOT) {
        output += `<span>${this.type}TODO</span>`;
      } else {
        output += `<div id="root">`;
        output += '\n';
        for (const el of this.children) {
          output += el.compileToHTMLString(indent + TOKEN_DISPLAY_INDENTATION);
          output += '\n';
        }

        output += `</div>`;
        output += '\n';
      }
      return output;
    }
  }

  export type HEADING_TYPE =
    | TOKEN_TYPE.H1
    | TOKEN_TYPE.H2
    | TOKEN_TYPE.H3
    | TOKEN_TYPE.H4
    | TOKEN_TYPE.H5
    | TOKEN_TYPE.H6;

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
        output += el.compileToHTMLString(indent + TOKEN_DISPLAY_INDENTATION);
        output += '\n';
      }
      output += indentation;
      output += `</${tag}>\n`;
      return output;
    }
  }

  export class Paragraph extends Token {
    constructor(body: string, children: Token[]) {
      super(TOKEN_TYPE.PARAGRAPH, body, children);
    }

    compileToHTMLString(indent: number = 0): string {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}`;

      output += `<p>\n`;
      for (const el of this.children) {
        output += el.compileToHTMLString(indent + TOKEN_DISPLAY_INDENTATION);
        output += '\n';
      }
      output += indentation;
      output += `</p>\n`;

      return output;
    }
  }

  export class Word extends Token {
    constructor(body: string, children: Token[]) {
      super(TOKEN_TYPE.WORD, body, children);
    }

    compileToHTMLString(indent: number = 0): string {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}`;

      if (this.children.length == 0) {
        output += `<span>${this.body}</span>`;
      } else {
        output += `<div>\n`;
        for (const el of this.children) {
          output += el.compileToHTMLString(indent + TOKEN_DISPLAY_INDENTATION);
          output += '\n';
        }
        output += `</div>\n`;
      }

      return output;
    }
  }

  export type DECORATION_TYPE =
    | TOKEN_TYPE.BOLD
    | TOKEN_TYPE.ITALIC
    | TOKEN_TYPE.HIGHLIGHT
    | TOKEN_TYPE.STRIKETHROUGH
    | TOKEN_TYPE.INLINE_CODE;

  export class Decoration extends Token {
    private _tag = 'span';
    constructor(type: DECORATION_TYPE, body: string, children: Token[]) {
      super(type, body, children);

      switch (type) {
        case TOKEN_TYPE.BOLD:
          this._tag = 'strong';
          break;
        case TOKEN_TYPE.ITALIC:
          this._tag = 'i';
          break;
        case TOKEN_TYPE.HIGHLIGHT:
          this._tag = 'span class="highlight"';
          break;
        case TOKEN_TYPE.STRIKETHROUGH:
          this._tag = 'strong';
          break;
        case TOKEN_TYPE.INLINE_CODE:
          this._tag = 'code';
          break;

        default:
          this._tag = 'span';
          break;
      }
    }

    get tag() {
      return this._tag;
    }

    compileToHTMLString(indent: number = 0): string {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}`;

      output += `<${this.tag}>\n`;
      for (const el of this.children) {
        output += el.compileToHTMLString(indent + TOKEN_DISPLAY_INDENTATION);
        output += '\n';
      }
      output += indentation;
      output += `</${this.tag}>\n`;

      return output;
    }
  }

  export class InlineCode extends Token {
    constructor(type: DECORATION_TYPE, body: string, children: Token[]) {
      super(type, body, children);
    }

    compileToHTMLString(indent: number = 0): string {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}`;

      console.log(this);

      output += `<code>${this.body}`;

      output += `</code>\n`;

      return output;
    }
  }

  export class NewLine extends Token {
    constructor() {
      super(TOKEN_TYPE.NEW_LINE, '', []);
    }

    compileToHTMLString(indent: number = 0): string {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}<div class="new_line"></div>`;
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
        output += `\n${elem.print(indent + TOKEN_DISPLAY_INDENTATION)}`;
      }

      return output;
    }

    compileToHTMLString(indent: number = 0): string {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}`;

      output += `<a href="${this.body}">`;
      if (this.kind == 'Image') {
        output += '\n';
        output += indentation + ' '.repeat(TOKEN_DISPLAY_INDENTATION);
        output += `<img src="${this.body}" width="200" style="object-fit: contain;">\n`;
        output += indentation + ' '.repeat(TOKEN_DISPLAY_INDENTATION);
        output += `</img>\n`;
        output += indentation;
      } else {
        output += `${this.name}`;
      }
      output += `</a>\n`;

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

    compileToHTMLString(indent: number = 0): string {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}`;

      if (this.type == TOKEN_TYPE.LI) {
        output += `<li>${this.children[0].body}</li>`;
      } else {
        output += `<ul>\n`;
        output += `${this.body}`;
        for (const elem of this.children) {
          output += `${elem.compileToHTMLString(
            indent + TOKEN_DISPLAY_INDENTATION,
          )}\n`;
        }
        output += indentation;
        output += `</ul>`;
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

    compileToHTMLString(indent: number = 0): string {
      const indentation = ' '.repeat(indent);
      let output = `${indentation}`;

      if (this.type == TOKEN_TYPE.INLINE_CODE) {
        output += `<code>${this.body}`;
        output += `</code>\n`;
      } else {
        output += `<div class="codeBlock">`;
        output += `${this.body}`;
        output += `</div>\n`;
      }

      return output;
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
      return new NewLine();
    }

    static WORD(body: string) {
      return new Word(body, []);
    }

    static WORD_GROUP(body: string, tokens: Token[]) {
      return new Word(body, tokens);
    }

    static LI(body: string, depth = 0) {
      return new ListToken(
        '',
        [Factory.WORD(body)],
        depth,
        TOKEN.TOKEN_TYPE.LI,
      );
    }

    static PARAGRAPH(tokens: Token[]) {
      return new Paragraph('', tokens);
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

    static DECORATION(type: DECORATION_TYPE, body: string, tokens: Token[]) {
      return new Decoration(type, body, tokens);
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

    static ITALIC(tokens: Token[]) {
      return new TOKEN.Token(TOKEN.TOKEN_TYPE.ITALIC, '', tokens);
    }

    static ESCAPE(character: string) {
      return new TOKEN.Token(
        TOKEN.TOKEN_TYPE.ESCAPE,
        character.slice(0, 1),
        [],
      );
    }
  }
}
