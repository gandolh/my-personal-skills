// Shared code is imported by the server too, so it reads no environment either.
export const debug = process.env.DEBUG === "1";
