import { TOKENIZER } from '../lexer/tokenizer';
import { Factory } from './factory';
import { Token, TOKEN, Word } from './token';

export type LIST_TOKEN_TYPE =
  | TOKEN.TOKEN_TYPE.UL
  | TOKEN.TOKEN_TYPE.LI
  | TOKEN.TOKEN_TYPE.CHECK_BOX
  | TOKEN.TOKEN_TYPE.CHECK_BOX_UL;

export class ListToken extends Token {
  private _depth: number;
  private _last_modified_li: ListToken | null = null;
  private _last_modified_ul: ListToken | null = null;
  constructor(
    body: string,
    children: Token[],
    depth: number,
    kind: LIST_TOKEN_TYPE = TOKEN.TOKEN_TYPE.LI,
  ) {
    super(kind, body, children || []);
    this._depth = depth;
  }

  get depth() {
    return this._depth;
  }

  get last_modified_li() {
    return this._last_modified_li;
  }

  get last_modified_ul() {
    return this._last_modified_ul;
  }

  #fuseParagraph(body: string, tokens: Token[]) {
    let node = this.children[this.children.length - 1];
    while (node && node.children.length > 1) {
      node = node.children[node.children.length - 1];
    }
    let last_node = this.last_modified_li;

    if (!node || !last_node) {
      return;
    }

    const n = tokens.length;

    let i = 0;
    for (; i < n; i++) {
      const child = tokens[i];
      if (!child) break;
      if (child.type != TOKEN.TOKEN_TYPE.WORD) break;
      last_node.appendWord(child);
    }

    for (; i < n; i++) {
      const child = tokens[i];
      if (!child) break;
      node.children.push(child);
    }
  }

  appendWord(token: Word) {
    if (this.type == TOKEN.TOKEN_TYPE.LI) {
      const len = this.children.length;
      const last_child = this.children[len - 1];
      if (last_child) {
        last_child.appendWord(token);
      } else {
        this.children.push(token);
      }
    }
  }

  setLastModifiedLi(token: ListToken) {
    this._last_modified_li = token;
  }

  setLastModifiedUl(token: ListToken) {
    this._last_modified_ul = token;
  }

  fuse(body: string, token: Token[]) {
    this.#fuseParagraph(body, token);
  }

  print(indent: number = 0) {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}[${this.type}]`;

    for (const elem of this.children) {
      output += `\n${elem.print(indent + TOKEN.TOKEN_DISPLAY_INDENTATION)}`;
    }
    return output;
  }
}

export class ListTokenBuilder {
  private _token: ListToken;
  private _last_pushed: ListToken | null = null;
  private _tokens: ListToken[];
  private _depth = 0;

  constructor(token = new ListToken('', [], 0, TOKEN.TOKEN_TYPE.UL)) {
    this._token = token;
    this._tokens = [token];
    if (token.last_modified_ul) {
      this._tokens.push(token.last_modified_ul);
    }
    if (token.last_modified_li) {
      this._last_pushed = token.last_modified_li;
    }
  }

  pushElement(raw_value: string) {
    if (raw_value == '') return;
    const [spaces, body] = raw_value.split('- ');
    let depth = (spaces ? spaces.length : 0) + 1;
    this.pushEl(body || '', depth);
  }

  #getNestedNode(body: string, depth: number): ListToken {
    if (/\[[xX ]\] /.test(body)) {
      const parts = body.split(/\[[xX ]\] /);

      return Factory.CHECK_BOX(
        /[xX]/.test(body[1] || ''),
        parts[parts.length - 1] || '',
        depth,
      );
    }
    return Factory.LI('', TOKENIZER.tokenize(body), depth);
  }

  pushEl(body: string, depth: number) {
    const d = this._depth;
    const node = this.#findUl(depth);
    if (!node) {
      console.log(body, depth);
      return;
    }
    this._last_pushed = this.#getNestedNode(body, depth);
    node.pushToChildren(this._last_pushed);
    this._token.setLastModifiedUl(node);
    this._token.setLastModifiedLi(this._last_pushed);
  }

  #findUl(depth: number) {
    let last_ul = this.#last;
    let last_node = this._last_pushed;

    if (!last_ul) {
      return;
    }

    if (!last_node || depth == last_node.depth) {
      return last_ul;
    }

    if (depth > last_node.depth) {
      const ul = new ListToken('', [], depth, TOKEN.TOKEN_TYPE.UL);
      last_ul.pushToChildren(ul);
      this._tokens.push(ul);
      return ul;
    } else {
      while (last_ul && depth < last_ul.depth) {
        this._tokens.pop();
        last_ul = this.#last;
      }

      return last_ul;
    }
  }

  get #size() {
    return this._tokens.length;
  }

  get #last() {
    return this._tokens[this.#size - 1];
  }

  get token() {
    return this._token;
  }
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
      if (word.type == TOKEN.TOKEN_TYPE.WORD) {
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
      output += `\n${elem.print(indent + TOKEN.TOKEN_DISPLAY_INDENTATION)}`;
    }
    return output;
  }
}
