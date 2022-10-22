/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */

import { readdir, readFile, stat } from "fs/promises";
import { extname, resolve } from "path";
import { IAudioMetadata } from 'music-metadata';
import { MediaMimetype, MEDIA_DIR } from "../constants";
import { Store } from "../store";
import { loadFileTypesLib, loadMusicMetadata } from "../helpers";
import { createReadStream, ReadStream, statSync } from "fs";

export type Track = IAudioMetadata & { filePath: string };

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

  public async getTrackList(): Promise<TrackSummary[]> {
    // TODO make this a quick hash comparison of the keys or something.
    // But really, since the tracks are loaded once at startup this shouldn't 
    // need changed until that other process is changed.
    if (this.cachedTrackList && this.cachedTrackList.length > 0) return this.cachedTrackList;

    const trackList = [];

    for (const key of this.store.keys) {
      const track = this.store.get(key);

      if (!track) {
        console.warn(`No track found in store for key ${key}`);
        continue;
      }
      const { fileTypeFromFile } = await loadFileTypesLib();
      const ft = await fileTypeFromFile(track.filePath);
      const summary = this.toTrackSummary(key, track, ft?.mime ?? 'application/octet-stream');
      trackList.push(summary);
    }

    this.cachedTrackList = trackList;
    return this.cachedTrackList;
  }

  public async createTrackStream(key: string): Promise<{ stream: ReadStream, track: Track, size: number, }> {
    const track = this.store.get(key);

    if (!track) {
      throw new Error(`Track with key ${key} not found.`);
    }

    const filePath = resolve(MEDIA_DIR, track.filePath);
    const stats = await stat(filePath);

    return {
      stream: createReadStream(filePath),
      track,
      size: stats.size,
    }
  }

  public loadMediaFiles = async (): Promise<void> => {
    if (this.store.size !== 0) {
      this.store.reset();
    }

    console.log(`Loading media from ${MEDIA_DIR} ...`);
    const { parseBuffer } = await loadMusicMetadata();
    let trackFileList = await readdir(MEDIA_DIR);

    trackFileList = trackFileList.filter((dirItem) => {
      if (dirItem === '.DS_Store') return false;

      const ext = extname(dirItem).toUpperCase().slice(1);

      return Object.keys(MediaMimetype).includes(ext);
    });

    for (const fileName of trackFileList) {
      const filePath = resolve(MEDIA_DIR, fileName);

      console.info(`Loading file: ${filePath}`);

      const file = await readFile(filePath);
      const trackInfo = await parseBuffer(file);
      this.store.loadDataItem({
        filePath,
        ...trackInfo
      });
    }
  }

  private toTrackSummary(key: string, track: Track, mimetype: string): TrackSummary {
    return {
      key,
      title: track.common.title,
      artist: track.common.artist,
      album: track.common.album,
      genre: track.common.genre,
      duration: track.format.duration,
      lossless: track.format.lossless,
      mimetype,
    };
  }
}
