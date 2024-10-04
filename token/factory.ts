import { CodeToken, InlineCode, SUPPORTED_LANGUAGES } from './code';
import { DECORATION_TYPE, Decoration } from './decoration';
import { CheckBoxToken, ListToken } from './list';
import { NewLine } from './newline';
import { Paragraph } from './paragraph';
import { Token, TOKEN } from './token';
import { Word } from './word';

export class Factory {
  constructor() {}

  static NEW_LINE() {
    return new NewLine();
  }

  static WORD(body: string) {
    return new Word(body, []);
  }

  static WORD_GROUP(body: string, tokens: Token[]) {
    return new Word(body, tokens);
  }

  static LI(body: string, depth = 0) {
    return new ListToken('', [Factory.WORD(body)], depth, TOKEN.TOKEN_TYPE.LI);
  }

  static PARAGRAPH(tokens: Token[]) {
    return new Paragraph('', tokens);
  }

  static UL(tokens: Token[], depth = 0) {
    return new ListToken('', tokens, depth, TOKEN.TOKEN_TYPE.UL);
  }

  static ROOT(tokens: Token[]) {
    return new Token(TOKEN.TOKEN_TYPE.ROOT, '', tokens);
  }

  static CHECK_BOX_UL(checked: boolean, tokens: Token[], depth = 0) {
    return new CheckBoxToken(
      checked,
      TOKEN.TOKEN_TYPE.CHECK_BOX_UL,
      '',
      tokens,
      depth,
    );
  }

  static DECORATION(type: DECORATION_TYPE, body: string, tokens: Token[]) {
    return new Decoration(type, body, tokens);
  }

  static CHECK_BOX(checked: boolean, body: string, depth = 0) {
    return new CheckBoxToken(
      checked,
      TOKEN.TOKEN_TYPE.CHECK_BOX,
      '',
      [Factory.WORD(body)],
      depth,
    );
  }

  static INLINE_CODE(body: string) {
    return new InlineCode(body);
  }

  static CODE_BLOCK(body: string, language: SUPPORTED_LANGUAGES) {
    return new CodeToken(TOKEN.TOKEN_TYPE.CODE_BLOCK, body, language);
  }

  static ITALIC(tokens: Token[]) {
    return new Token(TOKEN.TOKEN_TYPE.ITALIC, '', tokens);
  }

  static ESCAPE(character: string) {
    return new Token(TOKEN.TOKEN_TYPE.ESCAPE, character.slice(0, 1), []);
  }
}
