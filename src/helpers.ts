/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */
import * as MusicMetadata from 'music-metadata';

import { FatalError } from "./errors";

export enum Environment {
  Development,
  Staging,
  Production,
}

export const loadMusicMetadata = async (): Promise<typeof MusicMetadata> => {
  const mm = await eval("import('music-metadata')");
  return mm;
}

export const loadEnvironment = (): Environment => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV == undefined) {
    return Environment.Development;
  }

  const env: Environment = parseInt(NODE_ENV);

  if (!Object.values(Environment).includes(env)) {
    throw new FatalError('Environment (NODE_ENV)', `Invalid environment set: ${NODE_ENV}`);
  }

  return env;
}
