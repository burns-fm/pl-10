/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */
import * as MusicMetadata from 'music-metadata';
import * as FileType from 'file-type';
import { Environment } from './constants';
import { FatalError } from "./errors";

export const loadMusicMetadata = async (): Promise<typeof MusicMetadata> => {
  const mm = await eval("import('music-metadata')");
  return mm;
}

export const loadFileTypesLib = async (): Promise<typeof FileType> => {
  const ft = await eval("import ('file-type')");
  return ft;
};

export const loadEnvironment = (): Environment => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV == undefined) {
    return Environment.Development;
  }

  if (!Object.values(Environment).includes(NODE_ENV as Environment)) {
    throw new FatalError('Environment (NODE_ENV)', `Invalid environment set: ${NODE_ENV}`);
  }

  return NODE_ENV as Environment;
}
