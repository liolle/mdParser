import { describe, expect, onTestFailed, suite, test } from 'vitest';
import { TOKENIZER } from '../src/lexer/tokenizer';
import { SUPPORTED_LANGUAGES } from '../src/token/code';
import { Factory } from '../src/token/factory';
import { TOKEN } from '../src/token/token';
import { CONSTANT } from './constants';

describe('Parsing', () => {
  suite('Base case', () => {
    test('H1', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize('# This is a heading 1'));
      const expected = Factory.ROOT([
        Factory.HEADING('This is a heading 1', 1, []),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });
    test('H6', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize('###### This is a heading 6'),
      );
      const expected = Factory.ROOT([
        Factory.HEADING('This is a heading 6', 6, []),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('H1...H6', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.BaseHeaders));

      const expected = Factory.ROOT([
        Factory.HEADING('This is a heading 1', 1, []),
        Factory.HEADING('This is a heading 2', 2, []),
        Factory.HEADING('This is a heading 3', 3, []),
        Factory.HEADING('This is a heading 4', 4, []),
        Factory.HEADING('This is a heading 5', 5, []),
        Factory.HEADING('This is a heading 6', 6, []),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Bold', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize('**Bold**'));
      const expected = Factory.ROOT([
        Factory.DECORATION(TOKEN.TOKEN_TYPE.BOLD, '', [Factory.WORD('Bold')]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Italic', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize('_Italic_'));
      const expected = Factory.ROOT([
        Factory.DECORATION(TOKEN.TOKEN_TYPE.ITALIC, '', [
          Factory.WORD('Italic'),
        ]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Mixed decoration in word', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize(
          'This is _italics_, this is **bold**, and this is ~~strikethrough~~.',
        ),
      );

      const expected = Factory.ROOT([
        Factory.WORD('This is '),
        Factory.DECORATION(TOKEN.TOKEN_TYPE.ITALIC, '', [
          Factory.WORD('italics'),
        ]),
        Factory.WORD(', this is '),
        Factory.DECORATION(TOKEN.TOKEN_TYPE.BOLD, '', [Factory.WORD('bold')]),
        Factory.WORD(', and this is '),
        Factory.DECORATION(TOKEN.TOKEN_TYPE.STRIKETHROUGH, '', [
          Factory.WORD('strikethrough'),
        ]),
        Factory.WORD('.'),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Multiple bold', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize(
          'This is _italics_, this is **first bold**, and this is **second bold** end',
        ),
      );

      const expected = Factory.ROOT([
        Factory.WORD('This is '),
        Factory.DECORATION(TOKEN.TOKEN_TYPE.ITALIC, '', [
          Factory.WORD('italics'),
        ]),
        Factory.WORD(', this is '),
        Factory.DECORATION(TOKEN.TOKEN_TYPE.BOLD, '', [
          Factory.WORD('first bold'),
        ]),
        Factory.WORD(', and this is '),
        Factory.DECORATION(TOKEN.TOKEN_TYPE.BOLD, '', [
          Factory.WORD('second bold'),
        ]),
        Factory.WORD(' end'),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('StrikeThrough', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize('~~Strikethrough~~'));
      const expected = Factory.ROOT([
        Factory.DECORATION(TOKEN.TOKEN_TYPE.STRIKETHROUGH, '', [
          Factory.WORD('Strikethrough'),
        ]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Highlight', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize('==Highlight=='));
      const expected = Factory.ROOT([
        Factory.DECORATION(TOKEN.TOKEN_TYPE.HIGHLIGHT, '', [
          Factory.WORD('Highlight'),
        ]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Paragraph', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize('This is a paragraph.\n\n'),
      );
      const expected = Factory.ROOT([
        Factory.PARAGRAPH([Factory.WORD('This is a paragraph.')]),
        Factory.NEW_LINE(),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Multiple line paragraph', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize(
          'first line of p1.\nsecond line of p1\n\nfirst line of p2.\nsecond line of p2\n',
        ),
      );
      const expected = Factory.ROOT([
        Factory.PARAGRAPH([Factory.WORD('first line of p1.second line of p1')]),
        Factory.NEW_LINE(),
        Factory.PARAGRAPH([Factory.WORD('first line of p2.second line of p2')]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Special characters', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize(String.raw`&é"'()*\/_{}[]§è!çà-^¨$ù%´\`µ£=+~`),
      );

      const expected = Factory.ROOT([
        Factory.WORD(`&é"'()*`),
        Factory.ESCAPE('/'),
        Factory.WORD(`_{}[]§è!çà-^¨$ù%´`),
        Factory.ESCAPE('`'),
        Factory.WORD(`µ£=+~`),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Escaped character 1', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(String.raw`\n`));
      const expected = Factory.ROOT([Factory.ESCAPE('n')]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Escaped character 2', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize(String.raw`\*\*This line will not be bold\*\*`),
      );

      const expected = Factory.ROOT([
        Factory.ESCAPE('*'),
        Factory.ESCAPE('*'),
        Factory.WORD(`This line will not be bold`),
        Factory.ESCAPE('*'),
        Factory.ESCAPE('*'),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Escaped character 3', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.escaped3));

      const expected = Factory.ROOT([
        Factory.ESCAPE('*'),
        Factory.ITALIC([
          Factory.WORD(`This line will be italic and show the asterisks`),
        ]),
        Factory.ESCAPE('*'),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });
  });

  suite('Nested', () => {
    test('Italic in Bold', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize('**Bold text and _nested italic_ text**'),
      );

      const expected = Factory.ROOT([
        Factory.DECORATION(TOKEN.TOKEN_TYPE.BOLD, '', [
          Factory.WORD('Bold text and '),
          Factory.DECORATION(TOKEN.TOKEN_TYPE.ITALIC, '', [
            Factory.WORD('nested italic'),
          ]),
          Factory.WORD(' text'),
        ]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Bold in Italic', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize('_Italic text and **nested Bold** text_'),
      );

      const expected = Factory.ROOT([
        Factory.DECORATION(TOKEN.TOKEN_TYPE.ITALIC, '', [
          Factory.WORD('Italic text and '),
          Factory.DECORATION(TOKEN.TOKEN_TYPE.BOLD, '', [
            Factory.WORD('nested Bold'),
          ]),
          Factory.WORD(' text'),
        ]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Nested in header', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize(
          '### ~~**Bold text and _nested italic_ text in heading and strike**~~',
        ),
      );

      const expected = Factory.ROOT([
        Factory.HEADING('', 3, [
          Factory.DECORATION(TOKEN.TOKEN_TYPE.STRIKETHROUGH, '', [
            Factory.DECORATION(TOKEN.TOKEN_TYPE.BOLD, '', [
              Factory.WORD('Bold text and '),
              Factory.DECORATION(TOKEN.TOKEN_TYPE.ITALIC, '', [
                Factory.WORD('nested italic'),
              ]),
              Factory.WORD(' text in heading and strike'),
            ]),
          ]),
        ]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Header External_link', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize(
          `## Link in header ![Crafty](${CONSTANT.SampleImage1})`,
        ),
      );

      const expected = Factory.ROOT([
        Factory.HEADING('', 2, [
          Factory.WORD('Link in header '),
          Factory.IMAGE_LINK(CONSTANT.SampleImage1, 'Crafty'),
        ]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });
  });

  suite('Links', () => {
    test('External link (no name)', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize('[](https://github.com/liolle/Crafty)'),
      );
      const expected = Factory.ROOT([
        Factory.LINK('https://github.com/liolle/Crafty', ''),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });
    test('External link (no url)', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize('[Crafty]()'));
      const expected = Factory.ROOT([Factory.LINK('', 'Crafty')]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('External link', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize('[Crafty](https://github.com/liolle/Crafty)'),
      );
      const expected = Factory.ROOT([
        Factory.LINK('https://github.com/liolle/Crafty', 'Crafty'),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('External link (no name & no url)', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize('[]()'));
      const expected = Factory.ROOT([Factory.LINK('', '')]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    // Images

    test('External image (no name)', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize(`![](${CONSTANT.SampleImage1})`),
      );
      const expected = Factory.ROOT([
        Factory.IMAGE_LINK(CONSTANT.SampleImage1, ''),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('External image (no url)', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(`![Crafty]()`));
      const expected = Factory.ROOT([Factory.IMAGE_LINK('', 'Crafty')]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('External image', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize(`![Crafty](${CONSTANT.SampleImage1})`),
      );
      const expected = Factory.ROOT([
        Factory.IMAGE_LINK(CONSTANT.SampleImage1, 'Crafty'),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('External image (no name & no url)', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(`![]()`));
      const expected = Factory.ROOT([Factory.IMAGE_LINK('', '')]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Link in list', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize(
          `- Familiarity with [Markdown](https://daringfireball.net/projects/markdown/)`,
        ),
      );
      const expected = Factory.ROOT([
        Factory.UL([
          Factory.LI('', [
            Factory.WORD('Familiarity with '),
            Factory.LINK(
              'https://daringfireball.net/projects/markdown/',
              'Markdown',
            ),
          ]),
        ]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Extract correct info', () => {
      const actual = Factory.ROOT(
        TOKENIZER.tokenize(
          `![Alt text for screen readers](https://assets.digitalocean.com/logos/DO_Logo_horizontal_blue.png 'DigitalOcean Logo')`,
        ),
      );
      const expected = Factory.ROOT([
        Factory.IMAGE_LINK(
          'https://assets.digitalocean.com/logos/DO_Logo_horizontal_blue.png',
          'Alt text for screen readers',
        ),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });
  });

  suite('List', () => {
    test('Base list', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.BaseList));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.UL([
          Factory.LI('A', []),
          Factory.UL([
            Factory.LI('Sub list of A', []),
            Factory.UL([Factory.LI('Element of sub list of A', [])]),
          ]),
          Factory.LI('B', []),
          Factory.UL([
            Factory.LI('Sub list of BElement', []),
            Factory.LI('Sub list of B', []),
          ]),
          Factory.LI('Simple LI', []),
        ]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Base list3', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.BaseList3));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.UL([
          Factory.LI('This is a list item.', []),
          Factory.LI('This list is unordered.', []),
        ]),
        Factory.WORD(
          `Here's how to include an image with alt text and a title:`,
        ),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Base list4', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.BaseList4));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.UL([
          Factory.LI('This is a list item.', []),
          Factory.LI('This list is unordered.', []),
        ]),
        Factory.WORD(
          `Here's how to include an image with alt text and a title:`,
        ),
        Factory.NEW_LINE(),
        Factory.NEW_LINE(),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('New line after in list', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.BaseList5));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.UL([
          Factory.LI('This is a list item.', []),
          Factory.LI('This list is unordered.', []),
        ]),
        Factory.NEW_LINE(),
        Factory.NEW_LINE(),
        Factory.PARAGRAPH([
          Factory.WORD(
            `Here's how to include an image with alt text and a title:`,
          ),
        ]),
        Factory.NEW_LINE(),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('2 list separated by new lines', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.BaseList6));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.UL([Factory.LI('first list.', [])]),
        Factory.NEW_LINE(),
        Factory.NEW_LINE(),
        Factory.NEW_LINE(),
        Factory.UL([Factory.LI('second list.', [])]),
        Factory.NEW_LINE(),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('TaskList', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.BaseList2));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.UL([
          Factory.LI('A', []),
          Factory.UL([
            Factory.CHECK_BOX(false, 'Sub task of A'),
            Factory.UL([Factory.CHECK_BOX(true, 'Checked task')]),
          ]),
          Factory.LI('B', []),
          Factory.UL([Factory.CHECK_BOX(false, 'Sub task of B')]),
          Factory.CHECK_BOX(false, 'Tasks C'),
          Factory.UL([
            Factory.CHECK_BOX(false, 'Sub task of C'),
            Factory.LI('[] not a task', []),
            Factory.LI('[x]not a task', []),
          ]),
        ]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('TaskList1', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.Tasklist1));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.UL([
          Factory.LI('A', []),
          Factory.UL([
            Factory.LI('Sub list of A[ ] should not be a task', []),
            Factory.LI('Sub list of A', []),
          ]),
        ]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('TaskList2', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.Tasklist2));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.UL([
          Factory.LI('A', []),
          Factory.UL([
            Factory.LI(
              'Sub list of A[ ] should not be a task, and it should be appended to the last li, this should also be appended to the last li',
              [],
            ),
            Factory.LI('Sub list of A', []),
          ]),
        ]),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });
  });

  suite('Code', () => {
    test('Inline code', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.InlineCode1));

      const expected = Factory.ROOT([Factory.INLINE_CODE('backticks')]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Block code1', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.CodeBlock1));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.CODE_BLOCK(CONSTANT.code1, 'js'),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });

    test('Block code3', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.CodeBlock3));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.CODE_BLOCK(CONSTANT.code3, 'py'),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });
  });
});
