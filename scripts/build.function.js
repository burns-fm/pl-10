/**
 * © 2022-2022 Burns Recording Company
 * Created: 02/11/2022
 */

const swc = require("@swc/core");
const path = require("node:path");
const fs = require("node:fs/promises");

const SOURCE_DIR = path.resolve("client");
const ENTRY_FILE = path.resolve(SOURCE_DIR, "index.ts");
const OUTPUT_DIR = path.resolve("public", "app");
const IS_PRODUCTION_ENV = process.env.NODE_ENV === 'production';
const config = {
  mode: 'production',
  entry: ENTRY_FILE,
  target: 'browser',
  minify: IS_PRODUCTION_ENV,
  jsc: {
    target: 'es2016',
  },
};

async function build() {
  console.log(`Bundling for ${config.jsc.target}. Minifying: ${IS_PRODUCTION_ENV}`);
  try {
    const output = await swc.bundle(config);

    try {
      const s = await fs.stat(OUTPUT_DIR);
      if (!s.isDirectory()) {
        await fs.mkdir(OUTPUT_DIR);
      }
    } catch (_e) {
      await fs.mkdir(OUTPUT_DIR);
    }

    for (const filename of Object.keys(output)) {
      const fp = path.resolve(OUTPUT_DIR, filename.replace(/\.ts$/, '.js'));
      let code = output[filename].code;
      if (IS_PRODUCTION_ENV) {
        code = await swc.minify(output[filename].code);
      }
      await fs.writeFile(fp, typeof code === 'string' ? code : code.code);
      await fs.writeFile(fp + '.map', output[filename].map);
    }
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