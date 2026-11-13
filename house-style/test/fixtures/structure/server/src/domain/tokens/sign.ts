// A domain module: code several features share that isn't pure. It is server code like any other.
export interface Signer {
  sign(subject: string, now: Date): string;
}

export function createSigner(key: string): Signer {
  return { sign: (subject, now) => `${subject}.${now.getTime()}.${key.length}` };
}
