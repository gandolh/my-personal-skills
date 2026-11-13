// A message that names NODE_ENV is not a read of it.
export function refuse(): never {
  throw new Error("NODE_ENV is not read here: set LOG_PRETTY=1 instead");
}

export const hint = `unset NODE_ENV, then restart`;
