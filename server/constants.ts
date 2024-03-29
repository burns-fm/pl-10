/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */

import {
  resolve
} from "path";

export enum Environment {
  Test = 'test',
  Development = 'development',
  Production = 'production',
}

export const DEBUG = process.env.DEBUG == 'true';

export const PORT = process.env.PL_10_PORT ? parseInt(process.env.PL_10_PORT) : 8347;
export const HOSTNAME = process.env.PL_10_HOSTNAME ?? 'localhost';
export const MEDIA_DIR = process.env.PL_10_MEDIA_DIR ?? resolve('media');
export const MAX_FILE_NUMBER = process.env.MAX_FILE_NUMBER ? parseInt(process.env.MAX_FILE_NUMBER) : 10;

export const STATIC_DIR = resolve('public');
export const STYLESHEETS_DIR = resolve('public', 'app', 'styles');
export const SCRIPTS_DIR = resolve('public', 'app');

export const PageText = {
  Title: process.env.PL_10_PAGE_TITLE ?? 'BRC',
  Subtitle: process.env.PL_10_PAGE_SUBTITLE ?? 'PL-10',
  SupportingText: process.env.PL_10_SUPPORTING_TEXT ?? 'Free & open-source embed-able audio streaming server and web player',
  Copyright: process.env.PL_10_COPYRIGHT ?? 'Burns Recording Company',
};

/**
 * ALLOWED MIME TYPES
 * 
 * I you want to allow the server to pick up other kinds of files besides
 * MP3, you have to set them here with their Mime type.
 * @see https://github.com/github/mime-types/blob/master/lib/mime/types/audio
 * 
 * Be careful here—some audio file types are not supported by the front-end player yet.
 * Here are several additional resources:
 * @see https://en.wikipedia.org/wiki/HTML5_audio#Supported_audio_coding_formats
 * @see https://caniuse.com/?search=audio%20format
 * 
 * @note ON TRACK METADATA: It's also worth noting that the media library metadata
 * depends upon the metadata included in the audio file itself. So PCM files like
 * WAV that don't support metadata tags won't be able to display information
 * in the player.
 * If they're supported by the browser, they should still play ok, though!
 * 
 */
export enum MediaMimetype {
  AAC = 'audio/aac',
  // AACP = 'audio/aacp',
  // FLAC = 'audio/flac',
  // XFLAC = 'audio/x-flac',
  MP3 = 'audio/mpeg',
  MP4 = 'audio/mp4',
  OGG = 'audio/ogg',
  // WEBM = 'audio/webm',
  // WAV = 'audio/wav',
}

export const ACCEPTED_MEDIA_MIMETYPES: string[] = Object.values(MediaMimetype);
export const IGNORE_FILES = [
  '.DS_Store',
  '.gitkeep',
  '.gitignore',
];

export const USE_PREVIEW_AUTH = Boolean(process.env['PL_10_PREVIEW_AUTH']);
export const USE_HOMEPAGE = Boolean(process.env['PL_10_USE_HOMEPAGE']);
