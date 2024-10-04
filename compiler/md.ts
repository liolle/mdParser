import { CodeToken, InlineCode } from '../token/code';
import { Decoration } from '../token/decoration';
import { LinkToken } from '../token/links';
import { ListToken } from '../token/list';
import {
  Heading,
  NewLine,
  Paragraph,
  TOKEN,
  Token,
  Word,
} from '../token/token';
import { Adapter } from './compiler';

export class MDAdapter implements Adapter<Token> {
  private BASE_INDENT = 4;
  compile(token: Token) {
    return this.#recursiveCompile(token, 0);
  }

  #recursiveCompile(token: Token, indent = 0): string {
    let output = '';

    switch (true) {
      case token instanceof Word:
        output += this.#word(token, indent);
        break;
      case token instanceof NewLine:
        output += this.#newLine(indent);
        break;
      case token instanceof Paragraph:
        output += this.#paragraph(token, indent);
        break;
      case token instanceof LinkToken:
        output += this.#links(token, indent);
        break;
      case token instanceof ListToken:
        output += this.#lists(token, indent);
        break;
      case token instanceof Heading:
        output += this.#heading(token, indent);
        break;

      case token instanceof Decoration:
        output += this.#decoration(token, indent);
        break;
      case token instanceof InlineCode:
        output += this.#inlineCode(token, indent);
        break;

      case token instanceof CodeToken:
        output += this.#codeBlock(token, indent);
        break;

      default:
        output += this.#defaultToken(token, indent);
        break;
    }

    return output;
  }

  #defaultToken(token: Token, indent = 0) {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;

    if (token.type != TOKEN.TOKEN_TYPE.ROOT) {
      output += `<span>${token.type}TODO</span>`;
    } else {
      output += `<div id="root">`;
      output += '\n';
      for (const el of token.children) {
        output += this.#recursiveCompile(el, indent + this.BASE_INDENT);
        output += '\n';
      }

      output += `</div>`;
      output += '\n';
    }
    return output;
  }

  #newLine(indent = 0) {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}<div class="new_line"></div>`;
    return output;
  }

  #word(token: Word, indent = 0) {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;
    output += `<span>`;
    if (token.children.length == 0) {
      output += `${token.body}`;
    } else {
      output += `\n`;
      for (const el of token.children) {
        output += this.#recursiveCompile(el, indent + this.BASE_INDENT);
        output += '\n';
      }
    }
    output += `</span>`;
    return output;
  }

  #paragraph(token: Paragraph, indent = 0) {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;

    output += `<p>\n`;
    for (const el of token.children) {
      output += this.#recursiveCompile(el, indent + this.BASE_INDENT);
      output += '\n';
    }
    output += indentation;
    output += `</p>\n`;

    return output;
  }

  #links(token: LinkToken, indent = 0) {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;

    output += `<a href="${token.body}">`;
    if (token.kind == 'Image') {
      output += '\n';
      output += indentation + ' '.repeat(this.BASE_INDENT);
      output += `<img src="${token.body}" width="200" style="object-fit: contain;">\n`;
      output += indentation + ' '.repeat(this.BASE_INDENT);
      output += `</img>\n`;
      output += indentation;
    } else {
      output += `${token.name}`;
    }
    output += `</a>\n`;

    return output;
  }

  #lists(token: ListToken, indent = 0) {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;

    if (token.type == TOKEN.TOKEN_TYPE.LI) {
      output += `<li>`;
      output += this.#recursiveCompile(token.children[0], 0);
      output += `</li>`;
    } else {
      output += `<ul>\n`;
      output += `${token.body}`;
      for (const el of token.children) {
        output += this.#recursiveCompile(el, indent + this.BASE_INDENT);
        output += '\n';
      }
      output += indentation;
      output += `</ul>`;
    }

    return output;
  }

  #heading(token: Heading, indent = 0) {
    const tag = token.type.toLowerCase();

    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;

    output += `<${tag}>\n`;
    for (const el of token.children) {
      output += this.#recursiveCompile(el, indent + this.BASE_INDENT);
      output += '\n';
    }
    output += indentation;
    output += `</${tag}>`;
    return output;
  }

  #decoration(token: Decoration, indent = 0) {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;

    output += `<${token.tag}>\n`;
    for (const el of token.children) {
      output += this.#recursiveCompile(el, indent + this.BASE_INDENT);
      output += '\n';
    }
    output += indentation;
    output += `</${token.tag}>`;

    return output;
  }

  #inlineCode(token: InlineCode, indent = 0) {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;
    output += `<code>`;
    output += token.body;
    output += `</code>`;
    return output;
  }

  #codeBlock(token: CodeToken, indent = 0) {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}`;
    output += `<div class="codeBlock">\n`;
    const parts = token.body.split('\n');
    for (const part of parts) {
      output += indentation + ' '.repeat(this.BASE_INDENT);
      output += part;
      output += '\n';
    }
    output += indentation;
    output += `</div>`;
    return output;
  }
}
