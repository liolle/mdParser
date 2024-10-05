import { TOKENIZER } from './lexer/tokenizer';

export function tokenize(source: string) {
  return TOKENIZER.tokenize(source);
}

export * from './compiler/compiler';
export * from './compiler/md';
