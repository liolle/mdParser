import { MDToken, TOKEN } from './token';
import { ConsumedType, TOKENIZER } from './tokenizer';

export class Lexer {
  private processed = false;
  private tokens: MDToken[] = [];
  private offset = 0;
  private source: string;

  private tokenizers = [
    TOKENIZER.NewLine, //
    TOKENIZER.Heading,
    TOKENIZER.Stars,
    TOKENIZER.Strikethrough,
    TOKENIZER.Space,
    TOKENIZER.Word,
  ];
  constructor(source: string) {
    this.source = source;
  }

  /**
   *@throws Error
   * @returns MDToken[]
   */
  lex(): MDToken[] {
    if (!this.processed) {
      let data: ConsumedType | null;
      let looped = false;
      l1: while (this.offset < this.source.length && !looped) {
        let found = false;
        for (const tokenizer of this.tokenizers) {
          data = tokenizer.consume(this.source, this.offset);
          if (!data) continue;
          found = true;
          this.offset += data.consumed;
          this.tokens.push(data.token);
          break;
        }
        if (!found) looped = true;
      }

      this.processed = true;
      this.#group_words();
    }

    if (this.offset < this.source.length) {
      throw new Error(
        `Lexing stopped At: ${this.offset} => ${this.source.slice(
          this.offset,
          this.offset + 15,
        )}`,
      );
    }

    return this.tokens;
  }

  #group_words() {
    const arr: MDToken[] = [];
    let cur: TOKEN.Word | null = null;
    for (const token of this.tokens) {
      if (token.type == 'word') {
        if (!cur) {
          cur = {
            type: 'word',
            body: '',
          };
        }
        cur.body += token.body;
      } else {
        if (cur) {
          arr.push(cur);
          cur = null;
        }
        arr.push(token);
      }
    }
    this.tokens = arr;
  }
}
