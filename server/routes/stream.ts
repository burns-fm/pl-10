/**
 * © 2022-2022 Burns Recording Company
 * Created: 21/10/2022
 */

import { Request, Response, Router } from 'express';
import { MediaController, TrackSummary } from '../controllers/media';
import { DEBUG } from '../constants';

const router = Router();

const controller = new MediaController();

export class StreamRoutes {
  /**
   * This handler will return a response containing a JSON array of {@link TrackSummary} objects.
   * It allows you to send a complete listing of audio files available on your server.
   */
  static getTrackList = async (_req: Request, res: Response): Promise<Response> => {
    const trackList = await controller.getTrackList();
    return res.json(trackList);
  }

  /**
   * This handler will look for a track key on the incoming HTTP request and use that key to look up
   * a track from the files that were available when you started your server.
   * 
   * If it finds a track (sweeeet), then it will create a NodeJS ReadStream for the file and
   * pipe the data in the HTTP response.
   * 
   * It uses something called a range header on the HTTP request to determine the length of the 
   * audio clip and then start and end points, if applicable. This allows seeking and buffering
   * in a web browser, or any other interface you build to connect to it.
   */
  static getTrackStream = async (req: Request, res: Response): Promise<Response | void> => {
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
    
    stream.on('data', (chunk: number[]) => {
      DEBUG && console.debug(`Sending track ${key} chunk ${chunk.length} bytes to ${req.ip}...`);
    });
  
    stream.pipe(res);
  };
}

router.get('/', StreamRoutes.getTrackList);
router.get('/:key', StreamRoutes.getTrackStream);

export { router as StreamRouter, controller as streamController };
