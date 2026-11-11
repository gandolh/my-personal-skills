// config.ts may read process.env, but never NODE_ENV: the app is configured by its own variables.
export const config = {
  port: Number(process.env.PORT ?? "3000"),
  secure: process.env.NODE_ENV === "production",
};
