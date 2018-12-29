import { Command } from 'commander'

import { Builder } from './src/builder'
import { BuilderProject } from './src/builder-project'
import { program } from './src/program'

program
  .action((projectPath: string, cmd: Command) => {
    const project = new BuilderProject({ projectPath: projectPath || process.cwd(), configFile: cmd.config })
    const builder = new Builder(project)

    return builder.build()
  })
  .parse(process.argv)
