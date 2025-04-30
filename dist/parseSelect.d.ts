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
export declare function parseSelect(select: string): SelectTree;
//# sourceMappingURL=parseSelect.d.ts.map