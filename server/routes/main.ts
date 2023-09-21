/**
 * © 2022-2022 Burns Recording Company
 * Created: 22/10/2022
 */

import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import basicAuth from 'express-basic-auth';
import { PORT, USE_HOMEPAGE, USE_PREVIEW_AUTH } from '../constants';
import { _NA } from '../types';
import { randomUUID } from 'crypto';
import { Auth } from '../helpers';

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
  return USE_HOMEPAGE ? res.render('index') : res.redirect('/embedded');
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
    html: `<iframe width="${w ?? defaultWidth}" height="${h ?? defaultHeight}" src="${u.toString()}" style="border: 0; border-radius: 4px;"></iframe>`,
  });
};

const embedded = (_req: Request, res: Response) => {
  return res.render('embedded');
};

const embedPreview = (_req: Request, res: Response) => {
  return res.render('preview');
};

const unauthorizedResponse = (ctx: RequestContext) => {
  return ctx.res.send('Unauthorized');
};

const authorizedResponse = (req: basicAuth.IBasicAuthedRequest, _res: Response, next: NextFunction) => {
  console.log(`User logged in: ${req.auth.user}`);
  next();
};

interface RequestContext {
  res: Response;
}

const embedRouter = Router();
embedRouter.get('/', embedded);

if (USE_PREVIEW_AUTH) {
  const username = process.env['PL_10_EMBED_USER'] ?? Auth.generateUsername();
  const password = process.env['PL_10_EMBED_PASS'] ?? Auth.generatePassword();

  console.info(`\nUSING PREVIEW AUTH\n------------------\nUSERNAME: ${username}\nPASSWORD: ${password}\n------------------\n`);

  embedRouter.use('/preview',
    basicAuth({
      users: {
        [username]: password,
      },
      challenge: true,
      realm: process.env['PL-10-AUTH-REALM'] ?? randomUUID(),
      unauthorizedResponse,
    }),
    authorizedResponse as RequestHandler,
  );
}

embedRouter.get('/preview', embedPreview);

router.get('/', homepage);
router.get('/embed-code', embedCode);
router.use('/embedded', embedRouter);


export { router as MainRouter };
