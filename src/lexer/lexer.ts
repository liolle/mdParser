import { Factory } from '../token/factory';
import { TOKEN, Token } from '../token/token';

export namespace Lexer {
  export class Lexer {
    private _tokens: Token[] = [];
    private _last_token: Token | null = null;
    private _last_pushed_token: Token | null = null;
    private offset = 0;
    private source: string;
    private lines = 0;

    constructor(source: string) {
      this.source = source;
    }

    push(token: Token) {
      let t = token;
      switch (token.type) {
        case TOKEN.TOKEN_TYPE.WORD:
          t = Factory.WORD_GROUP(token.body, token.children);
          this._tokens.push(t);
          break;
        case TOKEN.TOKEN_TYPE.NEW_LINE:
          t = Factory.NEW_LINE();
          this._tokens.push(t);
          break;

        case TOKEN.TOKEN_TYPE.PARAGRAPH:
          t = Factory.PARAGRAPH(token.children);
          this._tokens.push(t);
          break;
        case TOKEN.TOKEN_TYPE.BOLD:
          t = Factory.DECORATION(
            TOKEN.TOKEN_TYPE.BOLD,
            token.body,
            token.children,
          );
          this._tokens.push(t);
          break;
        case TOKEN.TOKEN_TYPE.ITALIC:
          t = Factory.DECORATION(
            TOKEN.TOKEN_TYPE.ITALIC,
            token.body,
            token.children,
          );
          this._tokens.push(t);
          break;
        case TOKEN.TOKEN_TYPE.STRIKETHROUGH:
          t = Factory.DECORATION(
            TOKEN.TOKEN_TYPE.STRIKETHROUGH,
            token.body,
            token.children,
          );
          this._tokens.push(t);
          break;
        case TOKEN.TOKEN_TYPE.HIGHLIGHT:
          t = Factory.DECORATION(
            TOKEN.TOKEN_TYPE.HIGHLIGHT,
            token.body,
            token.children,
          );
          this._tokens.push(t);
          break;

        default:
          this._tokens.push(token);
          break;
      }
      this._last_pushed_token = t;
      this._last_token = t;
    }

    bump(len: number) {
      this.offset += len;
    }

    bumpLine() {
      this.lines++;
    }

    setLast(token: Token) {
      this._last_token = token;
    }

    remainder() {
      return this.source.slice(this.offset);
    }

    eof() {
      return this.source.length <= this.offset;
    }

    get last_token() {
      return this._last_token;
    }

    get last_pushed_token() {
      return this._last_pushed_token;
    }

    get tokens() {
      return this._tokens;
    }
    get isFirstLineCharacter() {
      return this.offset == 0 || this.source.charAt(this.offset - 1) == '\n';
    }
  }
}
