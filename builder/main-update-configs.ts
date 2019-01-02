#!/usr/bin/env ts-node

import { Command } from 'commander'

import { BuilderProject } from './src/builder-project'
import { program } from './src/program'

program
  .action((projectPath: string, cmd: Command) => {
    const project = new BuilderProject({ projectPath: projectPath || process.cwd(), configFile: cmd.config })
    return project.updateConfigs()
  })
  .parse(process.argv)
