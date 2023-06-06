/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */
import * as MusicMetadata from 'music-metadata';
import * as FileType from 'file-type';
import { Environment } from './constants';
import { FatalError } from "./errors";
import { randomBytes } from 'crypto';

/**
 * Helper function to load the `music-metadata` NPM package.
 * This resolves some module issues. If you need the associated types,
 * you can import them directly but use this to load runtime library code.
 */
export const loadMusicMetadata = async (): Promise<typeof MusicMetadata> => {
  const mm = await eval("import('music-metadata')");
  return mm;
}

/**
 * Helper function to load the `file-type` NPM package.
 * This resolves some module issues. If you need the associated types,
 * you can import them directly but use this to load runtime library code.
 */
export const loadFileTypesLib = async (): Promise<typeof FileType> => {
  const ft = await eval("import('file-type')");
  return ft;
};

/**
 * Detect the current environment based on a variable and 
 * return the matching enum value.
 */
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

export class Auth {
  static generateUsername(): string {
    return Math.floor(Math.random() * 1e8).toString(16);
  }
  static generatePassword(): string {
    return randomBytes(16).toString('base64');
  }
}
