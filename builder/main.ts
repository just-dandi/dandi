#!/usr/bin/env ts-node
import 'tsconfig-paths/register'

import * as program from 'commander'

import { BUILDER_PROJECT_DEFAULTS } from './src/builder-project'
import { VERSION } from './src/builder-version'
import { CommandUtil } from './src/command-util'

program
  .version(VERSION)
  .option('-c --config <configFile>', 'A path to the builder config file, relative to the working directory', BUILDER_PROJECT_DEFAULTS.configFile)

program
  .command('update-configs')
  .description('Creates or updates tsconfig files for the root project and configured project packages')
  .action(CommandUtil.projectAction('updateConfigs'))

program
  .command('build')
  .description('Updates the config files (see update-configs), then builds the project')
  .action(CommandUtil.builderAction('build'))

program
  .command('publish')
  .description('Builds and then publishes all project packages')
  .action(CommandUtil.publisherAction('publish'))

program
  .command('unpublish [version]')
  .description('Unpublishes a specific version of all configured project packages. [version] defaults to the current version defined in the root project package.json')
  .action(CommandUtil.publisherAction('unpublish'))

program
  .command('deprecate <message> [version]')
  .description('Deprecates a specific version of all configured project packages. [version] defaults to the current version defined in the root project package.json')
  .action(CommandUtil.publisherAction('deprecate'))

program
  .command('npm <npm-command> [npm-command-args ...]')
  .description('Run an npm command on all configured packages')
  .action(CommandUtil.projectAction('npmCommand'))

program
  .command('outdated')
  .description('Displays data from npm outdated for all configured project packages')
  .action(CommandUtil.projectAction('npmOutdated'))

program.parse(process.argv)
