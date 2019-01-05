#!/usr/bin/env ts-node

import { CommandUtil } from './src/command-util'
import { program } from './src/program'

program
  .action(CommandUtil.projectAction('npmCommand'))
  .parse(process.argv)
