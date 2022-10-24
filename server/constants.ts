/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */

import {
  resolve
} from "path";

export enum Environment {
  Development,
  Staging,
  Production,
}

export const PORT = parseInt(process.env.PL_10_PORT ?? '8347');
export const HOSTNAME = process.env.PL_10_HOSTNAME ?? 'localhost';
export const MEDIA_DIR = process.env.PL_10_MEDIA_DIR ?? resolve('media');
export const MAX_FILE_NUMBER = parseInt(process.env.MAX_FILE_NUMBER ?? '10');

export const STATIC_DIR = resolve('public');
export const STYLESHEETS_DIR = resolve('public', 'app', 'styles');
export const SCRIPTS_DIR = resolve('public', 'app');

export enum MediaMimetype {
  MP3 = 'audio/mpeg',
  WAV = 'audio/wav',
  // FLAC = 'audio/flac',
}

export const ACCEPTED_MEDIA_MIMETYPES: string[] = Object.values(MediaMimetype);
