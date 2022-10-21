/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */

import {
  resolve
} from "path";

export const MEDIA_DIR = process.env.MEDIA_DIR ?? resolve('media');

export const STATIC_DIR = resolve('public');
export const STYLESHEETS_DIR = resolve('public', 'app', 'styles');
export const SCRIPTS_DIR = resolve('public', 'app');

export enum MediaMimetype {
  MP3 = 'audio/mpeg',
  WAV = 'audio/wav',
  // FLAC = 'audio/flac',
}

export const ACCEPTED_MEDIA_MIMETYPES: string[] = Object.values(MediaMimetype);
