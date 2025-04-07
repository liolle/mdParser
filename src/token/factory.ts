import { CodeToken, InlineCode, SUPPORTED_LANGUAGES } from './code';
import { DECORATION_TYPE, Decoration } from './decoration';
import { LinkToken, LINK_TOKEN_TYPE } from './links';
import { CheckBoxToken, ListToken, LIToken, OLToken, ULToken } from './list';
import {
  Heading,
  HEADING_TYPE,
  NewLine,
  Paragraph,
  Token,
  TOKEN,
  Word,
} from './token';

export class Factory {
  constructor() {}

  static HEADING(body: string, size: number, tokens: Token[]) {
    if (tokens.length == 0) {
      return new Heading(
        (TOKEN.TOKEN_TYPE_HEADERS[size - 1] ||
          TOKEN.TOKEN_TYPE.H6) as HEADING_TYPE,
        '',
        [Factory.WORD(body)],
      );
    }
    return new Heading(
      (TOKEN.TOKEN_TYPE_HEADERS[size - 1] ||
        TOKEN.TOKEN_TYPE.H6) as HEADING_TYPE,
      '',
      tokens,
    );
  }

  static NEW_LINE() {
    return new NewLine();
  }

  static WORD(body: string) {
    return new Word(body, []);
  }

  static WORD_GROUP(body: string, tokens: Token[]) {
    return new Word(body, tokens);
  }

  static LI(body: string, tokens: Token[], depth = 0) {
    let t:Token[] =[];
    if (body != '') {
      t.push(Factory.WORD(body));
    }

    for (const token of tokens) {
      t.push(token);
    }

    return LIToken.createWithDepthTokens(depth,t );
  }

  static OL(tokens: Token[], depth = 0){
    return OLToken.createWithDepthTokens(depth,tokens );
  }

  static PARAGRAPH(tokens: Token[]) {
    return new Paragraph('', tokens);
  }

  static UL(tokens: Token[], depth = 0) {
    return ULToken.createWithDepthTokens(depth,tokens );
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

  static CODE_BLOCK(body: string, language: string) {
    return new CodeToken(TOKEN.TOKEN_TYPE.CODE_BLOCK, body, language);
  }

  static ITALIC(tokens: Token[]) {
    return new Token(TOKEN.TOKEN_TYPE.ITALIC, '', tokens);
  }

  static ESCAPE(character: string) {
    return new Token(TOKEN.TOKEN_TYPE.ESCAPE, character.slice(0, 1), []);
  }

  static IMAGE_LINK(link: string, name: string) {
    if (name != '') {
      return new LinkToken(link, [Factory.WORD(name)], LINK_TOKEN_TYPE.IMAGE);
    }
    return new LinkToken(link, [], LINK_TOKEN_TYPE.IMAGE);
  }

  static LINK(link: string, name: string, type = LINK_TOKEN_TYPE.DEFAULT) {
    if (name != '') {
      return new LinkToken(link, [Factory.WORD(name)], type);
    }
    return new LinkToken(link, [], LINK_TOKEN_TYPE.DEFAULT);
  }

  static NESTED_LINK_IMG(link: string, token: LinkToken) {
    return new LinkToken(link, [token], LINK_TOKEN_TYPE.NESTED_IMG);
  }
}
