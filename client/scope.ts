/**
 * © 2022-2022 Burns Recording Company
 * Created: 23/10/2022
 * 
 * The code was derived from:
 * https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode#basic_usage
 * Much obliged.
 */
import { isSafari } from './helpers/checks';

export type BufferSize = 512 | 1024 | 2048 | 4096;

export const scopeDefault = {
  background: 'rgb(51, 51, 51)',
  meter: {
    line: `rgba(100, 100, 100, 0.9)`,
    line2: 'rgba(240, 240, 240, 0.729)',
    shadow: 'rgba(240, 240, 240, 0.3)',
  },
}

export class Scope {
  public streamAttached = false;

  public audioContext: AudioContext | null = null;
  public mediaSource: MediaElementAudioSourceNode;

  private node: AnalyserNode | null;
  private bufferSize: BufferSize = 4096;

  constructor(private readonly source: HTMLAudioElement) {}

  createAudioContext(): void {
    this.audioContext = new AudioContext();
    console.log(this.audioContext);
  }

  async closeAudioContext(): Promise<void> {
    if (!this.audioContext) {
      console.warn(`No audio context to close.`);
      return;
    }

    this.audioContext.close();
    this.audioContext = null;
  }

  public attachMeter = (element: HTMLCanvasElement, options?: { meterColor?: string, meterLineWidth?: number, }): void => {
    if (this.streamAttached || !this.audioContext) return;

    this.mediaSource = this.audioContext.createMediaElementSource(this.source);

    this.node = this.audioContext.createAnalyser();
    this.node.fftSize = this.bufferSize;

    const bufferLength = this.node.frequencyBinCount;
    const data = new Uint8Array(bufferLength);

    const context = element.getContext('2d')!;
    context.strokeStyle = scopeDefault.meter.line;

    this.mediaSource.mediaElement.onplay = () => {
      context.strokeStyle = options?.meterColor ?? scopeDefault.meter.line2;
    };
    this.mediaSource.mediaElement.onpause = () => {
      context.strokeStyle = options?.meterColor ?? scopeDefault.meter.shadow;
    };

    const draw = (time: DOMHighResTimeStamp): void => {
      const handle = requestAnimationFrame(draw);

      if ((time / 1000) % 2 === 0) return;
      if (!this.node || !this.audioContext) {
        console.error(`Could not establish audio analyser node.`);
        cancelAnimationFrame(handle);
        return;
      }

      this.node.getByteTimeDomainData(data);
      context.fillStyle = scopeDefault.background;
      context.fillRect(0, 0, element.width, element.height);
      context.lineWidth = options?.meterLineWidth ?? 4;
      context.strokeStyle = options?.meterColor ?? scopeDefault.meter.line2;
      context.shadowColor = options?.meterColor ?? scopeDefault.meter.shadow;
      context.shadowBlur = 40;
      context.beginPath();
      const sliceWidth = (element.width * 3.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = data[i] / 128.0;
        const y = (v * element.height) / 2;

        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }

        x += sliceWidth;
      }

      context.lineTo(element.width, element.height / 2);
      context.stroke();
    }

    draw(0);

    this.mediaSource.connect(this.node);
    this.mediaSource.connect(this.audioContext.destination);
    if (isSafari()) {
      console.log(this.mediaSource, this.audioContext);
    }
    this.streamAttached = true;
  }

}
