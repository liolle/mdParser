import { readFileSync } from 'fs';
import { TOKENIZER } from './lexer/tokenizer';
import { Factory } from './token/factory';
import { TokenCompiler } from './compiler/compiler';
import { MDAdapter } from './compiler/md';

function main() {
  try {
    const root = Factory.ROOT(
      TOKENIZER.tokenize(
        String.raw`${readFileSync('example/sample2.md', 'utf-8')}`,
      ),
    );

    const compiler = new TokenCompiler(new MDAdapter());

    console.log(compiler.compile(root));
  } catch (error) {
    console.log(error);
  }
}

main();
