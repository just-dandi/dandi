import { program } from './src/program'
import { CommandUtil } from './src/command-util'

program
  .action(CommandUtil.projectAction('installPackageDependencies'))
  .parse(process.argv)
