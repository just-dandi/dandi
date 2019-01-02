import { program } from './src/program'

program
  .command('update-configs', 'Creates or updates tsconfig files for the root project and configured package projects')

program
  .command('build', 'Updates the config files (see update-configs), then builds the project', { isDefault: true })

program
  .command('install', 'Installs dependencies for configured packages')

program
  .command('npm <npm-command> [npm-command-args ...]', 'Run an npm command on all configured packages')

program.parse(process.argv)
