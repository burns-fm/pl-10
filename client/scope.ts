/**
 * © 2022-2022 Burns Recording Company
 * Created: 23/10/2022
 * 
 * The code was derived from:
 * https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode#basic_usage
 * Much obliged.
 */
// import { isSafari } from './helpers/checks';

export type BufferSize = 512 | 1024 | 2048 | 4096;

export const scopeDefault = {
  background: 'rgb(51, 51, 51)',
  meter: {
    line: `rgba(100, 100, 100, 0.9)`,
    line2: 'rgba(240, 240, 240, 0.729)',
    shadow: 'rgba(240, 240, 240, 0.3)',
  },
}

export interface MeterOptions { meterColor?: string; meterLineWidth?: number; }

export class Scope {
  public streamAttached = false;

  public audioContext: AudioContext | null = null;
  public element: HTMLCanvasElement;
  public canvasContext: CanvasRenderingContext2D;
  public mediaSource: MediaElementAudioSourceNode | null;
  private options: MeterOptions;
  private node: AnalyserNode | null;
  private bufferSize: BufferSize = 4096;
  private handle: number | null = null;
  private lastFrameTime: number = 0;

  constructor(private readonly source: HTMLAudioElement) {}

  public attachMeter = (element: HTMLCanvasElement, options: MeterOptions = { meterColor: scopeDefault.meter.line2, meterLineWidth: 3, }): void => {
    if (!this.audioContext) this.audioContext = new AudioContext();

    if (this.streamAttached || !this.audioContext) {
      console.warn(`No audio context (${!!this.audioContext ? 'Exists' : 'None'}) or stream already attached (${!!this.streamAttached})`);
      return;
    }

    this.element = element;
    this.canvasContext = this.element.getContext('2d')!;
    
    this.options = options;
    
    if (!this.mediaSource) {
      this.mediaSource = this.audioContext.createMediaElementSource(this.source);
    }
    
    this.node = this.audioContext.createAnalyser();
    this.node.fftSize = this.bufferSize;

    this.canvasContext.strokeStyle = scopeDefault.meter.line;

    this.mediaSource.mediaElement.onplay = () => {
      this.canvasContext.strokeStyle = this.options.meterColor ?? scopeDefault.meter.line2;
    };
    this.mediaSource.mediaElement.onpause = () => {
      this.canvasContext.strokeStyle = this.options.meterColor ?? scopeDefault.meter.shadow;
    };

    this.draw(0);
    this.mediaSource.connect(this.node);
    this.mediaSource.connect(this.audioContext.destination);
    this.streamAttached = true;
  }

  draw = (time: DOMHighResTimeStamp): void => {
    this.handle = requestAnimationFrame(this.draw);

    if (!this.node || !this.audioContext) {
      console.error(`Could not establish audio analyser node.`);
      this.detachMeter();
      return;
    }

    const elapsed = time - (this.lastFrameTime || 0);

    // Only draw the oscilloscope if at least N milliseconds have passed since the last frame.
    if (elapsed < 20) return;

    // Save the current time for the next frame.
    this.lastFrameTime = time;

    const timeDomainSize = this.node.frequencyBinCount * 2;
    const data = new Uint8Array(timeDomainSize);
    this.node.getByteTimeDomainData(data);
    this.canvasContext.fillStyle = scopeDefault.background;
    this.canvasContext.fillRect(0, 0, this.element.width, this.element.height);
    this.canvasContext.lineWidth = this.options.meterLineWidth ?? 3;
    this.canvasContext.strokeStyle = this.options.meterColor ?? scopeDefault.meter.line2;
    // TODO use elapsed time to fade out colours of spans of the draw. Might result in a graceful effect.
    this.canvasContext.shadowColor = this.options.meterColor ?? scopeDefault.meter.shadow;
    this.canvasContext.shadowBlur = 30;
    this.canvasContext.beginPath();
    const sliceWidth = (this.element.width * 2.0) / timeDomainSize;
    let x = 0;

    for (let i = 0; i < timeDomainSize; i++) {
      const v = data[i] / 128.0;
      const y = (v * this.element.height) / 2;

      if (i === 0) {
        this.canvasContext.moveTo(x, y);
      } else {
        this.canvasContext.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.canvasContext.lineTo(this.element.width, this.element.height / 2);
    this.canvasContext.stroke();
  }

  public detachMeter(): void {
    if (!this.handle || !this.node || !this.audioContext || !this.mediaSource) {
      console.warn(`Skipping detach meter call.`, {
        handle: this.handle,
        node: this.node,
        context: this.audioContext,
        mediaSource: this.mediaSource,
      });
      return;
    }
    cancelAnimationFrame(this.handle);
    
    this.mediaSource.mediaElement.onplay = null;
    this.mediaSource.mediaElement.onpause = null;
    this.mediaSource.disconnect();
    this.node.disconnect();
    this.handle = null;
    this.node = null;
  
    this.streamAttached = false;
  }
}
