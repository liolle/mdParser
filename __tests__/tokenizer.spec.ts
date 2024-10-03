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
      const tokens = TOKENIZER.tokenize('# This is a heading 1');

      const expected_token = new Token(TOKEN.TOKEN_TYPE.H1, '', [
        new Token(TOKEN.TOKEN_TYPE.WORD, 'This is a heading 1', []),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });
    test('H6', () => {
      const tokens = TOKENIZER.tokenize('###### This is a heading 6');

      const expected_token = new Token(TOKEN.TOKEN_TYPE.H6, '', [
        new Token(TOKEN.TOKEN_TYPE.WORD, 'This is a heading 6', []),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('H1...H6', () => {
      const tokens = TOKENIZER.tokenize(CONSTANT.BaseHeaders);
      const types = [
        //
        TOKEN.TOKEN_TYPE.H1,
        TOKEN.TOKEN_TYPE.H2,
        TOKEN.TOKEN_TYPE.H3,
        TOKEN.TOKEN_TYPE.H4,
        TOKEN.TOKEN_TYPE.H5,
        TOKEN.TOKEN_TYPE.H6,
      ];

      expect(tokens).toHaveLength(6);
      for (let i = 0; i < 6; i++) {
        const expected_token = new Token(types[i], '', [
          new Token(TOKEN.TOKEN_TYPE.WORD, `This is a heading ${i + 1}`, []),
        ]);
        expect(tokens[i].print()).toEqual(expected_token.print());
      }
    });

    test('Bold', () => {
      const tokens = TOKENIZER.tokenize('**Bold**');

      const expected_token = new Token(TOKEN.TOKEN_TYPE.BOLD, '', [
        new Token(TOKEN.TOKEN_TYPE.WORD, 'Bold', []),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('Italic', () => {
      const tokens = TOKENIZER.tokenize('_Italic_');

      const expected_token = new Token(TOKEN.TOKEN_TYPE.ITALIC, '', [
        new Token(TOKEN.TOKEN_TYPE.WORD, 'Italic', []),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('StrikeThrough', () => {
      const tokens = TOKENIZER.tokenize('~~Strikethrough~~');

      const expected_token = new Token(TOKEN.TOKEN_TYPE.STRIKETHROUGH, '', [
        new Token(TOKEN.TOKEN_TYPE.WORD, 'Strikethrough', []),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('Highlight', () => {
      const tokens = TOKENIZER.tokenize('==Highlight==');

      const expected_token = new Token(TOKEN.TOKEN_TYPE.HIGHLIGHT, '', [
        new Token(TOKEN.TOKEN_TYPE.WORD, 'Highlight', []),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('Paragraph', () => {
      const tokens = TOKENIZER.tokenize('This is a paragraph.\n');

      const expected_token = new Token(TOKEN.TOKEN_TYPE.PARAGRAPH, '', [
        new Token(TOKEN.TOKEN_TYPE.WORD, 'This is a paragraph.', []),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('Special characters', () => {
      const tokens = TOKENIZER.tokenize(
        String.raw`&é"'()*\/_{}[]§è!çà-^¨$ù%´\`µ£=+~`,
      );

      const expected_token = new Token(TOKEN.TOKEN_TYPE.ROOT, '', [
        new Token(TOKEN.TOKEN_TYPE.WORD, `&é"'()*`, []),
        new Token(TOKEN.TOKEN_TYPE.ESCAPE, `/`, []),
        new Token(TOKEN.TOKEN_TYPE.WORD, `_{}[]§è!çà-^¨$ù%´`, []),
        new Token(TOKEN.TOKEN_TYPE.ESCAPE, '`', []),
        new Token(TOKEN.TOKEN_TYPE.WORD, `µ£=+~`, []),
      ]);

      expect(tokens).toHaveLength(5);
      expect(new Token(TOKEN.TOKEN_TYPE.ROOT, '', tokens).print()).toEqual(
        expected_token.print(),
      );
    });

    test('Escaped character 1', () => {
      const tokens = TOKENIZER.tokenize(String.raw`\n`);

      const expected_token = new Token(TOKEN.TOKEN_TYPE.ESCAPE, 'n', []);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('Escaped character 2', () => {
      const tokens = TOKENIZER.tokenize(
        String.raw`\*\*This line will not be bold\*\*`,
      );

      const expected_token = new Token(TOKEN.TOKEN_TYPE.ROOT, '', [
        new Token(TOKEN.TOKEN_TYPE.ESCAPE, `*`, []),
        new Token(TOKEN.TOKEN_TYPE.ESCAPE, `*`, []),
        new Token(TOKEN.TOKEN_TYPE.WORD, `This line will not be bold`, []),
        new Token(TOKEN.TOKEN_TYPE.ESCAPE, '*', []),
        new Token(TOKEN.TOKEN_TYPE.ESCAPE, `*`, []),
      ]);

      expect(tokens).toHaveLength(5);
      expect(new Token(TOKEN.TOKEN_TYPE.ROOT, '', tokens).print()).toEqual(
        expected_token.print(),
      );
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
      const tokens = TOKENIZER.tokenize(
        '**Bold text and _nested italic_ text**',
      );

      const expected_token = new Token(TOKEN.TOKEN_TYPE.BOLD, '', [
        new Token(TOKEN.TOKEN_TYPE.WORD, 'Bold text and ', []),
        new Token(TOKEN.TOKEN_TYPE.ITALIC, '', [
          new Token(TOKEN.TOKEN_TYPE.WORD, 'nested italic', []),
        ]),
        new Token(TOKEN.TOKEN_TYPE.WORD, ' text', []),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('Bold in Italic', () => {
      const tokens = TOKENIZER.tokenize(
        '_Italic text and **nested Bold** text_',
      );

      const expected_token = new Token(TOKEN.TOKEN_TYPE.ITALIC, '', [
        new Token(TOKEN.TOKEN_TYPE.WORD, 'Italic text and ', []),
        new Token(TOKEN.TOKEN_TYPE.BOLD, '', [
          new Token(TOKEN.TOKEN_TYPE.WORD, 'nested Bold', []),
        ]),
        new Token(TOKEN.TOKEN_TYPE.WORD, ' text', []),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('Nested in header', () => {
      const tokens = TOKENIZER.tokenize(
        '### ~~**Bold text and _nested italic_ text in heading and strike**~~',
      );

      const expected_token = new Token(TOKEN.TOKEN_TYPE.H3, '', [
        new Token(TOKEN.TOKEN_TYPE.STRIKETHROUGH, '', [
          new Token(TOKEN.TOKEN_TYPE.BOLD, '', [
            new Token(TOKEN.TOKEN_TYPE.WORD, 'Bold text and ', []),
            new Token(TOKEN.TOKEN_TYPE.ITALIC, '', [
              new Token(TOKEN.TOKEN_TYPE.WORD, 'nested italic', []),
            ]),
            new Token(TOKEN.TOKEN_TYPE.WORD, ' text in heading and strike', []),
          ]),
        ]),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('Header External_link', () => {
      const tokens = TOKENIZER.tokenize(
        `## Link in header ![Crafty](${CONSTANT.SampleImage1})`,
      );
      const expected_token = new Token(TOKEN.TOKEN_TYPE.H2, '', [
        new Token(TOKEN.TOKEN_TYPE.WORD, `Link in header `, []),
        new LinkToken(
          `${CONSTANT.SampleImage1}`,
          [new Token(TOKEN.TOKEN_TYPE.WORD, `Crafty`, [])],
          LINK_TOKEN_TYPE.IMAGE,
        ),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });
  });

  suite('Links', () => {
    test('External link (no name)', () => {
      const tokens = TOKENIZER.tokenize('[](https://github.com/liolle/Crafty)');
      const expected_token = new LinkToken(
        'https://github.com/liolle/Crafty',
        [],
      );

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(LinkToken);
      expect((tokens[0] as LinkToken).kind).toEqual(LINK_TOKEN_TYPE.DEFAULT);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });
    test('External link (no url)', () => {
      const tokens = TOKENIZER.tokenize('[Crafty]()');
      const expected_token = new LinkToken('', [
        new Token(TOKEN.TOKEN_TYPE.WORD, `Crafty`, []),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(LinkToken);
      expect((tokens[0] as LinkToken).kind).toEqual(LINK_TOKEN_TYPE.DEFAULT);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('External link', () => {
      const tokens = TOKENIZER.tokenize(
        '[Crafty](https://github.com/liolle/Crafty)',
      );
      const expected_token = new LinkToken('https://github.com/liolle/Crafty', [
        new Token(TOKEN.TOKEN_TYPE.WORD, `Crafty`, []),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(LinkToken);
      expect((tokens[0] as LinkToken).kind).toEqual(LINK_TOKEN_TYPE.DEFAULT);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('External link (no name & no url)', () => {
      const tokens = TOKENIZER.tokenize('[]()');
      const expected_token = new LinkToken('', [], LINK_TOKEN_TYPE.IMAGE);

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(LinkToken);
      expect((tokens[0] as LinkToken).kind).toEqual(LINK_TOKEN_TYPE.DEFAULT);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    // Images

    test('External image (no name)', () => {
      const tokens = TOKENIZER.tokenize(`![](${CONSTANT.SampleImage1})`);
      const expected_token = new LinkToken(
        String.raw`${CONSTANT.SampleImage1}`,
        [],
        LINK_TOKEN_TYPE.IMAGE,
      );

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(LinkToken);
      expect((tokens[0] as LinkToken).kind).toEqual(LINK_TOKEN_TYPE.IMAGE);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('External image (no url)', () => {
      const tokens = TOKENIZER.tokenize('![Crafty]()');
      const expected_token = new LinkToken(
        '',
        [new Token(TOKEN.TOKEN_TYPE.WORD, `Crafty`, [])],
        LINK_TOKEN_TYPE.IMAGE,
      );

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(LinkToken);
      expect((tokens[0] as LinkToken).kind).toEqual(LINK_TOKEN_TYPE.IMAGE);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('External image', () => {
      const tokens = TOKENIZER.tokenize(`![Crafty](${CONSTANT.SampleImage1})`);
      const expected_token = new LinkToken(
        String.raw`${CONSTANT.SampleImage1}`,
        [new Token(TOKEN.TOKEN_TYPE.WORD, `Crafty`, [])],
        LINK_TOKEN_TYPE.IMAGE,
      );

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(LinkToken);
      expect((tokens[0] as LinkToken).kind).toEqual(LINK_TOKEN_TYPE.IMAGE);
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('External image (no name & no url)', () => {
      const tokens = TOKENIZER.tokenize('![]()');
      const expected_token = new LinkToken('', [], LINK_TOKEN_TYPE.IMAGE);

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(LinkToken);
      expect((tokens[0] as LinkToken).kind).toEqual(LINK_TOKEN_TYPE.IMAGE);
      expect(tokens[0].print()).toEqual(expected_token.print());
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
