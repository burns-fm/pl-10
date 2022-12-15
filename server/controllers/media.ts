/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */

import { readdir, readFile, stat } from "fs/promises";
import { resolve } from "path";
import { IAudioMetadata } from 'music-metadata';
import { ACCEPTED_MEDIA_MIMETYPES, DEBUG, IGNORE_FILES, MAX_FILE_NUMBER, MEDIA_DIR } from "../constants";
import { Store } from "../store";
import { loadFileTypesLib, loadMusicMetadata } from "../helpers";
import { createReadStream, ReadStream } from "fs";
import { lookup as getMimeType } from 'mime-types';

export type Track = IAudioMetadata & { filePath: string; mimetype: string; };

export interface TrackSummary {
  key: string;
  title: Track['common']['title'];
  artist: Track['common']['artist'];
  album: Track['common']['album'];
  genre: Track['common']['genre'];
  duration: Track['format']['duration'];
  mimetype: string;
  lossless: Track['format']['lossless'];
}

export class MediaController {
  private readonly store = new Store<Track>('tape-deck');
  private cachedTrackList:  TrackSummary[] | null = null;
  private hasLoaded = false;

  /**
   * Get a list of track summaries for displaying a track list,
   * for loading the track listing into the player on page load,
   * and so on.
   */
  async getTrackList(): Promise<TrackSummary[]> {
    if (this.cachedTrackList && this.cachedTrackList.length > 0)
      return this.cachedTrackList;

    const trackList = [];

    for (const key of this.store.keys) {
      const track = this.store.get(key);

      if (!track) {
        console.warn(`No track found in store for key ${key}`);
        continue;
      }
   
      const summary = this.toTrackSummary(key, track);
      trackList.push(summary);
    }

    this.cachedTrackList = trackList;
    return this.cachedTrackList;
  }

  /**
   * Get the saved metadata for an individual track
   */
  async getTrack(key: string): Promise<Track> {
    const track = this.store.get(key);

    if (!track) {
      throw new Error(`Track not found: ${key}`);
    }

    return track;
  }

  /**
   * Creates a read stream for the requested track by the key.
   */
  async createTrackStream(key: string, start?: number): Promise<{ stream: ReadStream, track: Track, size: number, }> {
    const track = this.store.get(key);

    if (!track) {
      throw new Error(`Track with key ${key} not found.`);
    }

    const filePath = resolve(MEDIA_DIR, track.filePath);
    const stats = await stat(filePath);

    return {
      stream: createReadStream(filePath, { start }),
      track,
      size: stats.size,
    }
  }

  /**
   * This will look up any compatible audio files in your configured media folder,
   * including the metadata.
   * @note This should run at startup only, and only run once unless it is adapted to that use.
   */
  loadMediaFiles = async (): Promise<void> => {
    if (this.hasLoaded) {
      console.warn(`The server has already loaded all of the media. This method cannot run more than once after the server has started.\nIf you want to reload the track list then reboot the server.`);
      return;
    }

    if (this.store.size !== 0) {
      this.store.reset();
    }

    console.info(`Loading media from ${MEDIA_DIR} ...`);
    const { parseBuffer } = await loadMusicMetadata();
    let trackFileList = await readdir(MEDIA_DIR);

    trackFileList = trackFileList.slice(0, MAX_FILE_NUMBER);

    for (const fileName of trackFileList) {
      if (IGNORE_FILES.includes(fileName)) {
        DEBUG && console.info(`Invalid file: ${fileName}. Skipping...`);
        continue;
      }

      const filePath = resolve(MEDIA_DIR, fileName);
      
      const mimetype = getMimeType(filePath) || 'application/octet-stream';
      
      if (!ACCEPTED_MEDIA_MIMETYPES.includes(mimetype)) {
        DEBUG && console.info(`File not supported: ${filePath}. Unsupported mime type: ${mimetype}`);
        continue;
      }
      
      console.info(`Loading file: ${filePath}`);
      const file = await readFile(filePath);
      const trackInfo = await parseBuffer(file);

      const keySeed = this.getKeySeed(trackInfo);

      this.store.loadDataItem({
        filePath,
        mimetype,
        ...trackInfo
      },
      keySeed,
      );
    }

    this.hasLoaded = true;
  };

  private getKeySeed(trackInfo: IAudioMetadata): string {
    // This attempts to set up a repeatable hash. This will be used to calculate an MD5
    // and assumes you won't have more than one track with the exact same title and artist name in the metadata.
    // If you want more than one track with the same name, add additional info like "(Take 2)"
    //
    // We want these to be the same every time the server starts so that the shareable links are consistent
    return `${trackInfo.format.duration}${trackInfo.common.title ?? Math.random()}:${trackInfo.common.artist ?? Math.random()}`;
  }

  private toTrackSummary(key: string, track: Track): TrackSummary {
    return {
      key,
      title: track.common.title,
      artist: track.common.artist,
      album: track.common.album,
      genre: track.common.genre,
      duration: track.format.duration,
      lossless: track.format.lossless,
      mimetype: track.mimetype,
    };
  }
}
