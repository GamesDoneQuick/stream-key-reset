import fs from "fs";

import chalk from "chalk";

import { Config } from "./Types";

export default function writeConfig(configPath: string, config: Config) {
  console.log(chalk.blue(`Updating config at: ${configPath}`));
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}
