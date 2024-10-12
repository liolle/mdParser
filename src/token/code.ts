import { Token, TOKEN } from './token';

export enum SUPPORTED_LANGUAGES {
  JS = 'Javascript',
  DEFAULT = '',
}

type CODE_TOKEN_TYPE =
  | TOKEN.TOKEN_TYPE.INLINE_CODE
  | TOKEN.TOKEN_TYPE.CODE_BLOCK;

export class CodeToken extends Token {
  private _language: string;
  constructor(type: CODE_TOKEN_TYPE, body: string, language = '') {
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

export class InlineCode extends Token {
  constructor(body: string) {
    super(TOKEN.TOKEN_TYPE.INLINE_CODE, body, []);
  }
}
