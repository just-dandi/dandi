import { Package } from './builder-project'
import { TsConfig } from './ts-config'

export interface PackageInfo {
  path: string
  name: string
  scope?: string
  fullName: string
  outPath: string

  packageConfig: Package
  packageConfigPath: string

  projectDependencies: string[]

  tsConfig: TsConfig
  tsConfigPath: string

  buildTsConfig: TsConfig
  buildTsConfigPath: string

  manifest?: string[]
  subPackages?: string[]
}
