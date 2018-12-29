import { TsConfigCompilerOptions } from './ts-config'

export interface BuilderConfig {
  packagesDir: string
  tsConfigFileName: string
  buildTsConfigFileName: string
  packageBaseTsConfigFileName: string
  scopes?: string[]
  licenseFile?: string
  compilerOptions?: TsConfigCompilerOptions
}

export const BUILD_CONFIG_DEFAULTS: BuilderConfig = {
  packagesDir: 'packages',
  tsConfigFileName: 'tsconfig.json',
  buildTsConfigFileName: '.tsconfig.builder.json',
  packageBaseTsConfigFileName: '.tsconfig.package.json',
}
