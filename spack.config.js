/**
 * © 2022-2022 Burns Recording Company
 * Created: 22/10/2022
 */

const { config } = require("@swc/core/spack");
const { resolve } = require("path");
module.exports = config({
  target: 'browser',
  entry: {
    web: resolve('client', 'index.ts'),
  },
  output: {
    path: resolve('public', 'app'),
  },
});
