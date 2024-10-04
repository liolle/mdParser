import { describe, expect, onTestFailed, suite, test } from 'vitest';
import { TOKENIZER } from '../lexer/tokenizer';
import { CONSTANT } from './constants';
import { SUPPORTED_LANGUAGES } from '../token/code';
import { Token, TOKEN } from '../token/token';
import { Factory } from '../token/factory';
import { LinkToken, LINK_TOKEN_TYPE } from '../token/links';

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
      const actual = Factory.ROOT(TOKENIZER.tokenize('This is a paragraph.\n'));
      const expected = Factory.ROOT([
        Factory.PARAGRAPH([Factory.WORD('This is a paragraph.')]),
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
  });

  suite('List', () => {
    test('Base list', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.BaseList));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.UL([
          Factory.UL([
            Factory.WORD('A'),
            Factory.UL([
              Factory.WORD('Sub list of A'),
              Factory.LI('Element of sub list of A'),
            ]),
          ]),

          Factory.UL([
            Factory.WORD('B'),
            Factory.LI('Sub list of BElement'),
            Factory.LI('Sub list of B'),
          ]),
          Factory.LI('Simple LI'),
        ]),
      ]);

      expect(actual.equal(expected)).toEqual(true);
    });

    test('TaskList', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.BaseList2));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.UL([
          Factory.UL([
            Factory.WORD('A'),
            Factory.CHECK_BOX_UL(false, [
              Factory.CHECK_BOX(false, 'Sub task of A'),
              Factory.CHECK_BOX(true, 'Checked task'),
            ]),
          ]),
          Factory.UL([
            Factory.WORD('B'),
            Factory.CHECK_BOX(false, 'Sub task of B'),
          ]),

          Factory.CHECK_BOX_UL(false, [
            Factory.CHECK_BOX(false, 'Tasks C'),
            Factory.CHECK_BOX(false, 'Sub task of C'),
            Factory.LI('[] not a task'),
            Factory.LI('[x]not a task'),
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

    test('Block code', () => {
      const actual = Factory.ROOT(TOKENIZER.tokenize(CONSTANT.CodeBlock1));

      const expected = Factory.ROOT([
        Factory.NEW_LINE(),
        Factory.CODE_BLOCK(CONSTANT.code1, SUPPORTED_LANGUAGES.JS),
      ]);

      onTestFailed(e => {
        expect(actual.print()).toEqual(expected.print());
      });

      expect(actual.equal(expected)).toEqual(true);
    });
  });
});
