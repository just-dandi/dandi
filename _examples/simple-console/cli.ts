#!/usr/bin/env node

const start = new Date().valueOf() // used to get accurate startup time

import * as program from 'commander'

import { run } from './src/main'
import { PACKAGE_VERSION } from './src/package'

program.version(PACKAGE_VERSION).usage('[options]').parse(process.argv)

run(start, program)
