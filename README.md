## mdParser

Generate an
[Abstract Syntax Tree ](https://en.wikipedia.org/wiki/Abstract_syntax_tree) from
a Markdown file, providing a structured representation that you can manipulate
or render in various formats such as HTML, plain text, or any custom output.

## Installation

```bash
npm install @edllx/md-parser
```

## Features

| Name           |          |              |          |
| -------------- | -------- | ------------ | -------- |
| Heading        | &#x2705; | Tables       | &#x274c; |
| Unordered list | &#x2705; | Ordered list | &#x274c; |
| Bold           | &#x2705; | Quotes       | &#x274c; |
| Italic         | &#x2705; | Unicode      | &#x274c; |
| Links          | &#x2705; |              |          |
| Inline code    | &#x2705; |              |          |
| Code block     | &#x2705; |              |          |

## Usage

```ts
import { Factory, tokenize, Token } from '@edllx/md-parser';

const tokens: Token[] = tokenize(`## Header2`);

const root: Token = Factory.ROOT(tokens);
```

### Create and adapter

Here is an
[example](https://github.com/liolle/mdPreviewer/blob/main/src/components/preview/mdadapter.tsx)

```ts
import {
  Token,
  TokenCompiler,
  Word,
  NewLine,
  Paragraph,
  LinkToken,
  Heading,
  ListToken,
  Decoration,
  InlineCode,
  CodeToken,
  CheckBoxToken,
} from '@edllx/md-parser';

import { JSXElement } from 'solid-js';

/**
    interface TokenCompiler<T> {
        compile: (token: Token) => T;
    }
**/

export class TokenToTsxAdapter implements TokenCompiler<JSXElement> {
  compile(token: Token) {
    return this.#recursiveCompile(token);
  }

  #recursiveCompile(token: Token): JSXElement {
    switch (true) {
      case token instanceof Word:
        return <span>TODO</span>;

      case token instanceof NewLine:
        return <span>TODO</span>;

      case token instanceof Paragraph:
        return <span>TODO</span>;

      case token instanceof LinkToken:
        return <span>TODO</span>;

      case token instanceof ListToken:
        return <span>TODO</span>;

      case token instanceof Heading:
        return <span>TODO</span>;

      case token instanceof Decoration:
        return <span>TODO</span>;

      case token instanceof InlineCode:
        return <span>TODO</span>;

      case token instanceof CodeToken:
        return <span>TODO</span>;

      default:
        return <span>TODO</span>;
    }
  }
}
```

### use the adapter

```ts
import { Factory, tokenize, Token } from '@edllx/md-parser';
import { JSXElement } from 'solid-js';
import { TokenToTsxAdapter } from 'path-to-adapter';

const compiler = new TokenToTsxAdapter();
const tokens: Token[] = tokenize(`## Header2`);
const root: Token = Factory.ROOT(tokens);
const component: JSXElement = compiler.compile(root);
```

[Demo](https://md-viewer.kodevly.com/)
