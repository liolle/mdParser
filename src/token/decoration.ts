import { TOKEN, Token } from './token';

export type DECORATION_TYPE =
  | TOKEN.TOKEN_TYPE.BOLD
  | TOKEN.TOKEN_TYPE.ITALIC
  | TOKEN.TOKEN_TYPE.HIGHLIGHT
  | TOKEN.TOKEN_TYPE.STRIKETHROUGH
  | TOKEN.TOKEN_TYPE.INLINE_CODE;

export class Decoration extends Token {
  private _tag = 'span';
  constructor(type: DECORATION_TYPE, body: string, children: Token[]) {
    super(type, body, children);

    switch (type) {
      case TOKEN.TOKEN_TYPE.BOLD:
        this._tag = 'strong';
        break;
      case TOKEN.TOKEN_TYPE.ITALIC:
        this._tag = 'i';
        break;
      case TOKEN.TOKEN_TYPE.HIGHLIGHT:
        this._tag = 'span class="highlight"';
        break;
      case TOKEN.TOKEN_TYPE.STRIKETHROUGH:
        this._tag = 's';
        break;

      case TOKEN.TOKEN_TYPE.INLINE_CODE:
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
}
