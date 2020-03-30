// @ts-nocheck
import editJsonFile from "edit-json-file";
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

    try {
      const srcVersions = getVersionsFrom('src', srcUrl, srcConfig);
      const destVersions = getVersionsFrom('dest', destUrl, destConfig);

      const srcKeys = Object.keys(srcVersions);
      const destKeys = Object.keys(destVersions);

      const versionsToMigrate = getDiff(srcKeys, destKeys);
      const versionCount = versionsToMigrate.length;

      if (versionCount === 0) {
        logger.ok('No items differ. Nothing to migrate!', "✅");
        process.exit(0);
      }

      versionsToMigrate.forEach((versionName, index) => {
        const current = index + 1;

        logger.info(`Migrating ${current} of ${versionCount}...`, "📡");

        const srcMetadata = srcVersions[versionName];
        const { dist } = srcMetadata;

        const destMetadata = getMetadata(srcMetadata);

        if (destRepo) {
          const tmpPath = `${__dirname}/tmp/${versionName}`;
          const fileName = `${versionName}.tgz`;
          const packagePath = `${tmpPath}/package`;

          const srcFilePath = `${tmpPath}/${fileName}`;
          const srcPackageFilePath = `${packagePath}/package.json`;

          const destFilePath = `${packagePath}/${fileName}`;

          fs.mkdirSync(tmpPath, { recursive: true });

          const tgzFile = fs.createWriteStream(srcFilePath);
          npm.sync.fetch(dist.tarball, { auth: srcAuth }).pipe(tgzFile);

          targz.decompress({ src: srcFilePath, dest: tmpPath }, () => {
            logger.dev(`Decompressed ${current}!`);
          });
        } else {
          const tarball = npm.sync.fetch(dist.tarball, { auth: srcAuth });
          npm.sync.publish(dest, { auth: destAuth, metadata: destMetadata, access: 'public', body: tarball })
          logger.ok(`Item ${versionName} migrated!`, "✅")
        }


        return;
        if (destRepo) {


          const tgzFile = fs.createWriteStream(srcFilePath);
          npm.sync.fetch(dist.tarball, { auth: srcAuth }).pipe(tgzFile);

          // npm.fetch(dist.tarball, { auth: srcAuth }, (error, data) => {
            // if (error) throw new Error(error);

            logger.dev('FETCH DATA!');
            // console.log({ data });
          // })

          // targz.decompress({ src: srcFilePath, dest: tmpPath }, () => {
          //   const file = editJsonFile(srcPackageFilePath);
          //   file.set("repository.url", destRepo);
          //   file.save();

          //   targz.compress({ src: packagePath, dest: destFilePath }, () => {
          //     const tarball = fs.createReadStream(destFilePath);
          //     npm.publish(dest, { auth: destAuth, metadata: destMetadata, access: 'public', body: tarball }, () => {
          //       logger.ok(`${index + 1} migrated!`, "✅")
          //     })
          //   })
          // });
        } else {
          // stuff...
        }
      })
    } catch (err) {
      logger.error(__filename, "💥");
      logger.error(err, "💥");
    }
  })

  function getVersionsFrom(type: string, url: string, config: any) {
    logger.info(`Compairing registries. Getting versions from ${type === 'src' ? 'source' : 'destination' }...`, "🔎");
    return npm.sync.get(url, config).versions;
  }

  function getDiff(src: string[], dest: string[]) {
    // Hat Tip: https://medium.com/@alvaro.saburido/set-theory-for-arrays-in-es6-eb2f20a61848
    return src.filter(x => !dest.includes(x));
  }

  function getMetadata(data: any) {
    // Delete private properties and the 'dist' object.
    const output = { ...data, _:undefined, dist: undefined };
    return JSON.parse(JSON.stringify(output));
  }






///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
})
