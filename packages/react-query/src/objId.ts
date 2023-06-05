const idMap = new Map();

export function objId(obj: unknown): number {
  if (obj == null) return 0;
  let id = idMap.get(obj);
  if (id) return id;
  idMap.set(obj, (id = idMap.size + 1));
  return id;
}
