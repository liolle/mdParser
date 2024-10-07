import { TOKENIZER } from './lexer/tokenizer';
export { TOKEN } from './token/token';

export function tokenize(source: string) {
  return TOKENIZER.tokenize(source);
}

export * from './compiler/compiler';
export * from './compiler/md';
export * from './token/factory';
