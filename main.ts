import { readFileSync } from 'fs';
import { TOKEN } from './lexer/token';
import { TOKENIZER } from './lexer/tokenizer';
import { CONSTANT } from './__tests__/constants';

function main() {
  try {
    const root = TOKEN.Factory.ROOT(
      TOKENIZER.tokenize(
        String.raw`${readFileSync('example/sample2.md', 'utf-8')}`,
        // CONSTANT.BaseHeaders,
      ),
    );
    // console.log(root.print());

    console.log(root.compileToHTMLString());

    // console.log(String.raw`${readFileSync('example/sample2.md', 'utf-8')}`);
    // console.log(readFileSync('example/sample2.md', 'utf-8'));
    // console.log(
    //   CONSTANT.CodeBlock2.trim() ==
    //     String.raw`${readFileSync('example/sample2.md', 'utf-8')}`.trim(),
    // );

    // console.log(CONSTANT.CodeBlock2.split(''));
    // console.log(
    //   String.raw`${readFileSync('example/sample2.md', 'utf-8')}`.split(''),
    // );

    // console.log(
    //   TOKEN.Factory.ROOT(TOKENIZER.tokenize(CONSTANT.CodeBlock2)).print(),
    // );
  } catch (error) {
    console.log(error);
  }
}

main();
