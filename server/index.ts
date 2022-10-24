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
  artist: {
    name: 'Artist Name', // TODO Set via constants/vars 
  },
  site: {
    title: 'BRC PL-10',
  },
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger(env === constants.Environment.Production ? 'combined' : 'dev'));

app.use(sassMiddleware({
  src: resolve(constants.STYLESHEETS_DIR, 'scss'),
  dest: constants.STYLESHEETS_DIR,
  prefix: '/styles',
  indentedSyntax: false, // false = .scss
  sourceMap: true,
  outputStyle: 'compressed',
  debug: Boolean(process.env.DEBUG),
}));

app.use('/', express.static(resolve('public'), {
  extensions: ['js', 'css', 'map'],
}));

app.use('/', MainRouter);
app.use('/stream', StreamRouter);

export { app as server, constants, env };
