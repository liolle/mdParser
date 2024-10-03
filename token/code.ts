import { DECORATION_TYPE } from './decoration';
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

export class CodeToken extends Token {
  private _language: SUPPORTED_LANGUAGES;
  constructor(
    type: TOKEN.TOKEN_TYPE.INLINE_CODE | TOKEN.TOKEN_TYPE.CODE_BLOCK,
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

    if (this.type == TOKEN.TOKEN_TYPE.INLINE_CODE) {
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
