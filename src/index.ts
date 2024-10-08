import { TOKENIZER } from './lexer/tokenizer';
export { TOKEN, Token } from './token/token';

export function tokenize(source: string) {
  return TOKENIZER.tokenize(source);
}

export {
  Adapter,
  TokenCompiler,
  StringTokenCompiler,
} from './compiler/compiler';
export { MDAdapter } from './compiler/md';
export { Factory } from './token/factory';
export { Word, Paragraph, NewLine, Heading } from './token/token';
export { ListToken, CheckBoxToken, LIST_TOKEN_TYPE } from './token/list';
export { LINK_TOKEN_TYPE, LinkToken } from './token/links';
export { Decoration } from './token/decoration';
export { SUPPORTED_LANGUAGES, CodeToken, InlineCode } from './token/code';
