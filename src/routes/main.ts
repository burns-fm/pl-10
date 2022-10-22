/**
 * © 2022-2022 Burns Recording Company
 * Created: 22/10/2022
 */

import { Response, Router } from 'express';

const router = Router();

router.get('/', (_req, res: Response) => {
  return res.render('index');
});

export { router as MainRouter };
