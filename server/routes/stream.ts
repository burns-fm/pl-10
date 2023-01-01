/**
 * © 2022-2022 Burns Recording Company
 * Created: 21/10/2022
 */

import { Request, Response, Router } from 'express';
import { MediaController } from '../controllers/media';

const router = Router();

const controller = new MediaController();

router.get('/', async (_req, res: Response) => {
  const trackList = await controller.getTrackList();
  return res.json(trackList);
});

router.get('/:key', async (req: Request, res: Response) => {
  const { key } = req.params;
  const rangeHeader = req.headers.range;

  let start = 0;
  let end: number | undefined = undefined;

  if (rangeHeader) {
    const byteMatches = rangeHeader.match(/\d+/gm);
    start = byteMatches ? parseInt(byteMatches[0]) : 0;
    end = (byteMatches && byteMatches.length >= 2)
      ? parseInt(byteMatches[1] ?? 0)
      : undefined;
  }

  const { stream, size: _size } = await controller.createTrackStream(key, start, end);
  const track = await controller.getTrack(key);
  res.setHeader('Content-Type', `${track.mimetype}`);
  stream.pipe(res);
});

export { router as StreamRouter, controller as streamController };
