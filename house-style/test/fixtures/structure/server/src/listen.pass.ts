// Defining a listen function or method isn't calling it.
export function listen(port: number): string {
  return `:${port}`;
}

export const socket = {
  listen(port: number): string {
    return `socket:${port}`;
  },
};

export interface Server {
  listen(port: number): Promise<string>;
}
