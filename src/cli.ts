import fibrous from "fibrous";
import fs from "fs";
import RegClient from "npm-registry-client";
import targz from "targz";
import { CustomArgv } from "./cli.const";
import { getAuth } from "./index.service";
import { logger } from "./logger";

const npm = new RegClient();

export const cli = fibrous((argv: CustomArgv) => {
  const modules = argv._;

  const srcAuth = getAuth('src', argv);
  const destAuth = getAuth('dest', argv);

  const { dest, destPrefix, destRepo, src, srcPrefix } = argv;

  modules.forEach(module => {
    const srcName = srcPrefix ? `${srcPrefix}/${module}` : module;
    const destName = destPrefix ? `${destPrefix}/${module}` : module;

    const srcUrl = `${src}/${srcName}`;
    const destUrl = `${dest}/${destName}`;

    const baseConfig = { timeout: 3000 };
    const srcConfig = { ...baseConfig, auth: srcAuth };
    const destConfig = { ...baseConfig, auth: destAuth };

    logger.info("Comparing versions from source and destination.", "🔎");

    try {
      logger.info("Getting versions from source...", "📡");
      const srcVersions = npm.sync.get(srcUrl, srcConfig).versions;

      logger.info("Getting versions from destination...", "📡");
      const destVersions = npm.sync.get(destUrl, destConfig).versions;

      const srcKeys = Object.keys(srcVersions);
      const destKeys = Object.keys(destVersions);

      // Hat Tip: https://medium.com/@alvaro.saburido/set-theory-for-arrays-in-es6-eb2f20a61848
      const versionsToMigrate = srcKeys.filter(x => !destKeys.includes(x));

      if (!versionsToMigrate.length) {
        logger.ok('No items differ. Nothing to migrate!', "✅");
        process.exit(0)
      }

      logger.info(versionsToMigrate.length === 1 ? "1 item differs!" : `${versionsToMigrate.length} items differ!`, "🔀");

      versionsToMigrate.forEach((versionName) => {
        const srcMetadata = srcVersions[versionName];
        const { dist } = srcMetadata;

        if (destRepo) {
          const tmpPath = `${__dirname}/tmp/${versionName}`;
          const tmpFileName = `${versionName}.tgz`;
          const tmpFilePath = `${tmpPath}/${tmpFileName}`;

          fs.mkdirSync(tmpPath, { recursive: true})

          console.log(`==> ${tmpFilePath}`)
          const tgzFile = fs.createWriteStream(tmpFilePath);
          console.log('==> FETCH')
          npm.sync.fetch(dist.tarball, { auth: srcAuth }).pipe(tgzFile);
          console.log('==> EXTRACT')
          targz.decompress({
            src: tmpFilePath,
            dest: tmpPath,
          })
        } else {
          // const tarball = npm.sync.fetch(dist.tarball, { auth: srcAuth });
        }

        /*
        const destMetadata = { ...srcMetadata }

        // Delete private properties and the 'dist' object.
        delete destMetadata._;
        delete destMetadata.dist;

        npm.sync.publish(dest, { auth: destAuth, metadata: destMetadata, access: 'public', body: tarball })

        logger.ok(`${versionName} migrated!`, "✅")
        */
      })
    } catch (err) {
      logger.error(err, "💥");
    }
  })
})
