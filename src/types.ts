import { TOKEN } from './token/token';

export type NestedIdx = {
  range: [number, number];
  type: TOKEN.TOKEN_TYPE;
  text: string;
};
