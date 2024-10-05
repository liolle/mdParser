import { readFileSync } from 'fs';
import { StringTokenCompiler } from './src/compiler/compiler';
import { MDAdapter } from './src/compiler/md';
import { TOKENIZER } from './src/lexer/tokenizer';
import { Factory } from './src/token/factory';

function main() {
  try {
    const root = Factory.ROOT(
      TOKENIZER.tokenize(
        String.raw`${readFileSync('example/sample2.md', 'utf-8')}`,
      ),
    );

    const compiler = new StringTokenCompiler(new MDAdapter());
    console.log(compiler.compile(root));
  } catch (error) {
    console.log(error);
  }
}

main();
