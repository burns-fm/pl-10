/**
 * © 2022-2022 Burns Recording Company
 * Created: 02/11/2022
 */
const { Parcel } = require('@parcel/core');
const path = require('node:path');
const fs = require('node:fs/promises');

const SOURCE_DIR = path.resolve('client');
const ENTRY_FILE = path.resolve(SOURCE_DIR, 'index.ts');
const OUTPUT_DIR = path.resolve('public', 'app');

async function build() {
  try {
  console.log(`Bundling client code...`);
   const bundler = new Parcel({
    entries: ENTRY_FILE,
    mode: process.env.NODE_ENV,
    targets: {
      default: {
        distDir: OUTPUT_DIR,
      },
    },
    defaultConfig: '@parcel/config-default',
   });

   const result = await bundler.run();
   const bundles = result.bundleGraph.getBundles();
   console.log(`Bundled in ${result.buildTime}ms`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

module.exports = {
  SOURCE_DIR,
  ENTRY_FILE,
  build,
};
