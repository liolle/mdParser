export namespace TOKEN {
  export enum TOKEN_TYPE {
    BOLD = 'Bold',
    H1 = 'H1',
    H2 = 'H2',
    H3 = 'H3',
    H4 = 'H4',
    H5 = 'H5',
    H6 = 'H6',
    NEW_LINE = 'New_line',
    SPACE = 'Space',
    TILDE = 'Tilde',
    WORD = 'Word',
    ROOT = 'Root',
  }
  export const TOKEN_TYPE_HEADERS = [
    //
    TOKEN_TYPE.H1,
    TOKEN_TYPE.H2,
    TOKEN_TYPE.H3,
    TOKEN_TYPE.H4,
    TOKEN_TYPE.H5,
    TOKEN_TYPE.H6,
  ];

  export class Token {
    _type: TOKEN_TYPE;
    _value: (Token | string)[];

    constructor(type: TOKEN_TYPE, value: (Token | string)[]) {
      this._type = type;
      this._value = value;
    }

    get value() {
      return this._value;
    }

    get type() {
      return this._type;
    }
  }

  export function displayToken(token: Token, indent: number = 0): string {
    const indentation = ' '.repeat(indent);
    let output = `${indentation}[${token.type}]`;

    token.value.forEach(item => {
      if (typeof item === 'string') {
        output += `: ${item}`;
      } else {
        output += `\n${displayToken(item, indent + 2)}`;
      }
    });
    return output;
  }

  export function oneOf(type: TOKEN_TYPE, ...types: TOKEN_TYPE[]) {
    for (const t of types) if (t == type) return true;
    return false;
  }
}
