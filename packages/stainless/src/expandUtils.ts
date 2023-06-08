/**
 * Given a set of includes like `['items.user', 'items.comments.user']`, adds
 * parent paths, so the result is
 * `new Set(['items', 'items.user', 'items.comments', 'items.comments.user'])`
 */
export function addIncludeParents(include: string[]): Set<string> {
  const result: Set<string> = new Set();
  function add(path: string) {
    result.add(path);
    const lastDot = path.lastIndexOf(".");
    if (lastDot >= 0) {
      add(path.slice(0, lastDot));
    }
  }
  include.forEach(add);
  return result;
}
