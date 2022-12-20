/**
 * © 2022-2022 Burns Recording Company
 * Created: 23/10/2022
 */
import { IAudioMetadata } from 'music-metadata';
import * as Icons from './icons';
import { Scope } from './scope';
import { settings } from './helpers/settings';
import { copyText, isSafari } from './helpers/checks';

type PaddedTimeValue = string | number;
type HHMMSS = `${PaddedTimeValue}:${PaddedTimeValue}:${PaddedTimeValue}`;

interface PlayerTransport {
  play: HTMLButtonElement;
  skip: HTMLButtonElement;
  rand: HTMLButtonElement;
  osc: HTMLButtonElement;
  shr: HTMLButtonElement;
  mute: HTMLButtonElement;
  position: HTMLProgressElement;
  volume: HTMLProgressElement;
}

interface PlayerDisplay {
  currentTime: HTMLTimeElement;
  main: HTMLDivElement;
  meta: HTMLDivElement;
  duration: HTMLTimeElement | null | undefined;
  pages: {
    volumeSlider: HTMLDivElement | null | undefined;
  };
  trackInfo: {
    title: HTMLMarqueeElement | HTMLDivElement;
    album: HTMLParagraphElement;
  };
  opts: {
    showVolumeSlider: boolean;
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
  private createVolumeControl = () => {
    const slider = document.createElement('progress');
      slider.classList.add('volume');
      slider.id = 'volume';
      slider.title = 'Adjust volume';
    return slider;
  };

  transport: PlayerTransport = {
    play: document.querySelector('.transport #btn--play')!,
    skip: document.querySelector('.transport #btn--skip')!,
    rand: document.querySelector('.transport #btn--rand')!,
    osc: document.querySelector('.transport #btn--osc')!,
    shr: document.querySelector('.transport #btn--shr')!,
    mute: document.querySelector('.transport #btn--mute')!,
    position: document.querySelector('.display #position')!,
    volume: this.createVolumeControl(),
  };

  display: PlayerDisplay = {
    currentTime: document.querySelector('.time .current-time')!,
    duration: document.querySelector<HTMLTimeElement>('.time .duration'),
    main: document.querySelector<HTMLDivElement>('.display')!,
    meta: document.querySelector<HTMLDivElement>('.display .meta')!,
    pages: {
      volumeSlider: null,
    },
    trackInfo: {
      title: document.querySelector('.track-info #title')!,
      album: document.querySelector('.track-info #album')!,
    },
    opts: {
      showVolumeSlider: false,
    },
  };

  data: PlayerData = {
    trackList: null,
    currentTrack: null,
    lastVolume: DEFAULT_VOLUME,
  };

  audio: HTMLAudioElement;
  scope: Scope;

  constructor() {
    this.initialize().catch((error) => {
      alert(`Something went wrong initializing the player`);
      console.warn(`Error initialling player:`);
      console.error(error);
    });
  }

  loadTrack(key: string): void {
    try {
      this.data.currentTrack = this.getTrackByKey(key);

      const streamUrl = `/stream/${key}`;
      const resume = !this.audio.paused;

      this.audio.pause();
      this.audio.setAttribute('src', streamUrl);
      this.audio.setAttribute('type', this.data.currentTrack.mimetype);

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
    let randomKey = this.data.trackList[rand]?.key;

    if (randomKey === this.data.currentTrack?.key) {
      return this.getRandomTrackKey();
    }

    return randomKey;
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
  togglePlayback = async (event?: MouseEvent): Promise<void> => {
    event?.preventDefault();

    if (this.audio.paused) {
      this.play();
      await this.scope.audioContext?.resume();
    } else {
      this.pause();
    }
  };

  play = async () => {
    await this.audio.play();
    if (settings.get('oscilloscope.visible') as boolean) {
      await this.scope.audioContext?.resume();
      this.drawOscilloscope();
    }
  };

  pause = () => {
    this.audio.pause();
    this.clearOscilloscope();
  };

  skipTrack = async (event: MouseEvent): Promise<void> => {
    event.preventDefault();
    
    if (!this.data.trackList) {
      throw new Error(`Unable to skip track. No track list loaded.`);
    }
    
    const currentIndex = this.data.trackList?.findIndex(t => t.key === this.data.currentTrack?.key) ?? 0;
    const nextTrack = this.data.trackList[currentIndex + 1];
    
    let nextKey: string;
    if (nextTrack) {
      nextKey = nextTrack.key;
    } else {
      nextKey = this.data.trackList[0].key;
    }
    
    if (!this.scope.audioContext) { this.scope.audioContext = new AudioContext(); }
    await this.scope.audioContext?.resume();
    this.loadTrack(nextKey);
  };

  random = async (event: Event): Promise<void> => {
    event.preventDefault();

    const randomKey = this.getRandomTrackKey();
    if (!this.scope.audioContext) { this.scope.audioContext = new AudioContext(); }
    await this.scope.audioContext?.resume();
    this.loadTrack(randomKey);
  };

  setVolume = (n = DEFAULT_VOLUME) => {
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

  toggleMute = () => {
    if (this.audio.muted || this.audio.volume === 0) {
      this.setVolume(this.data.lastVolume);
      this.audio.muted = false;
      this.transport.mute.innerHTML = Icons.VolumeFull;
      if (!this.display.meta.hidden) {
        this.transport.mute.classList.remove('active');
      }
    } else {
      this.data.lastVolume = this.audio.volume;
      this.setVolume(0);
      this.audio.muted = true;
      this.transport.mute.innerHTML = Icons.VolumeZero;
    }

    if (this.display.pages.volumeSlider) {
      this.transport.mute.classList.add('active');
      this.display.pages.volumeSlider.querySelector('#current-volume')!.textContent = `${Math.round(this.audio.volume * 100)}`;
    }
  };

  toggleVolumeSlider = () => {
    const sliderContainerId = 'volume-display';

    const hideMainDisplay = (v: boolean) => {
      this.display.meta.hidden = v;
      this.display.opts.showVolumeSlider = v;
    };
    
    if (!this.display.pages.volumeSlider) {
      this.transport.mute.classList.add('active');
      hideMainDisplay(true);
      
      this.display.pages.volumeSlider = document.createElement('div');
      this.display.pages.volumeSlider.id = sliderContainerId;
      this.display.pages.volumeSlider.classList.add('page');
      this.display.pages.volumeSlider.innerHTML = `<h2>VOLUME</h2>`;
      this.display.pages.volumeSlider.innerHTML += `<span id="current-volume">${Math.round(this.audio.volume * 100)}</span>`
      this.display.pages.volumeSlider.appendChild(this.transport.volume);
      this.display.main.appendChild(this.display.pages.volumeSlider);

      const muteButton = document.createElement('button');
      muteButton.textContent = 'TOGGLE MUTE';
      muteButton.addEventListener('click', this.toggleMute);
      this.display.pages.volumeSlider.appendChild(muteButton);

    } else {
      this.display.pages.volumeSlider.remove();
      this.display.pages.volumeSlider = null;
      
      hideMainDisplay(false);
      this.transport.mute.classList.remove('active');
    }
  };

  toggleOsc = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) 
    return;
    const settingsPath = 'oscilloscope.visible';

    // if (isSafari()) {
    //   alert(`Sorry, your browser doesn't support the visualizer yet.`);
    //   canvas.hidden = true;
    //   settings.set(settingsPath, false);
    //   this.transport.osc.classList.remove('active');
    //   return;
    // }

    if (canvas.hidden) {
      canvas.hidden = false;
      settings.set(settingsPath, true);
      this.transport.osc.classList.add('active');
    } else {
      canvas.hidden = true;
      settings.set(settingsPath, false);
      this.transport.osc.classList.remove('active');
    }
  };

  seek = async (event: MouseEvent): Promise<void> => {
    if (!this.data.currentTrack || !this.data.currentTrack.duration) {
      throw new Error(`Unable to seek. No track loaded.`);
    }

    const wasPlaying = !this.audio.paused;
    
    if (wasPlaying) {
      this.pause();
    }

    const percent = event.offsetX / this.transport.position.offsetWidth;
    const { duration } = this.data.currentTrack;

    this.audio.currentTime = percent * duration;
    this.transport.position.value = parseFloat(`${percent}`);
    
    if (wasPlaying) {
      if (!this.scope.audioContext) { this.scope.audioContext = new AudioContext(); }
      await this.scope.audioContext?.resume();
      this.play();
    }
  };

  getShareLink(): string {
    if (!this.data.currentTrack) {
      return window.location.href;
    }
    return `${window.location.href}?t=${this.data.currentTrack.key}`;
  }

  copyShareLink = async (): Promise<void> => {
    const link = this.getShareLink();
    copyText(link);
  }

  /*** EVENTS & HANDLERS */
  private onPlay = () => {
    console.info(`Now playing: ${this.data.currentTrack?.title} - ${this.data.currentTrack?.artist}`);
    this.transport.play.innerHTML = Icons.Pause;
    this.transport.play.classList.add('active');
  };

  private onPause = (_e: Event) => {
    this.transport.play.innerHTML = Icons.Play;
    this.transport.play.classList.remove('active');
  };

  private onKeyPress = async (e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    switch (e.key) {
      case ' ':
        await this.togglePlayback(e as any);
        break;
      case 'm':
        this.toggleMute();
        break;
      case 'o':
        this.toggleOsc();
        break;
      case 'v':
        this.toggleVolumeSlider();
        break;
      default:
        return;
    }
  };

  private onVolumeUpdate = (event: MouseEvent): void => {
    const percent = event.offsetX / this.transport.volume.offsetWidth;
    this.setVolume(percent);
    this.transport.volume.value = percent;

    const vu = document.querySelector<HTMLCanvasElement>('#vu');
    if (vu) {
      vu.dataset.value = String(this.audio.volume * 20);
    }

    if (this.display.pages.volumeSlider) {
      this.display.pages.volumeSlider.querySelector('#current-volume')!.textContent = `${Math.round(this.audio.volume * 100)}`;
    }
  }

  private onUpdateTime = (_event: Event): void => {
    if (!this.data.currentTrack) {
      this.audio.pause();
      throw new Error(`Cannot update time. No track loaded.`);
    }

    this.display.currentTime.textContent = this.getTimeString(this.audio.currentTime);

    const percent = this.audio.currentTime / this.data.currentTrack.duration!; // TODO checkup on this - maybe store length from the stream response header
    this.transport.position.value = parseFloat(`${percent}`);
  };

  private onUpdateStreamSource = (): void => {
    const title = this.data.currentTrack?.title ?? 'Unknown';
    this.display.trackInfo.title.innerHTML = title;
    this.display.trackInfo.title.title = title;
    this.display.trackInfo.album.innerHTML = this.data.currentTrack?.album ?? 'Unknown';
  };

  /*** SETUP & TEARDOWN */
  private setupEventListeners(): void {
    // Audio Events
    this.audio.addEventListener('timeupdate', this.onUpdateTime);
    this.audio.addEventListener('loadedmetadata', this.onUpdateStreamSource);
    this.audio.addEventListener('ended', this.onPause);
    this.audio.addEventListener('pause', this.onPause);
    this.audio.addEventListener('play', this.onPlay);

    // Transport
    this.transport.position.addEventListener('click', this.seek);
    this.transport.position.addEventListener('touchend', (e) => this.seek(e as any));
    this.transport.play.addEventListener('click', this.togglePlayback);
    this.transport.skip.addEventListener('click', this.skipTrack);
    this.transport.rand.addEventListener('click', this.random);
    this.transport.mute.addEventListener('click', this.toggleVolumeSlider);
    this.transport.volume.addEventListener('click', this.onVolumeUpdate);
    this.transport.shr.addEventListener('click', this.copyShareLink);

    this.display.trackInfo.title.addEventListener('mouseover', (e) => {
      (e.target as HTMLMarqueeElement).stop();
    });

    this.display.trackInfo.title.addEventListener('mouseout', e => {
      (e.target as HTMLMarqueeElement).start();
    });

    // Visualizer / Oscilloscope
    const canvas = document.querySelector('canvas');
    if (canvas) {
      this.transport.osc.addEventListener('click', this.toggleOsc);

      // if (!isSafari()) {
        if (settings.get('oscilloscope.visible')) {
          this.transport.osc.classList.add('active');
          canvas.hidden = false;
        } else {
          console.info(`Your settings were loaded from your last session and the oscilloscope (visualizer) was hidden last time you were here. If you want it back, just hit the button.`);
          this.transport.osc.classList.remove('active');
          canvas.hidden = true;
        }
      // }
    }

    // Global
    window.addEventListener('keyup', this.onKeyPress);
  }

  private setupAudioContexts = () => {
    if (!this.scope.audioContext) {
      this.scope.audioContext = new AudioContext();
    }
  };

  private drawOscilloscope(): void {
    const osc = document.querySelector<HTMLCanvasElement>('#osc');
    if (osc) {
      this.scope.attachMeter(osc);
    }
  }

  private async clearOscilloscope(): Promise<void> {
    const osc = document.querySelector<HTMLCanvasElement>('#osc');
    if (!osc) return;

    this.scope.detachMeter();
  }

  private async initialize(): Promise<void> {
    this.audio = document.createElement('audio');
    this.audio.preload = 'metadata';
    this.transport.play.innerHTML = Icons.Play;
    this.transport.skip.innerHTML = Icons.Skip;
    this.transport.rand.innerHTML = Icons.Shuffle;
    this.transport.osc.innerHTML = Icons.Oscilloscope;
    this.transport.mute.innerHTML = Icons.VolumeFull;
    this.transport.shr.innerHTML = Icons.Share;

    this.data.trackList = await this.getTrackList();

    console.log(`Loaded ${this.data.trackList.length} tracks. Tracklist ready.`);
    console.log('Track list:', this.data.trackList);

    this.setupEventListeners();
    this.setVolume(DEFAULT_VOLUME);

    // Load initial track
    const trackKey = this.getTrackIdFromUrl() ?? this.getRandomTrackKey();

    this.loadTrack(trackKey);
    this.scope = new Scope(this.audio);
    this.setupAudioContexts();
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
