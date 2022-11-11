/**
 * © 2022-2022 Burns Recording Company
 * Created: 23/10/2022
 * 
 * The code was derived from:
 * https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode#basic_usage
 * Much obliged.
 */

export type BufferSize = 512 | 1024 | 2048 | 4096;

export class Processor {
  public streamAttached = false;

  public audioContext: AudioContext = new AudioContext();
  public mediaSource: MediaElementAudioSourceNode;

  private bufferSize: BufferSize = 4096;

  constructor(private readonly source: HTMLAudioElement) {}

  public attachMeter(element: HTMLCanvasElement, options?: { meterColor?: string, meterLineWidth?: number, }): void {
    if (this.streamAttached) return;

    this.mediaSource = this.audioContext.createMediaElementSource(this.source);

    const node = this.audioContext.createAnalyser();
    node.fftSize = this.bufferSize;

    const bufferLength = node.frequencyBinCount;
    const data = new Uint8Array(bufferLength);

    const context = element.getContext('2d')!;
    context.strokeStyle = `rgba(100, 100, 100, 0.9)`;

    this.mediaSource.mediaElement.onplay = () => {
      context.strokeStyle = options?.meterColor ?? 'rgba(240, 240, 240, 0.729)';
    };
    this.mediaSource.mediaElement.onpause = () => {
      context.strokeStyle = options?.meterColor ?? 'rgba(240, 240, 240, 0.3)';
    };

    function draw(time: DOMHighResTimeStamp): void {
      requestAnimationFrame(draw);

      if ((time / 1000) % 2 === 0) return;

      node.getByteTimeDomainData(data);
      context.fillStyle = 'rgb(9, 9, 9)';
      context.fillRect(0, 0, element.width, element.height);
      context.lineWidth = options?.meterLineWidth ?? 4;
      context.strokeStyle = options?.meterColor ?? 'rgba(240, 240, 240, 0.436)';
      context.shadowColor = options?.meterColor ?? 'rgba(173, 229, 255, 0.85)';
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

    this.mediaSource.connect(node);
    this.mediaSource.connect(this.audioContext.destination);
    this.streamAttached = true;
  }
}
