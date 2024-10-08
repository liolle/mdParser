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
