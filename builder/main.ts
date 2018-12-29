import { program } from './src/program'

program
  .command('update-configs', 'Creates or updates tsconfig files for the root project and configured package projects')

program
  .command('build', 'Updates the config files (see update-configs), then builds the project', { isDefault: true })

program.parse(process.argv)
