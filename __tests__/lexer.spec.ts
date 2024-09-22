import { describe, expect, suite, test } from 'vitest';
import { TOKENIZER } from '../lexer/tokenizer';
import { TOKEN } from '../lexer/token';
import { CONSTANT } from './constants';

describe('Headers', () => {
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
  });
});
