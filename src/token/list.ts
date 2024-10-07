import { TOKENIZER } from '../lexer/tokenizer';
import { Factory } from './factory';
import { Token, TOKEN } from './token';

export type LIST_TOKEN_TYPE =
  | TOKEN.TOKEN_TYPE.UL
  | TOKEN.TOKEN_TYPE.LI
  | TOKEN.TOKEN_TYPE.CHECK_BOX
  | TOKEN.TOKEN_TYPE.CHECK_BOX_UL;

export class ListToken extends Token {
  private _depth: number;
  private _last_modified_token: ListToken | null = null;
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

  get last_modified_token() {
    return this._last_modified_token;
  }

  #fuseParagraph(token: Token) {
    let node = this.children[this.children.length - 1];
    while (node && node.children.length > 1) {
      node = node.children[node.children.length - 1];
    }

    const n = token.children.length;

    let i = 0;
    for (; i < n; i++) {
      const child = token.children[i];
      if (!child || !node) break;
      if (child.type != TOKEN.TOKEN_TYPE.WORD) break;
      if (node.children[0]) node.children[0].appendWord(child);
    }

    for (; i < n; i++) {
      const child = token.children[i];
      if (!child || !node) break;
      node.children.push(child);
    }
  }

  setLastModified(token: ListToken) {
    this._last_modified_token = token;
  }

  fuse(token: Token) {
    if (token.type == TOKEN.TOKEN_TYPE.PARAGRAPH) {
      this.#fuseParagraph(token);
    }

    if (token.type == TOKEN.TOKEN_TYPE.WORD) {
      this.#fuseParagraph(token);
    }
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

class NestedList {
  private _stack: ListToken[] = [];
  private _token: ListToken;

  constructor(token: ListToken) {
    this._token = token;
    this._stack.push(token);
    if (token.last_modified_token) this._stack.push(token.last_modified_token);
  }

  pushElement(body: string, depth: number) {
    let node = this.#last;
    while (node && depth <= node.depth) {
      this._stack.pop();
      node = this.#last;
    }
    if (!node) return;
    const new_node = this.#getNestedNode(body, depth);
    node.pushToChildren(new_node);
    this._stack.push(new_node);
    this._token.setLastModified(node);
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

  constructor(token = new ListToken('', [], 0, TOKEN.TOKEN_TYPE.UL)) {
    this._token = token;
    this.list = new NestedList(this._token);
  }

  pushElement(raw_value: string) {
    if (raw_value == '') return;
    const [spaces, body] = raw_value.split('- ');
    let depth = (spaces ? spaces.length : 0) + 1;

    this.list.pushElement(body || '', depth);
  }

  get token() {
    return this.list.token;
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
