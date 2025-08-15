/**
 * Sleep function used to rate limit piston executions. default is 1000ms since PISTON API limits 5 requests per second.
 *
 * */
export function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
