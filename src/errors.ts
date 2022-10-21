/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
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