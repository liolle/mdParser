import { Factory } from '../token/factory';
import { TOKEN, Token } from '../token/token';

export namespace Lexer {
  export class Lexer {
    private _tokens: Token[] = [];
    private offset = 0;
    private source: string;
    private lines = 0;

    constructor(source: string) {
      this.source = source;
    }

    push(token: Token) {
      switch (token.type) {
        case TOKEN.TOKEN_TYPE.WORD:
          this._tokens.push(Factory.WORD_GROUP(token.body, token.children));
          break;
        case TOKEN.TOKEN_TYPE.NEW_LINE:
          this._tokens.push(Factory.NEW_LINE());
          break;

        case TOKEN.TOKEN_TYPE.PARAGRAPH:
          this._tokens.push(Factory.PARAGRAPH(token.children));
          break;
        case TOKEN.TOKEN_TYPE.BOLD:
          this._tokens.push(
            Factory.DECORATION(
              TOKEN.TOKEN_TYPE.BOLD,
              token.body,
              token.children,
            ),
          );
          break;
        case TOKEN.TOKEN_TYPE.ITALIC:
          this._tokens.push(
            Factory.DECORATION(
              TOKEN.TOKEN_TYPE.ITALIC,
              token.body,
              token.children,
            ),
          );
          break;
        case TOKEN.TOKEN_TYPE.STRIKETHROUGH:
          this._tokens.push(
            Factory.DECORATION(
              TOKEN.TOKEN_TYPE.STRIKETHROUGH,
              token.body,
              token.children,
            ),
          );
          break;
        case TOKEN.TOKEN_TYPE.HIGHLIGHT:
          this._tokens.push(
            Factory.DECORATION(
              TOKEN.TOKEN_TYPE.HIGHLIGHT,
              token.body,
              token.children,
            ),
          );
          break;

        default:
          this._tokens.push(token);
          break;
      }
    }

    bump(len: number) {
      this.offset += len;
    }

    bumpLine() {
      this.lines++;
    }

    remainder() {
      return this.source.slice(this.offset);
    }

    eof() {
      return this.source.length <= this.offset;
    }

    get tokens() {
      return this._tokens;
    }
    get isFirstLineCharacter() {
      return this.offset == 0 || this.source.charAt(this.offset - 1) == '\n';
    }
  }
}
