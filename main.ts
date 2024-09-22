import { Lexer } from './lexer/lexer';
import { TOKEN } from './lexer/token';
import { TOKENIZER } from './lexer/tokenizer';

function main() {
  const source = `
### Paragraphs :

This is a **paragraph**.

This is another paragraph.

## Special character
&é"'(){}[]<>§è!çà-^¨$ù%´\`µ£=+~:/.

### Bold, italics, highlights :

**Bold**
****single star

### Headings :

# This is a heading 1

## This is a heading 2

### This is a heading 3

#### This is a heading 4
 
##### This is a heading 5

###### This is a heading 6

### Bold, italics, highlights :

**Bold** and **Bold**
*Italic* and *Italic*
~~Strikethrough~~ and ~Strikethrough~~~
text **Bold text and *nested italic* text**
***Bold and italic text*** and ***Bold and italic text***
`;

  const bold_ita_high = `
### Bold, italics, highlights :

**Bold** and **Bold**
*Italic* and *Italic*
~~Strikethrough~~ and ~Strikethrough~~~
text **Bold text and *nested italic* text**
***Bold and italic text*** and ***Bold and italic text***
`;

  const test_str = `# #bonjour
  # #bonsoir`;

  try {
    const tokens = TOKENIZER.tokenize(test_str);
    const AST = new TOKEN.Token(TOKEN.TOKEN_TYPE.ROOT, tokens);
    console.log(TOKEN.displayToken(AST));

    // for (const token of tokens) console.log(TOKEN.print(token));
  } catch (error) {
    console.log(error);
  }
}

main();
