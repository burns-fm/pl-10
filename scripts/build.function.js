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

 async function build() {
   const output = await swc.bundle({
     mode: 'production',
     entry: ENTRY_FILE,
   });
 
   try {
 
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
       await fs.writeFile(fp, output[filename].code);
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
