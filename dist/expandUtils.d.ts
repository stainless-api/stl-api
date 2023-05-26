/**
 * Given a set of expands like `['items.user', 'items.comments.user']`, adds
 * parent paths, so the result is
 * `new Set(['items', 'items.user', 'items.comments', 'items.comments.user'])`
 */
export declare function addExpandParents(expand: string[]): Set<string>;
//# sourceMappingURL=expandUtils.d.ts.map