/** A helper only tests load: it sets the environment up and says what it did. */
export function useFreePort(): string {
  process.env.PORT = "0";
  console.info("the tests listen on a free port");
  return process.env.PORT;
}
