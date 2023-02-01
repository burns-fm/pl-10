/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */

/**
 * An error type to indicate an error that can't be resolved. It's best to only use this
 * for startup functions as throwing this error while running your server will stop the server entirely.
 * @caution This error will exit the running program completely, with an error status.
 */
export class FatalError extends Error {
  constructor(readonly ref: string, message ? : string) {
    super(message);

    console.error(this.name);
    console.error('Ref:', this.ref);
    console.error(message);
    process.exit(1);
  }
}