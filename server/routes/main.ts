/**
 * © 2022-2022 Burns Recording Company
 * Created: 22/10/2022
 */

import { Request, Response, Router } from 'express';

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

router.get('/', homepage);

export { router as MainRouter };
