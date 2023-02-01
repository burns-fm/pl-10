/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */

import { readdir, readFile, stat } from "fs/promises";
import { resolve } from "path";
import { IAudioMetadata } from 'music-metadata';
import { ACCEPTED_MEDIA_MIMETYPES, DEBUG, IGNORE_FILES, MAX_FILE_NUMBER, MEDIA_DIR } from "../constants";
import { Store } from "../store";
import { loadMusicMetadata } from "../helpers";
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
   * Get a list of track summaries. {@link TrackSummary} objects contain just a few metadata properties
   * which makes this useful for sending a list of available tracks to a client/player.
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
   * Get the saved metadata for an individual track using the key
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
   * 
   * First it looks the track up in the store defined at the top of this class. Using the stored metadata,
   * it checks that the audio file actually exists and then returns an open stream with some attached file metadata.
   * 
   * If you want to know more about how this works, check out the NodeJS documentation:
   * @link https://nodejs.org/dist/latest-v18.x/docs/api/fs.html#fscreatereadstreampath-options
   */
  async createTrackStream(key: string, start?: number, end?: number): Promise<{ stream: ReadStream, track: Track, size: number, } | { error: string; }> {
    try {
      const track = this.store.get(key);

      if (!track) {
        throw new Error(`Track with key ${key} not found.`);
      }

      const filePath = resolve(MEDIA_DIR, track.filePath);
      const stats = await stat(filePath);

      return {
        stream: createReadStream(filePath, { start, end }),
        track,
        size: stats.size,
      };
    } catch(e) {
      console.error(e);
      return { error: `Error loading stream: ${e}` };
    }
  }

  /**
   * This will look up any compatible audio files in your configured media folder,
   * including the metadata.
   * @note This should run at startup only, and only run once.
   */
  loadMediaFiles = async (): Promise<void> => {
    if (this.hasLoaded) {
      console.warn(`The server has already loaded all of the media. This method cannot run more than once after the server has started.\nIf you want to reload the track list then reboot the server.`);
      return;
    }

    // If this method is being run, it resets the existing store completely.
    // It will generate an entirely new track list from the audio files in your media directory.
    if (this.store.size !== 0) {
      this.store.reset();
    }

    // Reads the media directory you set up and gets the list of files
    console.info(`Loading media from ${MEDIA_DIR} ...`);
    const { parseBuffer } = await loadMusicMetadata();
    let trackFileList = await readdir(MEDIA_DIR);

    // If there is a maximum number of files set, this will limit the list by that number.
    trackFileList = trackFileList.slice(0, MAX_FILE_NUMBER);
    
    // For each of the filenames in the list we have to put together the complete path to the audio file (1)
    // Using the full file path, we get the file metadata (2) and make sure it's valid. If it's not, we just skip it.
    // Then the file is read into a buffer (3). Using the buffer we read the ID3 and other metadata from the file (4)
    // Using the metadata we create a track "key" (5) and using the key, store the track file path and metadata in the store(6).
    for (const fileName of trackFileList) {
      if (IGNORE_FILES.includes(fileName)) {
        DEBUG && console.info(`Invalid file: ${fileName}. Skipping...`);
        continue;
      }

      const filePath = resolve(MEDIA_DIR, fileName); // (1)
      
      const mimetype = getMimeType(filePath) || 'application/octet-stream'; // (2)
      
      if (!ACCEPTED_MEDIA_MIMETYPES.includes(mimetype)) {
        DEBUG && console.info(`File not supported: ${filePath}. Unsupported mime type: ${mimetype}`);
        continue;
      }
      
      console.info(`Loading file: ${filePath}`);
      const file = await readFile(filePath); // (3)
      const trackInfo = await parseBuffer(file); // (4)

      const keySeed = this.getKeySeed(trackInfo); // (5)

      this.store.loadDataItem({ // (6)
        filePath,
        mimetype,
        ...trackInfo
      },
      keySeed,
      );
    }

    this.hasLoaded = true;
  };

  /**
   * This attempts to set up a repeatable hash. This will be used to calculate an MD5
   * and assumes you won't have more than one track with the exact same title and artist name in the metadata.
   * If you want more than one track with the same name, add additional info like "(Take 2)"
   * 
   * @note We want these to be the same every time the server starts so that the shareable links are consistent
   */
  private getKeySeed(trackInfo: IAudioMetadata): string {
    return `${trackInfo.format.duration}${trackInfo.common.title ?? Math.random()}:${trackInfo.common.artist ?? Math.random()}`;
  }

  /**
   * Reduces the full {@link Track} record down to a few essential properties.
   * @param key The key associated with the track
   * @param track The full track record
   */
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
