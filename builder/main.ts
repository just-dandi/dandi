#!/usr/bin/env ts-node
const start = new Date().valueOf()

require('tsconfig-paths/register')

import { Command } from 'commander'

import { BUILDER_PROJECT_DEFAULTS } from './src/builder-project'
import { VERSION } from './src/builder-version'
import { CommandUtil } from './src/command-util'

const program = new Command('@dandi/builder')

program
  .version(VERSION)
  .option(
    '-c --config <configFile>',
    'A path to the builder config file, relative to the working directory',
    BUILDER_PROJECT_DEFAULTS.configFile,
  )
  .option('--verbose', 'Enables verbose/debug level logging')

program
  .command('update-configs')
  .description('Creates or updates tsconfig files for the root project and configured project packages')
  .action(CommandUtil.projectAction('updateConfigs', start))

program
  .command('build')
  .description('Updates the config files (see update-configs), then builds the project')
  .action(CommandUtil.builderAction('build', start))

program
  .command('publish')
  .description('Builds and then publishes all project packages')
  .action(CommandUtil.publisherAction('publish', start))

program
  .command('unpublish [version]')
  .description(
    'Unpublishes a specific version of all configured project packages. [version] defaults to the current version defined in the root project package.json',
  )
  .action(CommandUtil.publisherAction('unpublish', start))

program
  .command('deprecate <message> [version]')
  .description(
    'Deprecates a specific version of all configured project packages. [version] defaults to the current version defined in the root project package.json',
  )
  .action(CommandUtil.publisherAction('deprecate', start))

program
  .command('yarn [yarn-command] [yarn-command-args ...]')
  .description('Run a yarn command on all configured packages')
  .action(CommandUtil.projectAction('yarnCommand', start))

program
  .command('outdated')
  .description('Displays data from yarn outdated for all configured project packages')
  .action(CommandUtil.projectAction('yarnOutdated', start))

program.parse(process.argv)
