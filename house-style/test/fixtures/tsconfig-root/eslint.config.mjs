/**
 * A repo that imports typescript-eslint for a typed block of its own after the house
 * config, the way a NestJS backend does. Reading one of typescript-eslint's configs here
 * makes this folder a candidate tsconfigRootDir beside the house copy's folder, so the
 * parser can't guess a root for the files linted without types.
 */
import tseslint from "typescript-eslint";
import { houseStyle } from "../../../eslint.config.js";

export default [
  ...houseStyle({ root: import.meta.dirname }),
  {
    name: "fixture/backend",
    files: ["backend/**/*.ts"],
    rules: { ...tseslint.configs.recommendedTypeChecked.at(-1)?.rules },
  },
];
