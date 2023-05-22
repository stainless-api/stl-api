/**
 * Given a set of expands like `['items.user', 'items.comments.user']`, adds
 * parent paths, so the result is
 * `new Set(['items', 'items.user', 'items.comments', 'items.comments.user'])`
 */
export function addExpandParents(expand: string[]): Set<string> {
  const result: Set<string> = new Set();
  function add(path: string) {
    result.add(path);
    const lastDot = path.lastIndexOf(".");
    if (lastDot >= 0) {
      add(path.slice(0, lastDot));
    }
  }
  expand.forEach(add);
  return result;
}
