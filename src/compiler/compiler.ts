import { Token } from '../token/token';

export interface Adapter<T> {
  compile: (input: T) => string;
}

export interface TokenCompiler<T> {
  compile: (token: Token) => T;
}

export class StringTokenCompiler implements TokenCompiler<string> {
  private _adapter: Adapter<Token>;

  constructor(adapter: Adapter<Token>) {
    this._adapter = adapter;
  }

  compile(token: Token) {
    return this._adapter.compile(token);
  }
}
