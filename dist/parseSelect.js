"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSelect = void 0;
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
function parseSelect(select) {
    return new SelectParser(select).parse();
}
exports.parseSelect = parseSelect;
class SelectParser {
    constructor(input, pos = 0, end = input.length) {
        this.input = input;
        this.pos = pos;
        this.end = end;
        this.result = { select: {} };
    }
    get done() {
        return this.pos >= this.end;
    }
    /**
     * parses one or more select properties, separated by commas
     */
    parse() {
        this.skipWhitespace();
        this.parseProperty();
        this.skipWhitespace();
        while (!this.done) {
            if (this.parent && this.peek(/\}/))
                return this.result;
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
        var _a;
        let property = this.expect(/[_a-z][_a-z0-9]*/i)[0];
        let subtree = this.result.select;
        // handle paths like a.b.c
        let subprop;
        while ((subprop = (_a = this.match(/\s*\.\s*([_a-z][_a-z0-9]*)/i)) === null || _a === void 0 ? void 0 : _a[1])) {
            let child = subtree[property];
            if (!(child instanceof Object)) {
                subtree[property] = { select: (child = {}) };
            }
            subtree = child;
            property = subprop;
        }
        if (!subtree[property])
            subtree[property] = {};
        // if we encounter { parse the nested select expression embedded in the { }
        if (this.match(/\s*\{\s*/)) {
            const subselect = this.parseSubselect();
            this.expect(/\s*\}/);
            const merged = mergeSelect(subtree[property], subselect);
            if (merged)
                subtree[property] = merged;
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
    peek(regex) {
        regex = new RegExp(regex.source, `gm${regex.flags.replace(/[gm]/g, "")}`);
        regex.lastIndex = this.pos;
        const match = regex.exec(this.input);
        if ((match === null || match === void 0 ? void 0 : match.index) === this.pos && match.index + match.length <= this.end) {
            return match;
        }
        return undefined;
    }
    /**
     * If regex matches the input at the current pos, returns the match,
     * and advances the pos.
     */
    match(regex) {
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
    expect(regex, errorMessage = `expected ${regex}`) {
        const match = this.match(regex);
        if (!match)
            throw new Error(`${errorMessage} (at ${this.pos})`);
        return match;
    }
    /**
     * Advances past any whitespace starting at the current pos.
     */
    skipWhitespace() {
        this.match(/\s+/);
    }
}
function mergeSelect(a, b) {
    if (a == null)
        return b;
    if (b == null)
        return a;
    const aSelect = a instanceof Object ? a.select || {} : {}, bSelect = b instanceof Object ? b.select || {} : {};
    const merged = {};
    for (const key of [...Object.keys(aSelect), ...Object.keys(bSelect)]) {
        const mergedKey = mergeSelect(aSelect[key], bSelect[key]);
        if (mergedKey)
            merged[key] = mergedKey;
    }
    return { select: merged };
}
//# sourceMappingURL=parseSelect.js.map