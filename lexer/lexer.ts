import { TOKEN } from './token';
import { TOKENIZER } from './tokenizer';

type Pattern = {
  regex: RegExp;
  type: TOKEN.TOKEN_TYPE;
  handler: (lexer: Lexer, regex: RegExp, raw_value: string) => void;
};

export class Lexer {
  private _tokens: TOKEN.Token[] = [];
  private offset = 0;
  private source: string;
  private lines = 0;

  private _patterns: Pattern[] = [
    //
    {
      regex: /^# [^\n]+/,
      handler: headerHandler(TOKEN.TOKEN_TYPE.H1, '# '),
      type: TOKEN.TOKEN_TYPE.H1,
    },
    {
      regex: /\n/,
      handler: defaultHandler(TOKEN.TOKEN_TYPE.NEW_LINE),
      type: TOKEN.TOKEN_TYPE.NEW_LINE,
    },
    {
      regex: / /,
      handler: defaultHandler(TOKEN.TOKEN_TYPE.SPACE),
      type: TOKEN.TOKEN_TYPE.SPACE,
    },
    {
      regex: /[^\n]+/,
      handler: defaultHandler(TOKEN.TOKEN_TYPE.WORD),
      type: TOKEN.TOKEN_TYPE.WORD,
    },
  ];

  constructor(source: string) {
    this.source = source;
  }

  push(token: TOKEN.Token) {
    this._tokens.push(token);
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

  //
  eof() {
    return this.source.length <= this.offset;
  }

  get tokens() {
    return this._tokens;
  }
  get isFirstLineCharacter() {
    return this.offset == 0 || this.source.charAt(this.offset - 1) == '\n';
  }

  get patterns() {
    return this._patterns;
  }

  #group_words() {}
}

function defaultHandler(type: TOKEN.TOKEN_TYPE) {
  return (lexer: Lexer, regex: RegExp, raw_value: string) => {
    lexer.push(new TOKEN.Token(type, [raw_value]));
    if (raw_value == '\n') lexer.bumpLine();

    lexer.bump(raw_value.length);
  };
}

function headerHandler(type: TOKEN.TOKEN_TYPE, key: string) {
  return (lexer: Lexer, regex: RegExp, raw_value: string) => {
    if (!lexer.isFirstLineCharacter) return false;

    // extract body
    const body = raw_value.slice(key.length);

    lexer.push(new TOKEN.Token(type, TOKENIZER.tokenize(body)));
    lexer.bump(raw_value.length);

    return true;
  };
}
