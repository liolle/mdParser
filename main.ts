import { readFileSync } from 'fs';
import { TOKENIZER } from './lexer/tokenizer';
import { Factory } from './token/factory';

function main() {
  try {
    const root = Factory.ROOT(
      TOKENIZER.tokenize(
        String.raw`${readFileSync('example/sample2.md', 'utf-8')}`,
      ),
    );

    console.log(root.compileToHTMLString());
  } catch (error) {
    console.log(error);
  }
}

main();
