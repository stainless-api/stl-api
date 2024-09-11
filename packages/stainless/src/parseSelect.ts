export type SelectTree = {
  select?: Record<string, SelectTree>;
};

/**
 * Parses a select expression, for example:
 *
 * parseSelect("a,b,c.d{g.j.y,e,f.k,g{h,i}}")
 *
 * Will return:
 *
 * {
 *   select: {
 *     a: {},
 *     b: {},
 *     c: {
 *       select: {
 *         d: {
 *           select: {
 *             g: {
 *               select: {
 *                 j: { select: { y: {} } },
 *                 h: {},
 *                 i: {},
 *               },
 *             },
 *             e: {},
 *             f: { select: { k: {} } },
 *           },
 *         },
 *       },
 *     },
 *   },
 * }
 */
export function parseSelect(select: string): SelectTree {
  return new SelectParser(select).parse();
}

class SelectParser {
  result: SelectTree = { select: {} };
  parent: SelectParser | undefined;

  constructor(
    private input: string,
    private pos = 0,
    private end = input.length,
  ) {}

  get done() {
    return this.pos >= this.end;
  }

  /**
   * parses one or more select properties, separated by commas
   */
  parse(): SelectTree {
    this.skipWhitespace();
    this.parseProperty();
    this.skipWhitespace();
    while (!this.done) {
      if (this.parent && this.peek(/\}/)) return this.result;
      this.expect(/,\s*/);
      this.parseProperty();
      this.skipWhitespace();
    }
    return this.result;
  }

  /**
   * parses the select property starting at the current position
   * (which could include nested properties)
   */
  parseProperty() {
    let property = this.expect(/[_a-z][_a-z0-9]*/i)[0];
    let subtree = this.result.select!;

    // handle paths like a.b.c
    let subprop;
    while ((subprop = this.match(/\s*\.\s*([_a-z][_a-z0-9]*)/i)?.[1])) {
      let child = subtree[property];
      if (!(child instanceof Object)) {
        subtree[property] = { select: (child = {}) };
      }
      subtree = child;
      property = subprop;
    }

    if (!subtree[property]) subtree[property] = {};

    // if we encounter { parse the nested select expression embedded in the { }
    if (this.match(/\s*\{\s*/)) {
      const subselect = this.parseSubselect();
      this.expect(/\s*\}/);

      const merged = mergeSelect(subtree[property], subselect);
      if (merged) subtree[property] = merged;
    }
  }

  parseSubselect() {
    const subparser = new SelectParser(this.input, this.pos);
    subparser.parent = this;
    const result = subparser.parse();
    this.pos = subparser.pos;
    return result;
  }

  /**
   * If regex matches the input at the current pos, returns the match,
   * but doesn't advance the pos.
   */
  peek(regex: RegExp): RegExpMatchArray | undefined {
    regex = new RegExp(regex.source, `gm${regex.flags.replace(/[gm]/g, "")}`);
    regex.lastIndex = this.pos;
    const match = regex.exec(this.input);
    if (match?.index === this.pos && match.index + match.length <= this.end) {
      return match;
    }
    return undefined;
  }

  /**
   * If regex matches the input at the current pos, returns the match,
   * and advances the pos.
   */
  match(regex: RegExp): RegExpMatchArray | undefined {
    const match = this.peek(regex);
    if (match) {
      this.pos += match[0].length;
    }
    return match;
  }

  /**
   * If regex matches the input at the current pos, returns the match,
   * and advances the pos.  Otherwise, throws an error with the given message.
   */
  expect(
    regex: RegExp,
    errorMessage: string = `expected ${regex}`,
  ): RegExpMatchArray {
    const match = this.match(regex);
    if (!match) throw new Error(`${errorMessage} (at ${this.pos})`);
    return match;
  }

  /**
   * Advances past any whitespace starting at the current pos.
   */
  skipWhitespace() {
    this.match(/\s+/);
  }
}

function mergeSelect(
  a: SelectTree | undefined,
  b: SelectTree | undefined,
): SelectTree | undefined {
  if (a == null) return b;
  if (b == null) return a;
  const aSelect: SelectTree["select"] =
      a instanceof Object ? a.select || {} : {},
    bSelect: SelectTree["select"] = b instanceof Object ? b.select || {} : {};
  const merged: Record<string, SelectTree> = {};
  for (const key of [...Object.keys(aSelect), ...Object.keys(bSelect)]) {
    const mergedKey = mergeSelect(aSelect[key], bSelect[key]);
    if (mergedKey) merged[key] = mergedKey;
  }
  return { select: merged };
}
