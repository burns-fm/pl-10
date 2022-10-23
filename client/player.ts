/**
 * © 2022-2022 Burns Recording Company
 * Created: 23/10/2022
 */
import { IAudioMetadata } from 'music-metadata';
import * as Icons from './icons';

type PaddedTimeValue = string | number;
type HHMMSS = `${PaddedTimeValue}:${PaddedTimeValue}:${PaddedTimeValue}`;

interface PlayerTransport {
  play: HTMLButtonElement;
  skip: HTMLButtonElement;
  rand: HTMLButtonElement;
  mute: HTMLButtonElement;
  position: HTMLProgressElement;
  volume: HTMLProgressElement;
}

interface PlayerDisplay {
  currentTime: HTMLTimeElement;
  duration: HTMLTimeElement | null | undefined;
  trackInfo: {
    title: HTMLMarqueeElement | HTMLDivElement;
    album: HTMLParagraphElement;
  };
}

interface PlayerData {
  trackList: TrackSummary[] | null;
  currentTrack: TrackSummary | null;
  lastVolume: number;
}

export interface TrackSummary {
  key: string;
  title: IAudioMetadata['common']['title'];
  artist: IAudioMetadata['common']['artist'];
  album: IAudioMetadata['common']['album'];
  genre: IAudioMetadata['common']['genre'];
  duration: IAudioMetadata['format']['duration'];
  mimetype: string;
  lossless: IAudioMetadata['format']['lossless'];
}

export const DEFAULT_VOLUME = 0.75;

export class Player {
  transport: PlayerTransport = {
    play: document.querySelector('.transport #btn--play')!,
    skip: document.querySelector('.transport #btn--skip')!,
    rand: document.querySelector('.transport #btn--rand')!,
    mute: document.querySelector('.transport #btn--mute')!,
    position: document.querySelector('.transport #position')!,
    volume: document.querySelector('.transport #volume')!,
  };

  display: PlayerDisplay = {
    currentTime: document.querySelector('.time .current-time')!,
    duration: document.querySelector<HTMLTimeElement>('.time .duration'),
    trackInfo: {
      title: document.querySelector('.track-info #title')!,
      album: document.querySelector('.track-info #album')!,
    },
  };

  data: PlayerData = {
    trackList: null,
    currentTrack: null,
    lastVolume: DEFAULT_VOLUME,
  };

  audio: HTMLAudioElement;

  constructor() {
    this.initialize().catch((error) => {
      alert(`Something went wrong initializing the player`);
      console.warn(`Error initialling player:`);
      console.error(error);
    });
  }

  public loadTrack(key: string): void {
    try {
      this.data.currentTrack = this.getTrackByKey(key);

      const streamUrl = `/stream/${key}`;
      const resume = !this.audio.paused;

      this.audio.pause();
      this.audio.src = streamUrl;

      this.resetPosition();
      this.resetTime();

      if (resume) {
        this.audio.play();
      }
    } catch(loadAudioError) {
      alert(`Unable to load stream.`);
    }
  }
  
  /*** GENERAL FUNCTIONS  */
  private getRandomTrackKey(): string {
    if (!this.data.trackList) {
      const error = `Unable to get random key. No track list loaded.`;
      throw new Error(error);
    }
    const rand = Math.floor((Math.random() * Date.now()) % this.data.trackList?.length);
    return this.data.trackList[rand]?.key;
  }

  private async getTrackList(): Promise<TrackSummary[]> {
    const res = await fetch('/stream');
    const list = await res.json();

    console.log(list);
    return list;
  }

  private getTrackByKey(key: string): TrackSummary {
    const summary = this.data.trackList?.find(t => t.key === key);

    if (!summary) {
      throw new Error(`Unable to find track with key ${key}`);
    }
    
    return summary;
  }

  private getTimeString(time: number): HHMMSS  {
    if (!time || time === 0) {
      return `00:00:00`;
    }

    const hour = Math.floor(time / 3600) % 25;
    const min = Math.floor(time / 60) % 60;
    const sec = Math.floor(time % 60);

    const hh = `${hour}`.padStart(2, '0');
    const mm = `${min}`.padStart(2, '0');
    const ss = `${sec}`.padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
  }

  resetTime(): void {
    this.display.currentTime.textContent = this.getTimeString(0);
  }

  resetPosition(): void {
    this.transport.position.value = 0;
  }

  /*** TRANSPORT FUNCTIONS */
  public togglePlayback = (event?: MouseEvent): void => {
    event?.preventDefault();

    if (this.audio.paused) {
      this.audio.play();
      this.transport.play.innerHTML = Icons.Pause;
    } else {
      this.audio.pause();
      this.transport.play.innerHTML = Icons.Play;
    }
  };

