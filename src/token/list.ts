import { TOKENIZER } from '../lexer/tokenizer';
import { Factory } from './factory';
import { Token, TOKEN, Word } from './token';

export type LIST_TOKEN_TYPE =
  | TOKEN.TOKEN_TYPE.UL
  | TOKEN.TOKEN_TYPE.LI
  | TOKEN.TOKEN_TYPE.OL
  | TOKEN.TOKEN_TYPE.CHECK_BOX
  | TOKEN.TOKEN_TYPE.CHECK_BOX_UL;

export abstract class ListToken extends Token {
  private _depth: number;
  private _last_modified_token: ListToken | null = null;
  private _last_modified_li: ListToken | null = null;
  private _new_line_count = 0;
  private MAX_NEW_LINE = 1;
  constructor(
    body: string,
    children: Token[],
    depth: number,
    kind: LIST_TOKEN_TYPE = TOKEN.TOKEN_TYPE.LI ,
  ) {
    super(kind, body, children || []);
    this._depth = depth;
  }

  get new_line_count() {
    return this._new_line_count;
  }

  bumpNewlineCount() {
    this._new_line_count++;
  }

  get is_out() {
    return this.new_line_count >= this.MAX_NEW_LINE;
  }

  resetLineCount() {
    this._new_line_count = 0;
  }

  get depth() {
    return this._depth;
  }

  get last_modified_token() {
    return this._last_modified_token;
  }

  get last_modified_li() {
    return this._last_modified_li;
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
    this._new_line_count--;
  }

  appendWord(token: Word) {}

  setLastModified(last: ListToken){
    this._last_modified_token = last; 
  }

