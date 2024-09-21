import { MDToken, TOKEN } from './token';

export type ConsumedType = {
  consumed: number;
  token: MDToken;
} | null;

export namespace TOKENIZER {
  export class Heading {
    static consume(src: string, offset: number): ConsumedType {
      const res = RegexRegister.HeadingMark().exec(src.slice(offset));

      if (!res) return null;

      const [target] = res;

      if (res['index'] != 0) return null;
      const len = target.length as TOKEN.HEADING_SIZE;
      let raw = src.substring(offset, offset + len);

      return {
        consumed: len,
        token: {
          type: 'heading',
          size: len,
          body: raw,
        },
      };
    }
  }

  export class NewLine {
    static consume(src: string, offset: number): ConsumedType {
      const res = RegexRegister.NewLineMark().exec(src.slice(offset));
      if (!res) return null;
      if (res['index'] != 0) return null;

      return {
        consumed: 1,
        token: {
          type: 'new_line',
          body: '\n',
        },
      };
    }
  }

  export class Space {
    static consume(src: string, offset: number): ConsumedType {
      const res = RegexRegister.SpaceMark().exec(src.slice(offset));
      if (!res) return null;
      if (res['index'] != 0) return null;

      return {
        consumed: 1,
        token: {
          type: 'space',
          body: ' ',
        },
      };
    }
  }

  export class Stars {
    static consume(src: string, offset: number): ConsumedType {
      const res = RegexRegister.StarsMark().exec(src.slice(offset));
      // console.log(RegexRegister.StarsMark());

      if (!res) return null;
      if (res['index'] != 0) return null;

      const [target] = res;

      if (res['index'] != 0) return null;
      const len = target.length as TOKEN.STARS_SIZE;
      let raw = src.substring(offset, offset + len);

      return {
        consumed: len,
        token: {
          type: 'stars',
          size: len,
          body: raw,
        },
      };
    }
  }

  export class Strikethrough {
    static consume(src: string, offset: number): ConsumedType {
      const res = RegexRegister.StrikethroughMark().exec(src.slice(offset));
      // console.log(RegexRegister.StrikethroughMark());

      if (!res) return null;
      if (res['index'] != 0) return null;

      return {
        consumed: 2,
        token: {
          type: 'strikethrough',
          body: '~~',
        },
      };
    }
  }

  export class Word {
    static consume(src: string, offset: number): ConsumedType {
      const res = RegexRegister.WordMark().exec(src.slice(offset));

      if (!res) return null;
      const [target] = res;

      if (res['index'] != 0) return null;
      const len = target.length;
      let raw = src.substring(offset, offset + len);

      return {
        consumed: len,
        token: {
          type: 'word',
          body: raw,
        },
      };
    }

    static combine(w1: TOKEN.Word, w2: TOKEN.Word): TOKEN.Word {
      return {
        type: 'word',
        body: w1.body + w2.body,
      };
    }
  }

  const RegexRegister = {
    StarsMark: () =>
      new RegExp(
        `${RegexPart.NoStartFront()}|${RegexPart.GroupOfStars()}|${RegexPart.NoStartBack()}`,
      ),
    HeadingMark: () => /^#{1,6}/g,
    NewLineMark: () => /\n/g,
    SpaceMark: () => / /g,
    StrikethroughMark: () =>
      new RegExp(
        `${RegexPart.NoTildeFront()}|${RegexPart.GroupOTilde()}|${RegexPart.NoTildeBack()}`,
      ),
    WordMark: () => RegexPart.NeutralCharacter(),
  };

  const RegexPart = {
    NoStartFront: () => '(^\\*{1,3}(?=[^\\*]))',
    GroupOfStars: () => '((?<=[^\\*])\\*{1,3}(?=[^\\*]))',
    NoStartBack: () => '((?<=[^\\*])\\*{1,3}$)',
    NoTildeFront: () => '(^~~(?=[^~]))',
    GroupOTilde: () => '((?<=[^~])~~(?=[^~]))',
    NoTildeBack: () => '((?<=[^~])~~$)',
    NeutralCharacter: () =>
      /[\w\&é\"\'\(\)\{\}\[\]<>\§è\!\çà\-\\\^\¨\$\ù\%\´\`µ£\=\+\:\/\.,]+|\*{4,}|~{3,}|~{1}/g,
  };
}
