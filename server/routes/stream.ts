/**
 * © 2022-2022 Burns Recording Company
 * Created: 21/10/2022
 */

import { Request, Response, Router } from 'express';
import { MediaController } from '../controllers/media';
import { DEBUG } from '../constants';

const router = Router();

const controller = new MediaController();

router.get('/', async (_req, res: Response) => {
  const trackList = await controller.getTrackList();
  return res.json(trackList);
});

router.get('/:key', async (req: Request, res: Response) => {
  const { key } = req.params;
  const rangeHeader = req.headers.range?.trim();
  
  let start = 0;
  let end: number | undefined = undefined;

  if (rangeHeader) {
    if (rangeHeader !== 'bytes=0-1') {
      const byteMatches = rangeHeader.match(/\d+/gm);
      start = byteMatches ? parseInt(byteMatches[0]) : 0;
      end = (byteMatches && byteMatches.length >= 2)
        ? parseInt(byteMatches[1] ?? 0)
        : undefined;
    }
  }

  const createStreamResult = await controller.createTrackStream(key, start, end);

  if ('error' in createStreamResult) {
    return res.status(400).send(createStreamResult.error);
  }

  const { stream, size } = createStreamResult;

  const track = await controller.getTrack(key);
  res.setHeader('Content-Type', `${track.mimetype}`);
  res.setHeader('Content-Length', size);
  
  stream.on('data', (chunk: any[]) => {
    DEBUG && console.debug(`Sending track ${key} chunk ${chunk.length} bytes to ${req.ip}...`);
  });

  stream.pipe(res);
});

export { router as StreamRouter, controller as streamController };
