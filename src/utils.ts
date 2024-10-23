import { TOKEN } from './token/token';
import { NestedIdx } from './types';

/**
 *
 * @param ranges
 * @param body
 * @returns Transform a list of overlapping token ranges into a list of non overlapping ranges
 */
export function combineRages(ranges: NestedIdx[], body: string) {
  const res: NestedIdx[] = [];
  const n = ranges.length;

  ranges.sort((a, b) => (a.range[0] || 0) - (b.range[0] || 0));

  for (let i = 0; i < n; i++) {
    const cur = ranges[i] as NestedIdx;
    const last = res.pop();
    if (!last) {
      res.push(cur);
    } else if (last.type == TOKEN.TOKEN_TYPE.WORD) {
      last.text = body.slice(last.range[0], cur.range[0]);
      last.range[1] = cur.range[0] - 1;
      res.push(last);
      res.push(cur);
    } else {
      if (last.range[1] < cur.range[0]) {
        res.push(last);
        const mid = [last.range[1] + 1, cur.range[0] - 1] as [number, number];
        if (mid[1] >= mid[0]) {
          res.push({
            range: mid,
            text: body.slice(mid[0], mid[1] + 1),
            type: TOKEN.TOKEN_TYPE.WORD,
          });
        }
        res.push(cur);
      } else {
        res.push(last);
        const right = [
          last.range[1] + 1,
          Math.max(last.range[1], cur.range[1]),
        ] as [number, number];

        if (right[1] >= right[0]) {
          res.push({
            range: right,
            text: body.slice(right[0], right[1] + 1),
            type: cur.type,
          });
        }
      }
    }
  }

  const last = res.pop();
  const len = body.length;

  if (last) {
    res.push(last);
    if (last.range[1] < len - 1) {
      res.push({
        range: [last.range[1] + 1, len - 1],
        text: body.slice(last.range[1] + 1),
        type: TOKEN.TOKEN_TYPE.WORD,
      });
    }
  }

  return res;
}
