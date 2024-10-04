import { Token, TOKEN } from './token';

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

type CODE_TOKEN_TYPE =
  | TOKEN.TOKEN_TYPE.INLINE_CODE
  | TOKEN.TOKEN_TYPE.CODE_BLOCK;

export class CodeToken extends Token {
  private _language: SUPPORTED_LANGUAGES;
  constructor(
    type: CODE_TOKEN_TYPE,
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

export class InlineCode extends Token {
  constructor(body: string) {
    super(TOKEN.TOKEN_TYPE.INLINE_CODE, body, []);
  }
}
