/**
 * © 2022-2022 Burns Recording Company
 * Created: 02/11/2022
 */
 const {
  build,
  SOURCE_DIR
} = require('./build.function');
const chokidar = require('chokidar');

async function watch() {
  chokidar
    .watch(SOURCE_DIR)
    .on('all', async (event, path) => {
      console.info(`Compiling: ${path}`);
      await build();
    });
}

watch();
