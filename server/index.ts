/**
 * © 2022-2022 Burns Recording Company
 * Created: 21/10/2022
 */


import express from 'express';
import logger from 'morgan';
import sassMiddleware from 'node-sass-middleware';
import { resolve } from 'path';
import * as constants from './constants';
import { loadEnvironment } from './helpers';
import { MainRouter } from './routes/main';
import { StreamRouter, streamController } from './routes/stream';
import { FatalError } from './errors';

const app = express();
const env = loadEnvironment();

streamController.loadMediaFiles().catch((error: Error) => {
  throw new FatalError('Loading Files', `There was an error loading the files to stream:\n${error.message}\n${error.stack}`);
});

app.set('views', resolve('views'));
app.set('view engine', 'ejs');

app.locals = {
  site: {
    title: constants.PageText.Title,
    subtitle: constants.PageText.Subtitle,
    supportingText: constants.PageText.SupportingText,
  },
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger(env === constants.Environment.Production ? 'combined' : 'dev'));

// TODO: replace the middleware with a build step or something
app.use(sassMiddleware({
  src: resolve(constants.STYLESHEETS_DIR, 'scss'),
  dest: constants.STYLESHEETS_DIR,
  prefix: '/styles',
  indentedSyntax: false, // false = .scss
  sourceMap: true,
  outputStyle: 'compressed',
  debug: Boolean(process.env.DEBUG),
  // force: Boolean(process.env.DEBUG),
  force: true,
}));

app.use('/', express.static(resolve('public')));

app.use('/', MainRouter);
app.use('/stream', StreamRouter);

export { app as server, constants, env };
