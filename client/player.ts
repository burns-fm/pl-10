/**
 * © 2022-2022 Burns Recording Company
 * Created: 23/10/2022
 */
import { IAudioMetadata } from 'music-metadata';
import * as Icons from './icons';
import { Processor } from './processor';
import { settings } from './helpers/settings';
// import { isSafari } from './helpers/checks';

type PaddedTimeValue = string | number;
type HHMMSS = `${PaddedTimeValue}:${PaddedTimeValue}:${PaddedTimeValue}`;

interface PlayerTransport {
  play: HTMLButtonElement;
  skip: HTMLButtonElement;
  rand: HTMLButtonElement;
  osc: HTMLButtonElement;
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
    osc: document.querySelector('.transport #btn--osc')!,
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
  };

  public random = (event: Event): void => {
    event.preventDefault();

    const randomKey = this.getRandomTrackKey();
    this.loadTrack(randomKey);
  };

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
  };

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
  };

  public toggleOsc = () => {
    const canvas = document.querySelector('canvas');

    if (!canvas) return;

    const settingsPath = 'oscilloscope.visible';

    if (canvas.hidden) {
      canvas.hidden = false;
      settings.set(settingsPath, true);
    } else {
      canvas.hidden = true;
      settings.set(settingsPath, false);
    }
  };

  public seek = (event: MouseEvent) => {
    if (!this.data.currentTrack || !this.data.currentTrack.duration) {
      throw new Error(`Unable to seek. No track loaded.`);
    }

    const wasPlaying = !this.audio.paused;
    this.audio.pause();

    const percent = event.offsetX / this.transport.position.offsetWidth;
    const { duration } = this.data.currentTrack;

    this.audio.currentTime = percent * duration;
    this.transport.position.value = percent;
    
    if (wasPlaying) {
      this.audio.play();
    }
  };

  /*** EVENTS & HANDLERS */
  private onPlay = () => {
    console.info(`Now playing: ${this.data.currentTrack?.title} - ${this.data.currentTrack?.artist}`);
  };

  private onPause = (_e: Event) => {
    this.transport.play.innerHTML = Icons.Play;
  };

  private onKeyPress = (e: KeyboardEvent) => {
    if (e.key === ' ' && e.target === document.body) {
      e.preventDefault();
      e.stopPropagation();

      this.togglePlayback();
    } else if (e.key === 'm') {
      this.toggleMute();
    }
  };

  private onVolumeUpdate = (event: MouseEvent): void => {
    const percent = event.offsetX / this.transport.volume.offsetWidth;
    this.setVolume(percent);
    this.transport.volume.value = percent;

    const vu = document.querySelector<HTMLCanvasElement>('#vu');
    if (vu) {
      vu.dataset.value = String(this.audio.volume * 10);
    }
  }

  private onUpdateTime = (_event: Event): void => {
    if (!this.data.currentTrack) {
      this.audio.pause();
      throw new Error(`Cannot update time. No track loaded.`);
    }

    this.display.currentTime.textContent = this.getTimeString(this.audio.currentTime);

    const percent = this.audio.currentTime / this.data.currentTrack.duration!; // TODO checkup on this - maybe store length from the stream response header
    this.transport.position.value = percent;
  };

  private onUpdateStreamSource = (): void => {
    this.display.trackInfo.title.innerHTML = this.data.currentTrack?.title ?? 'Unknown';
    this.display.trackInfo.album.innerHTML = this.data.currentTrack?.album ?? 'Unknown';
  };

  /*** SETUP & TEARDOWN */
  private setupEventListeners(): void {
    // Audio Events
    this.audio.addEventListener('timeupdate', this.onUpdateTime);
    this.audio.addEventListener('loadeddata', this.onUpdateStreamSource);
    this.audio.addEventListener('ended', this.onPause);
    this.audio.addEventListener('play', this.onPlay);

    // Transport
    this.transport.position.addEventListener('click', this.seek);
    this.transport.play.addEventListener('click', this.togglePlayback);
    this.transport.skip.addEventListener('click', this.skipTrack);
    this.transport.rand.addEventListener('click', this.random);
    this.transport.mute.addEventListener('click', this.toggleMute);
    this.transport.volume.addEventListener('click', this.onVolumeUpdate);

    // Visualizer / Oscilloscope
    const canvas = document.querySelector('canvas');
    if (canvas) {
      this.transport.osc.addEventListener('click', this.toggleOsc);
      // if (!isSafari()) {
      if (settings.get('oscilloscope.visible')) {
        canvas.hidden = false;
      } else {
        console.info(`Your settings were loaded from your last session and the oscilloscope (visualizer) was hidden last time you were here. If you want it back, just hit the button.`);
        canvas.hidden = true;
        // NOTE: commented this out with the safari line above. still working it out.
        //       It's the AudioContext situation with safari that actually needs fixed.
        //
        // this.transport.osc.setAttribute('hidden', 'true');
        // const oscContainer = document.querySelector<HTMLDivElement>('.oscilloscope')!;
        // oscContainer.style.opacity = '0';
      }
    }

    // Global
    window.addEventListener('keyup', this.onKeyPress);
  }

  private drawOscilloscope(): void {
    const osc = document.querySelector<HTMLCanvasElement>('#osc');
    if (osc) {
      const processor = new Processor(this.audio);
      processor.attachMeter(osc);
      this.audio.onplay = _ => {
        processor.audioContext.resume();
      };
    }
  }

  private async initialize(): Promise<void> {
    this.audio = document.createElement('audio');
    this.transport.play.innerHTML = Icons.Play;
    this.transport.skip.innerHTML = Icons.Skip;
    this.transport.rand.innerHTML = Icons.Shuffle;
    this.transport.osc.innerHTML = Icons.Oscilloscope;
    this.transport.mute.innerHTML = Icons.VolumeFull;

    this.data.trackList = await this.getTrackList();

    this.setupEventListeners();
    this.setVolume(DEFAULT_VOLUME);

    // Load initial track
    const trackKey = this.getTrackIdFromUrl() ?? this.getRandomTrackKey();

    this.loadTrack(trackKey);

    // Post processing & metering
    this.drawOscilloscope();
  }

  private getTrackIdFromUrl(url: string = window.location.href): string | null {
    const u = new URL(url);
    const key = u.searchParams.get('t')?.trim();

    if (!key) {
      return null;
    }

    const keyInTrackList = Boolean(this.data.trackList?.find((track) => track.key === key));

    if (key.length === 0 || !keyInTrackList) {
      console.error(`Invalid key in URL. Loading a random track instead.`);
      alert(`Couldn't find the track you're trying to load. Loading a random track instead.`);
      return null;
    }

    return key;
  }
}
