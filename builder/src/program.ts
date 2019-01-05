import * as cmd from 'commander'

import { BUILDER_PROJECT_DEFAULTS } from './builder-project'
import { VERSION } from './builder-version'

export const program: cmd.Command = cmd
  .version(VERSION)
  .usage('<cmd> [options]')
  .option('-c --config <configFile>', 'A path to the builder config file, relative to the working directory', BUILDER_PROJECT_DEFAULTS.configFile)
