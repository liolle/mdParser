import { describe, expect, suite, test } from 'vitest';
import { TOKENIZER } from '../lexer/tokenizer';
import { TOKEN } from '../lexer/token';
import { CONSTANT } from './constants';

describe('Parsing', () => {
  suite('Base case', () => {
    test('H1', () => {
      const tokens = TOKENIZER.tokenize('# This is a heading 1');

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.H1, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['This is a heading 1']),
      ]);

      expect(tokens).toHaveLength(1);
      expect(TOKEN.displayToken(tokens[0])).toEqual(
        TOKEN.displayToken(expected_token),
      );
    });
    test('H6', () => {
      const tokens = TOKENIZER.tokenize('###### This is a heading 6');

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.H6, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['This is a heading 6']),
      ]);

      expect(tokens).toHaveLength(1);
      expect(TOKEN.displayToken(tokens[0])).toEqual(
        TOKEN.displayToken(expected_token),
      );
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
        const expected_token = new TOKEN.Token(types[i], [
          new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [
            `This is a heading ${i + 1}`,
          ]),
        ]);
        expect(TOKEN.displayToken(tokens[i])).toEqual(
          TOKEN.displayToken(expected_token),
        );
      }
    });

    test('Bold', () => {
      const tokens = TOKENIZER.tokenize('**Bold**');

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.BOLD, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['Bold']),
      ]);

      expect(tokens).toHaveLength(1);
      expect(TOKEN.displayToken(tokens[0])).toEqual(
        TOKEN.displayToken(expected_token),
      );
    });

    test('Italic', () => {
      const tokens = TOKENIZER.tokenize('_Italic_');

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.ITALIC, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['Italic']),
      ]);

      expect(tokens).toHaveLength(1);
      expect(TOKEN.displayToken(tokens[0])).toEqual(
        TOKEN.displayToken(expected_token),
      );
    });

    test('StrikeThrough', () => {
      const tokens = TOKENIZER.tokenize('~~Strikethrough~~');

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.STRIKETHROUGH, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['Strikethrough']),
      ]);

      expect(tokens).toHaveLength(1);
      expect(TOKEN.displayToken(tokens[0])).toEqual(
        TOKEN.displayToken(expected_token),
      );
    });

    test('Highlight', () => {
      const tokens = TOKENIZER.tokenize('==Highlight==');

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.HIGHLIGHT, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['Highlight']),
      ]);

      expect(tokens).toHaveLength(1);
      expect(TOKEN.displayToken(tokens[0])).toEqual(
        TOKEN.displayToken(expected_token),
      );
    });

    test('Paragraph', () => {
      const tokens = TOKENIZER.tokenize('This is a paragraph.\n');

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.PARAGRAPH, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['This is a paragraph.']),
      ]);

      expect(tokens).toHaveLength(1);
      expect(TOKEN.displayToken(tokens[0])).toEqual(
        TOKEN.displayToken(expected_token),
      );
    });

    test('Special characters', () => {
      const tokens = TOKENIZER.tokenize(
        String.raw`&é"'()*\/_{}[]§è!çà-^¨$ù%´\`µ£=+~`,
      );

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.ROOT, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [`&é"'()*`]),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.ESCAPE, [`/`]),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [`_{}[]§è!çà-^¨$ù%´`]),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.ESCAPE, ['`']),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [`µ£=+~`]),
      ]);

      expect(tokens).toHaveLength(5);
      expect(
        TOKEN.displayToken(new TOKEN.Token(TOKEN.TOKEN_TYPE.ROOT, tokens)),
      ).toEqual(TOKEN.displayToken(expected_token));
    });

    test('Escaped character 1', () => {
      const tokens = TOKENIZER.tokenize(String.raw`\n`);

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.ESCAPE, ['n']);

      expect(tokens).toHaveLength(1);
      expect(TOKEN.displayToken(tokens[0])).toEqual(
        TOKEN.displayToken(expected_token),
      );
    });

    test('Escaped character 2', () => {
      const tokens = TOKENIZER.tokenize(
        String.raw`\*\*This line will not be bold\*\*`,
      );

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.ROOT, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.ESCAPE, [`*`]),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.ESCAPE, [`*`]),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [`This line will not be bold`]),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.ESCAPE, ['*']),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.ESCAPE, [`*`]),
      ]);

      expect(tokens).toHaveLength(5);
      expect(
        TOKEN.displayToken(new TOKEN.Token(TOKEN.TOKEN_TYPE.ROOT, tokens)),
      ).toEqual(TOKEN.displayToken(expected_token));
    });

    test('Escaped character 3', () => {
      const tokens = TOKENIZER.tokenize(
        String.raw`\*_This line will be italic and show the asterisks_\*`,
      );

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.ROOT, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.ESCAPE, [`*`]),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.ITALIC, [
          new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [
            `This line will be italic and show the asterisks`,
          ]),
        ]),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.ESCAPE, [`*`]),
      ]);

      expect(tokens).toHaveLength(3);
      expect(
        TOKEN.displayToken(new TOKEN.Token(TOKEN.TOKEN_TYPE.ROOT, tokens)),
      ).toEqual(TOKEN.displayToken(expected_token));
    });
  });

  suite('Nested', () => {
    test('Italic in Bold', () => {
      const tokens = TOKENIZER.tokenize(
        '**Bold text and _nested italic_ text**',
      );

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.BOLD, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['Bold text and ']),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.ITALIC, [
          new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['nested italic']),
        ]),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [' text']),
      ]);

      expect(tokens).toHaveLength(1);
      expect(TOKEN.displayToken(tokens[0])).toEqual(
        TOKEN.displayToken(expected_token),
      );
    });

    test('Bold in Italic', () => {
      const tokens = TOKENIZER.tokenize(
        '_Italic text and **nested Bold** text_',
      );

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.ITALIC, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['Italic text and ']),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.BOLD, [
          new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['nested Bold']),
        ]),
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [' text']),
      ]);

      expect(tokens).toHaveLength(1);
      expect(TOKEN.displayToken(tokens[0])).toEqual(
        TOKEN.displayToken(expected_token),
      );
    });

    test('Nested in header', () => {
      const tokens = TOKENIZER.tokenize(
        '### ~~**Bold text and _nested italic_ text in heading and strike**~~',
      );

      const expected_token = new TOKEN.Token(TOKEN.TOKEN_TYPE.H3, [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.STRIKETHROUGH, [
          new TOKEN.Token(TOKEN.TOKEN_TYPE.BOLD, [
            new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['Bold text and ']),
            new TOKEN.Token(TOKEN.TOKEN_TYPE.ITALIC, [
              new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, ['nested italic']),
            ]),
            new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [
              ' text in heading and strike',
            ]),
          ]),
        ]),
      ]);

      expect(tokens).toHaveLength(1);
      expect(TOKEN.displayToken(tokens[0])).toEqual(
        TOKEN.displayToken(expected_token),
      );
    });
  });

  suite('Links', () => {
    test('External link (no name)', () => {
      const tokens = TOKENIZER.tokenize('[](https://github.com/liolle/Crafty)');
      const expected_token = new TOKEN.LinkToken(
        'https://github.com/liolle/Crafty',
        [],
      );

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(TOKEN.LinkToken);
      expect((tokens[0] as TOKEN.LinkToken).kind).toEqual(
        TOKEN.LINK_TOKEN_TYPE.DEFAULT,
      );
      expect(tokens[0].print()).toEqual(expected_token.print());
    });
    test('External link (no url)', () => {
      const tokens = TOKENIZER.tokenize('[Crafty]()');
      const expected_token = new TOKEN.LinkToken('', [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [`Crafty`]),
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(TOKEN.LinkToken);
      expect((tokens[0] as TOKEN.LinkToken).kind).toEqual(
        TOKEN.LINK_TOKEN_TYPE.DEFAULT,
      );
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('External link', () => {
      const tokens = TOKENIZER.tokenize(
        '[Crafty](https://github.com/liolle/Crafty)',
      );
      const expected_token = new TOKEN.LinkToken(
        'https://github.com/liolle/Crafty',
        [new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [`Crafty`])],
      );

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(TOKEN.LinkToken);
      expect((tokens[0] as TOKEN.LinkToken).kind).toEqual(
        TOKEN.LINK_TOKEN_TYPE.DEFAULT,
      );
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('External link (no name & no url)', () => {
      const tokens = TOKENIZER.tokenize('[]()');
      const expected_token = new TOKEN.LinkToken(
        '',
        [],
        TOKEN.LINK_TOKEN_TYPE.IMAGE,
      );

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(TOKEN.LinkToken);
      expect((tokens[0] as TOKEN.LinkToken).kind).toEqual(
        TOKEN.LINK_TOKEN_TYPE.DEFAULT,
      );
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    // Images

    test('External image (no name)', () => {
      const tokens = TOKENIZER.tokenize(`![](${CONSTANT.SampleImage1})`);
      const expected_token = new TOKEN.LinkToken(
        String.raw`${CONSTANT.SampleImage1}`,
        [],
        TOKEN.LINK_TOKEN_TYPE.IMAGE,
      );

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(TOKEN.LinkToken);
      expect((tokens[0] as TOKEN.LinkToken).kind).toEqual(
        TOKEN.LINK_TOKEN_TYPE.IMAGE,
      );
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('External image (no url)', () => {
      const tokens = TOKENIZER.tokenize('![Crafty]()');
      const expected_token = new TOKEN.LinkToken('', [
        new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [`Crafty`]),
        TOKEN.LINK_TOKEN_TYPE.IMAGE,
      ]);

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(TOKEN.LinkToken);
      expect((tokens[0] as TOKEN.LinkToken).kind).toEqual(
        TOKEN.LINK_TOKEN_TYPE.IMAGE,
      );
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('External image', () => {
      const tokens = TOKENIZER.tokenize(`![Crafty](${CONSTANT.SampleImage1})`);
      const expected_token = new TOKEN.LinkToken(
        String.raw`${CONSTANT.SampleImage1}`,
        [new TOKEN.Token(TOKEN.TOKEN_TYPE.WORD, [`Crafty`])],
        TOKEN.LINK_TOKEN_TYPE.IMAGE,
      );

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(TOKEN.LinkToken);
      expect((tokens[0] as TOKEN.LinkToken).kind).toEqual(
        TOKEN.LINK_TOKEN_TYPE.IMAGE,
      );
      expect(tokens[0].print()).toEqual(expected_token.print());
    });

    test('External image (no name & no url)', () => {
      const tokens = TOKENIZER.tokenize('![]()');
      const expected_token = new TOKEN.LinkToken(
        '',
        [],
        TOKEN.LINK_TOKEN_TYPE.IMAGE,
      );

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeInstanceOf(TOKEN.LinkToken);
      expect((tokens[0] as TOKEN.LinkToken).kind).toEqual(
        TOKEN.LINK_TOKEN_TYPE.IMAGE,
      );
      expect(tokens[0].print()).toEqual(expected_token.print());
    });
  });
});
