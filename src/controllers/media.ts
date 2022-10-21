/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */

import { readdir, readFile } from "fs/promises";
import { resolve } from "path";
import { IAudioMetadata } from 'music-metadata';
import { MEDIA_DIR } from "../constants";
import { Store } from "../db";
import { loadMusicMetadata } from "../helpers";
import { createReadStream, ReadStream } from "fs";

export type Track = IAudioMetadata & { filePath: string };

export interface TrackSummary {
  key: string;
  title: Track['common']['title'];
  artist: Track['common']['artist'];
  album: Track['common']['album'];
  genre: Track['common']['genre'];
  duration: Track['format']['duration'];
  lossless: Track['format']['lossless'];
}

export class Media {
  private readonly store = new Store<Track>('tape-deck');

  public getTrackList(): TrackSummary[] {
    const trackList = [];
    for (const key of this.store.keys) {
      const track = this.store.get(key);

      if (!track) continue;

      const summary = this.toTrackSummary(key, track);
      trackList.push(summary);
    }

    return trackList;
  }

  public createTrackStream(key: string): ReadStream {
    const track = this.store.get(key);

    if (!track) {
      throw new Error(`Track with key ${key} not found.`);
    }

    const filePath = resolve(MEDIA_DIR, track.filePath);
    return createReadStream(filePath);
  }

  public loadMediaFiles = async (): Promise<void> => {
    if (this.store.size !== 0) {
      this.store.reset();
    }

    const { parseBuffer } = await loadMusicMetadata();
    const trackFileList = await readdir(MEDIA_DIR);

    for (const fileName of trackFileList) {
      const filePath = resolve(MEDIA_DIR, fileName);
      const file = await readFile(filePath);
      const trackInfo = await parseBuffer(file);
      this.store.loadDataItem({
        filePath,
        ...trackInfo
      });
    }
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
    };
  }
}
