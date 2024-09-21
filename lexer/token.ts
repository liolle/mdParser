export type MDToken =
  | TOKEN.Stars
  | TOKEN.Heading
  | TOKEN.NewLine
  | TOKEN.Space
  | TOKEN.Word
  | TOKEN.Tilde;

export namespace TOKEN {
  export interface Heading {
    type: 'heading';

    size: HEADING_SIZE;
    body: string;
  }
  export type HEADING_SIZE = 1 | 2 | 3 | 4 | 5 | 6;

  export interface NewLine {
    type: 'new_line';
    body: string;
  }
  export interface Space {
    type: 'space';
    body: string;
  }

  export interface Stars {
    type: 'stars';
    size: STARS_SIZE;
    body: string;
  }
  export type STARS_SIZE = 1 | 2 | 3;

  export interface Tilde {
    type: 'strikethrough';
    body: string;
  }

  export interface Word {
    type: 'word';
    body: string;
  }
}
