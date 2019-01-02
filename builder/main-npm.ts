import { CommandUtil } from './src/command-util'
import { program } from './src/program'

program
  .action(CommandUtil.projectAction((project, cmd) => project.npmCommand()))
  .parse(process.argv)
