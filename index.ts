import { TOKENIZER } from './lexer/tokenizer';

export function tokenize(source: string) {
  return TOKENIZER.tokenize(source);
}
