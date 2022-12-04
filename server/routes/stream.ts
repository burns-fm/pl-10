/**
 * © 2022-2022 Burns Recording Company
 * Created: 21/10/2022
 */

import { Request, Response, Router } from 'express';
import { MediaController } from '../controllers/media';
import { loadFileTypesLib } from '../helpers';

const router = Router();

const controller = new MediaController();

router.get('/', async (_req, res: Response) => {
  const trackList = await controller.getTrackList();
  return res.json(trackList);
});

router.get('/:key', async (req: Request, res: Response) => {
  const { key } = req.params;
  const { stream, size } = await controller.createTrackStream(key);
  const track = await controller.getTrack(key);
  res.setHeader('Content-Type', `${track.mimetype}`);
  stream.pipe(res);
});

export { router as StreamRouter, controller as streamController };
