/**
 * © 2022-2022 Burns Recording Company
 * Created: 23/10/2022
 * 
 * The code was derived from:
 * https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode#basic_usage
 * Much obliged.
 */

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
  public attached = false;

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
    if (this.attached) {
      console.warn(`Stream already attached (${!!this.attached})`);
      return;
    }
    
    if (!this.audioContext) {
      console.info(`Creating audio context...`);
      this.audioContext = new AudioContext();
    }

    if (!this.element) {
      this.element = element;
    }
    
    if (!this.canvasContext) {
      console.info(`Creating canvas context...`);
      this.canvasContext = this.element.getContext('2d')!;
    }
    
    this.options = options;
    
    if (!this.mediaSource) {
      console.info(`Creating media element source...`);
      this.mediaSource = this.audioContext.createMediaElementSource(this.source);
    }
    
    if (!this.node) {
      console.info(`Creating audio analyzer node...`);
      this.node = this.audioContext.createAnalyser();
    }

    this.node.fftSize = this.bufferSize;

    this.canvasContext.strokeStyle = scopeDefault.meter.line;

    this.mediaSource.mediaElement.onplay = () => {
      this.canvasContext.strokeStyle = this.options.meterColor ?? scopeDefault.meter.line2;
    };

    this.mediaSource.mediaElement.onpause = () => {
      this.canvasContext.strokeStyle = this.options.meterColor ?? scopeDefault.meter.shadow;
    };

    let handle: number;
    const draw = (time: DOMHighResTimeStamp): void => {
      handle = requestAnimationFrame(draw);
      this.handle = handle;
  
      const elapsed = time - (this.lastFrameTime || 0);
  
      // Only draw the oscilloscope if at least N milliseconds have passed since the last frame.
      if (elapsed < 20) return;
      // Save the current time for the next frame.
      this.lastFrameTime = time;
  
      const timeDomainSize = this.node!.frequencyBinCount;
      const data = new Uint8Array(timeDomainSize);
      this.node!.getByteTimeDomainData(data);
      console.log(data);
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

    draw(0);
    try {
      this.mediaSource.connect(this.node);
      this.mediaSource.connect(this.audioContext.destination);
      this.attached = true;
    } catch(e) {
      console.error(e);
      alert(e);
    }
  }

  public detachMeter(): void {
    if (!this.handle || !this.node || !this.audioContext || !this.mediaSource) {
      console.warn(`Skipping detach meter call.`, {
        handle: this.handle,
        node: this.node,
        context: this.audioContext,
        mediaSource: this.mediaSource,
      });
    }
    
    try {
      if (this.handle) {
        cancelAnimationFrame(this.handle);
        this.handle = null;
      }
      
      if (this.mediaSource && this.node) {
        this.mediaSource.disconnect(this.node);
        
        if (this.audioContext) {
          this.mediaSource.disconnect(this.audioContext.destination);
        }
        
        this.mediaSource.disconnect();
      }
  
      this.attached = false;
    } catch(e) {
      console.error(e);
    }
  }
}
