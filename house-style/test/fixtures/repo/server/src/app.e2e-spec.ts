/** A jest-style end-to-end spec, named the way NestJS names them: it sets the environment up and prints. */
process.env.PORT = "0";
console.info("the end-to-end spec starts the app on port", process.env.PORT);

export {};
