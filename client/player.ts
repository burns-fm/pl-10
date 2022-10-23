/**
 * © 2022-2022 Burns Recording Company
 * Created: 23/10/2022
 */
import * as Icons from './icons';

interface PlayerButtons {
  play: HTMLButtonElement;
  skip: HTMLButtonElement;
  rand: HTMLButtonElement;
  mute: HTMLButtonElement;
}

interface PlayerDisplay {
  currentTime: HTMLTimeElement;
  duration: HTMLTimeElement | null | undefined;
  trackInfo: {
    title: HTMLMarqueeElement;
    album: HTMLParagraphElement;
  };
}

export class Player {
  buttons: PlayerButtons = {
    play: document.querySelector('.transport #btn--play')!,
    skip: document.querySelector('.transport #btn--skip')!,
    rand: document.querySelector('.transport #btn--rand')!,
    mute: document.querySelector('.transport #btn--mute')!,
  };

  display: PlayerDisplay = {
    currentTime: document.querySelector('.time .current-time')!,
    duration: document.querySelector<HTMLTimeElement>('.time .duration'),
    trackInfo: {
      title: document.querySelector('.track-info #title')!,
      album: document.querySelector('.track-info #album')!,
    },
  };

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.buttons.play.innerHTML = Icons.Play;
    this.buttons.skip.innerHTML = Icons.Skip;
    this.buttons.rand.innerHTML = Icons.Shuffle;
  }
}