  setLastModifiedLi(last: ListToken){
    this._last_modified_li = last; 
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

export class ULToken extends ListToken
{
  private constructor(text: string, children: Token[], depth: number, type: LIST_TOKEN_TYPE) {
    super(text, children, depth, type);
  }

  static createDefault(): ULToken {
    return new ULToken("", [], 0, TOKEN.TOKEN_TYPE.UL);
  }

  static createWithDepth(depth: number): ULToken {
    return new ULToken("", [], depth, TOKEN.TOKEN_TYPE.UL);
  }

  static createWithDepthTokens(depth: number,tokens: Token[]): ULToken {
    return new ULToken("", tokens, depth, TOKEN.TOKEN_TYPE.UL);
  }

}


export class OLToken extends ListToken
{
  private constructor(text: string, children: Token[], depth: number, type: LIST_TOKEN_TYPE) {
    super(text, children, depth, type);
  }

  static createDefault(): OLToken {
    return new OLToken("", [], 0, TOKEN.TOKEN_TYPE.OL);
  }

  static createWithDepth(depth: number): OLToken {
    return new OLToken("", [], depth, TOKEN.TOKEN_TYPE.OL);
  }


  static createWithDepthTokens(depth: number,tokens: Token[]): OLToken {
    return new OLToken("", tokens, depth, TOKEN.TOKEN_TYPE.OL);
  }

}

export class LIToken extends ListToken
{
  private constructor(text: string, children: Token[], depth: number, type: LIST_TOKEN_TYPE) {
    super(text, children, depth, type);
  }

  static createDefault(): LIToken {
    return new LIToken("", [], 0, TOKEN.TOKEN_TYPE.LI);
  }

  static createWithDepth(depth: number): LIToken {
    return new LIToken("", [], depth, TOKEN.TOKEN_TYPE.LI);
  }

    static createWithDepthTokens(depth: number,tokens: Token[]): LIToken {
    return new LIToken("", tokens, depth, TOKEN.TOKEN_TYPE.LI);
  }


  override appendWord(token: Word) {
    const len = this.children.length;
    const last_child = this.children[len - 1];
    if (last_child) {
      last_child.appendWord(token);
    } else {
      this.children.push(token);
    }
  }
}


export class ListTokenBuilder {
  private _token: ListToken;
  private _last_pushed: ListToken | null = null;
  private _tokens: ListToken[];

  constructor(token = ULToken.createDefault()) {
    this._token = token;
    this._tokens = [token];

    if (token.last_modified_token) {
      this._tokens.push(token.last_modified_token);
    }

    if (token.last_modified_li) {
      this._last_pushed = token.last_modified_li;
    }
  }

  pushElement(raw_value: string, type: LIST_TOKEN_TYPE) {
    if (raw_value == '') return;

    let parts = ["",""]
    if (type == TOKEN.TOKEN_TYPE.OL){
      let p = raw_value.split(/[0-9]*\. /);
      if (p.length>1){
        parts = p
      }else{
        parts[1]
      }
    }else {
      parts = raw_value.split('- ');
    }
    let [spaces,body] = parts
    let depth = (spaces ? spaces.length : 0) + 1;
    this.#pushEl(body || '', depth,type);
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

  #pushEl(body: string, depth: number,type:LIST_TOKEN_TYPE) {
    const node = this.#findGroup(depth,type);
    if (!node) {
      return;
    }
    this._last_pushed = this.#getNestedNode(body, depth);
    node.pushToChildren(this._last_pushed);
    this._token.setLastModified(node);
    this._token.setLastModifiedLi(this._last_pushed);
  }

  #findGroup(depth: number, type: LIST_TOKEN_TYPE) {
    const enum StateFlags {
      LIST_TYPE_CHANGED = 1 << 0,  // 1
      DEPTH_EQ          = 1 << 1,  // 2
      DEPTH_QT          = 1 << 2,  // 4
      DEPTH_ST          = 1 << 3,  // 8
      LAST_WAS_UL       = 1 << 4,  // 16
      LAST_WAS_OL       = 1 << 5,  // 32
      ELEM_IS_UL        = 1 << 6,  // 64
      ELEM_IS_OL        = 1 << 7   // 128
    }

    let last_group = this.#last;
    let last_node = this._last_pushed;
    let last_poped;

    if (!last_group) {return null}

   // Build state flags
    let state = 0;
    state |= type != last_group.type ? StateFlags.LIST_TYPE_CHANGED : 0;
    state |= depth == last_group.depth ? StateFlags.DEPTH_EQ : 0;
    state |= depth > last_group.depth ? StateFlags.DEPTH_QT : 0;
    state |= depth < last_group.depth ? StateFlags.DEPTH_ST : 0;
    state |= last_group instanceof ULToken ? StateFlags.LAST_WAS_UL : 0;
    state |= last_group instanceof OLToken ? StateFlags.LAST_WAS_OL : 0;
    state |= type == TOKEN.TOKEN_TYPE.UL ? StateFlags.ELEM_IS_UL : 0;
    state |= type == TOKEN.TOKEN_TYPE.OL ? StateFlags.ELEM_IS_OL : 0;


    // Helper function to create appropriate group
    const createGroup = (): ListToken => {
      switch (type) {
        case TOKEN.TOKEN_TYPE.UL:
          return ULToken.createWithDepth(depth);
        case TOKEN.TOKEN_TYPE.OL:
          return OLToken.createWithDepth(depth);
        default:
          throw new Error(`Unknown list token type: ${type}`);
      }
    };

    if (state != 84){
      console.log(state)

    }
    let group = last_group
    // Main logic using switch
    switch (state) {
      case StateFlags.ELEM_IS_UL | StateFlags.LAST_WAS_UL | StateFlags.DEPTH_QT:
        // Create a new nested group 
        //group=ULToken.createWithDepth(depth);
        group = last_group;
        break
      default:
        break
    }

    return group;


    /*
    if (is_list_type_change){
      last_poped = this._tokens.pop();
      last_group = this.#last;
    }

    if (!last_group) {
      return;
    }

    if(is_list_type_change){
      let group:ListToken = this.#CreateGroupWithDepth(depth,type);
      if(type == TOKEN.TOKEN_TYPE.UL){
        group=ULToken.createWithDepth(depth);
      }else{
        group=OLToken.createWithDepth(depth);
      }

      if (last_group.type == type && last_poped && last_poped.depth >= depth ){
        return last_group;
      }

      last_group.pushToChildren(group);
      this._tokens.push(group);
      return group;
    }

    if (!last_node || depth == last_node.depth) {
      return last_group;
    }

    if (depth > last_node.depth || type != last_group.type) {
      let group:ListToken;
      if(type == TOKEN.TOKEN_TYPE.UL){
        group=ULToken.createWithDepth(depth);
      }else{
        group=OLToken.createWithDepth(depth);
      }

      last_group.pushToChildren(group);
      this._tokens.push(group);
      return group;
    } else {

      while (last_group && depth < last_group.depth) {
        this._tokens.pop();
        last_group = this.#last;
      }

      return last_group;
    }
    */
    return null
  }

  #CreateGroupWithDepth(depth:number,type:LIST_TOKEN_TYPE = TOKEN.TOKEN_TYPE.UL):ListToken{
    let group:ListToken;
    if(type == TOKEN.TOKEN_TYPE.UL){
      group=ULToken.createWithDepth(depth);
    }else{
      group=OLToken.createWithDepth(depth);
    }
    return group;
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
