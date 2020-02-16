// extension:
//   - ts
// require:
//   - 'tsconfig-paths/register'
//   - './test/ts-node.js'
//   - 'ts-custom-error-shim'
//   - './test/mocha.config'
//   - 'test/sandbox.ts'
// ignore:
//   - node_modules
// spec:
//   - 'packages/*/*/{,(!node_modules)/}index.ts'
//   - 'packages/*/*/{,(!node_modules)/*/}*/index.ts'
//   - 'packages/*/*/{,(!node_modules)/}src/**/*.spec.ts'
//   - 'packages/*/*/{,(!node_modules)/*/}*/src/**/*.spec.ts'
//   - 'packages/*/*/{,(!node_modules)/}src/**/*.int-spec.ts'
//   - 'packages/*/*/{,(!node_modules)/*/}*/src/**/*.int-spec.ts'

const { readdirSync, statSync } = require('fs')
const { dirname, resolve } = require('path')

const [,, scopesArg, ...scopes] = process.argv
if (scopesArg !== '--scope') {
  scopes.length = 0
}

const manifest = require('./.tsconfig.builder.json').include.filter(file => file.endsWith('index.ts'))
function findPaths(dir) {
  const subDirs = readdirSync(dir)
  return subDirs
    .filter(subDir => subDir !== 'src' && subDir !== 'node_modules' && subDir !== '.yarn-cache')
    .map(subDir => `${dir}/${subDir}`)
    .filter(subDir => statSync(subDir).isDirectory())
    .reduce((result, subDir) => {
      result.push(subDir)
      result.push(...findPaths(subDir))
      return result
    }, [])
}
const paths = manifest
  .filter(path => {
    if (!scopes.length) {
      return true
    }
    return scopes.some(scope => path.startsWith(`packages/${scope}/`))
  })
  .reduce((result, file) => {
    const dir = dirname(file)
    result.push(dir, ...findPaths(resolve(__dirname, dir)))
    return result
  }, [])
const barrels = paths.map(path => `${path}/index.ts`)
const unitSpec = paths.map(path => `${path}/src/**/*.spec.ts`)
const intSpec = paths.map(path => `${path}/src/**/*.int-spec.ts`)
const spec = [
  ...barrels,
  ...unitSpec,
  ...intSpec,
]

// suppress "Cannot find any files matching pattern" warnings from mocha startup
console.__ogWarn = console.warn
console.warn = (msg, ...args) => {
  if (msg.includes('Cannot find any files matching pattern')) {
    return
  }
  console.__ogWarn.call(console, msg, ...args)
}

module.exports = {
  extension: 'ts',
  ignore: [
    '.out',
    '.build',
    'dist',
  ],
  watchIgnore: [
    '.out',
    '.build',
    'dist',
  ],
  require: [
    'tsconfig-paths/register',
    resolve(__dirname, './test/ts-node.js'),
    'ts-custom-error-shim',
    resolve(__dirname, './test/mocha.config'),
  ],
  file: [
    resolve(__dirname, 'test/sandbox.ts'),
    ...manifest,
  ],
  spec,
}
