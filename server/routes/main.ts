/**
 * © 2022-2022 Burns Recording Company
 * Created: 22/10/2022
 */

import { Request, Response, Router } from 'express';
import { PORT } from '../constants';
import { _NA } from '../types';

const router = Router();

/**
 * This route is the home page.
 * 
 * If you want additional pages like an about page, then add
 * an `about.ejs` file in the `views` directory with your HTML
 * and copy the method below. Follow this pattern to add any
 * other pages you need.
 * 
 * @example ```ts
 * router.get('/about', (_req: Request, res: Response) => {
 *  return res.render('about');
 * });
 * ```
 * 
 * @note Add any new pages _below_ line 34.
 * 
 * If you want to learn how to build more complex pages
 * with dynamic contents, check out the EJS documentation:
 * @link https://ejs.co/#docs
 */
const homepage = (_req: Request, res: Response) => {
  return res.render('index');
};

const embedded = (_req: Request, res: Response) => {
  return res.render('embedded');
};

interface EmbedCodeSearchParams {
  w?: number;
  h?: number;
  trackId?: string;
}

const embedCode = (req: Request<_NA,_NA,_NA,EmbedCodeSearchParams>, res: Response) => {
  const defaultWidth = 888;
  const defaultHeight = 333;
  const { w, h, trackId } = req.query;

  const { hostname, protocol, } = req;

  const u = new URL(protocol + '://' + hostname);
  u.port = `${PORT}`;
  u.pathname = '/embedded';
  if (trackId) {
    u.searchParams.append('t', trackId);
  }
  return res.json({
    html: `<iframe width="${w ?? defaultWidth}" height="${h ?? defaultHeight}" src="${u.toString()}"></iframe>`,
  });
};

const embedPreview = (_req: Request, res: Response) => {
  return res.render('preview');
};

router.get('/', homepage);
router.get('/embedded', embedded);
router.get('/embedded/preview', embedPreview);
router.get('/embed-code', embedCode);


export { router as MainRouter };
