#!/usr/bin/env node

import yargs from "yargs";
import { cli } from "./cli";
import { usage } from "./index.const";
import { logger } from "./logger";

const argv = yargs
  .usage(usage)

  .option("src", { alias: "s", describe: "The source URL", type: "string", nargs: 1, demandOption: true })
  .option("dest", { alias: "d", describe: "The destination URL", type: "string", nargs: 1, demandOption: true })

  .option("srcToken", { describe: "Auth token for source", type: "string", nargs: 1 })
  .option("destToken", { describe: "Auth token for destination", type: "string", nargs: 1 })

  .option("srcUser", { describe: "Username for source", type: "string", nargs: 1 })
  .option("destUser", { describe: "Username for destination", type: "string", nargs: 1 })

  .option("srcPassword", { describe: "Password for source", type: "string", nargs: 1 })
  .option("destPassword", { describe: "Password for destination", type: "string", nargs: 1 })

  .option("srcEmail", { describe: "Email for source", type: "string", nargs: 1 })
  .option("destEmail", { describe: "Email for destination", type: "string", nargs: 1 })

  .option("srcPrefix", { describe: "Package prefix used for source", type: "string", nargs: 1 })
  .option("destPrefix", { describe: "Package prefix used for destination", type: "string", nargs: 1 })

  .option("destRepo", { describe: "Replace the `repository.url` value in package.json with this value before uploading to destination.", type: "string", nargs: 1})

  .epilog('©2020 Appsweet.co. This project is MIT licensed.')
  .argv;

cli(argv, (err) => {
  if (err) {
    logger.error(err.stack || err, "💥");
    process.exit(1);
  }

  process.exit(0);
});
