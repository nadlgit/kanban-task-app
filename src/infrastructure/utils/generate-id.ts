const nextId: Record<string, number> = {};

export function generateId(prefix: string) {
  if (nextId[prefix] === undefined) {
    nextId[prefix] = 0;
  }
  nextId[prefix]++;
  return `${prefix}${nextId[prefix].toString().padStart(6, '0')}`;
}