  public skipTrack = (event: MouseEvent): void => {
    event.preventDefault();

    if (!this.data.trackList) {
      throw new Error(`Unable to skip track. No track list loaded.`);
    }

    const currentIndex = this.data.trackList?.findIndex(t => t.key === this.data.currentTrack?.key) ?? 0;
    const nextTrack = this.data.trackList[currentIndex + 1];

    let nextKey;
    if (nextTrack) {
      nextKey = nextTrack.key;
    } else {
      nextKey = this.data.trackList[0].key;
    }

    this.loadTrack(nextKey);
  }

  public random = (event: Event): void => {
    event.preventDefault();

    const randomKey = this.getRandomTrackKey();
    this.loadTrack(randomKey);
  }

  public setVolume = (n = DEFAULT_VOLUME) => {
    // Assert the volume is between 0 and 1.
    const v = n < 0 ? 0 : n > 1 ? 1 : n;

    this.audio.volume = v;
    this.transport.volume.value = v;
    
    if (n === 0) {
      this.audio.muted = true;
    } else {
      this.audio.muted = false;
    }
  }

  public toggleMute = () => {
    if (this.audio.muted || this.audio.volume === 0) {
      this.setVolume(this.data.lastVolume);
      this.audio.muted = false;
      this.transport.mute.innerHTML = Icons.VolumeFull;
    } else {
      this.data.lastVolume = this.audio.volume;
      this.setVolume(0);
      this.audio.muted = true;
      this.transport.mute.innerHTML = Icons.VolumeZero;
    }
  }

  public seek = (event: MouseEvent) => {
    if (!this.data.currentTrack || !this.data.currentTrack.duration) {
      throw new Error(`Unable to seek. No track loaded.`);
    }
    const percent = event.offsetX / this.transport.position.offsetWidth;
    const { duration } = this.data.currentTrack;
    this.audio.currentTime = percent * duration;
    this.transport.position.value = percent;
  }

  /*** EVENTS & HANDLERS */
  private handleKeypress = (e: KeyboardEvent) => {
    if (e.key === ' ' && e.target === document.body) {
      e.preventDefault();
      e.stopPropagation();

      this.togglePlayback();
    } else if (e.key === 'm') {
      this.toggleMute();
    }
  }

  private onVolumeUpdate = (event: MouseEvent): void => {
    const percent = event.offsetX / this.transport.volume.offsetWidth;
    this.setVolume(percent);
    this.transport.volume.value = percent;
  }

  private onUpdateTime = (_event: Event): void => {
    if (!this.data.currentTrack) {
      this.audio.pause();
      throw new Error(`Cannot update time. No track loaded.`);
    }

    this.display.currentTime.textContent = this.getTimeString(this.audio.currentTime);

    const percent = this.audio.currentTime / this.data.currentTrack.duration!; // TODO checkup on this - maybe store length from the stream response header
    this.transport.position.value = percent;
  }

  private onUpdateStreamSource = (): void => {
    this.display.trackInfo.title.innerHTML = this.data.currentTrack?.title ?? 'Unknown';
    this.display.trackInfo.album.innerHTML = this.data.currentTrack?.album ?? 'Unknown';
  }

  /*** SETUP & TEARDOWN */
  private setupEventListeners(): void {
    // Audio Events
    this.audio.addEventListener('timeupdate', this.onUpdateTime);
    this.audio.addEventListener('loadeddata', this.onUpdateStreamSource);

    // Transport
    this.transport.position.addEventListener('click', this.seek);
    this.transport.play.addEventListener('click', this.togglePlayback);
    this.transport.skip.addEventListener('click', this.skipTrack);
    this.transport.rand.addEventListener('click', this.random);
    this.transport.mute.addEventListener('click', this.toggleMute);
    this.transport.volume.addEventListener('click', this.onVolumeUpdate);

    // Global
    window.addEventListener('keyup', this.handleKeypress);
  }

  private async initialize(): Promise<void> {
    this.audio = document.createElement('audio');
    this.transport.play.innerHTML = Icons.Play;
    this.transport.skip.innerHTML = Icons.Skip;
    this.transport.rand.innerHTML = Icons.Shuffle;
    this.transport.mute.innerHTML = Icons.VolumeFull;

    this.data.trackList = await this.getTrackList();

    this.setupEventListeners();
    this.setVolume(DEFAULT_VOLUME);

    // Load initial track
    const randomTrackKey = this.getRandomTrackKey();
    this.loadTrack(randomTrackKey);
  }
}
