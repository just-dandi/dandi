import { dirname, join, relative, resolve } from 'path'

import { pathExists, readdir, readFile } from 'fs-extra'

import { BUILD_CONFIG_DEFAULTS, BuilderConfig } from './builder-config'
import { TsConfig, TsConfigCompilerOptions } from './ts-config'
import { Util } from './util'

export const DEFAULT_MANIFEST = [
  '**/*.md',
]

export type DependencyMap = { [pkg: string]: string }

export interface Package {
  version: string
  author?: any
  repository?: any
  bugs?: any
  homepage?: any
  dependencies?: DependencyMap
  peerDependencies?: DependencyMap
  devDependencies?: DependencyMap
  license?: any
}

export interface BuilderProjectOptions {
  projectPath?: string
  configFile?: string
}

export interface PackageInfo {
  path: string
  name: string
  scope?: string
  outPath: string

  packageConfig: Package
  packageConfigPath: string

  tsConfig: TsConfig
  tsConfigPath: string

  buildTsConfig: TsConfig
  buildTsConfigPath: string

  manifest?: string[]
  subPackages?: string[]

}

export const BUILDER_PROJECT_DEFAULTS: BuilderProjectOptions = {
  projectPath: process.cwd(),
  configFile: './.builderrc',
}

export class BuilderProject implements BuilderConfig, BuilderProjectOptions {

  private readonly tsConfigPath: string
  private readonly baseTsConfigPath: string
  private readonly packagesPath: string
  private readonly tsConfig: TsConfig
  private readonly configFilePath: string

  public readonly buildTsConfigPath: string
  public readonly mainPkg: Package

  public readonly projectPath: string
  public readonly configFile: string

  public readonly packagesDir: string
  public readonly scopes?: string[]
  public readonly tsConfigFileName: string
  public readonly buildTsConfigFileName: string
  public readonly packageBaseTsConfigFileName: string
  public readonly licenseFile: string
  public readonly compilerOptions: TsConfigCompilerOptions

  private _packages: PackageInfo[]
  public get packages(): PackageInfo[] {
    return this._packages
  }

  constructor(options?: BuilderProjectOptions) {

    Object.assign(this, BUILDER_PROJECT_DEFAULTS, options)

    this.configFilePath = resolve(this.projectPath, this.configFile)

    Object.assign(this, BUILD_CONFIG_DEFAULTS, Util.readJsonSync(this.configFilePath))

    this.tsConfigPath = resolve(this.projectPath, this.tsConfigFileName)
    this.buildTsConfigPath = resolve(this.projectPath, this.buildTsConfigFileName)
    this.baseTsConfigPath = resolve(this.projectPath, this.packageBaseTsConfigFileName)
    this.packagesPath = resolve(this.projectPath, this.packagesDir)

    this.tsConfig = Util.readJsonSync(this.tsConfigPath)

    this.mainPkg = Util.readJsonSync(resolve(this.projectPath, 'package.json'))
  }

  public async discoverPackages(): Promise<PackageInfo[]> {
    this._packages = this.scopes ? await this.findScopedPackages(this.packagesPath, this.scopes) : await this.findPackages(this.packagesPath)
    return this._packages
  }

  public async updateConfigs(packages?: PackageInfo[]): Promise<void> {
    if (!packages) {
      packages = await this.discoverPackages()
    }
    await Promise.all([
      this.updateProjectTsConfig(),
      this.updateProjectPackageBaseTsConfig(),
      this.updateProjectBuildTsConfig(packages),
      this.updatePackageConfigs(packages),
    ])
  }

  public async updateProjectTsConfig(): Promise<void> {
    if (this.scopes) {
      this.tsConfig.compilerOptions.baseUrl = '.'
      this.tsConfig.compilerOptions.paths = this.scopes.reduce((result, scope) => {
        result[`@${scope}/*`] = ['./' + join(this.packagesDir, scope, '*')]
        return result
      }, {})
      await Util.writeJson(this.tsConfigPath, this.tsConfig)
    }
  }

  public async updateProjectBuildTsConfig(packages: PackageInfo[]): Promise<void> {

    const buildTsExtends = relative(this.projectPath, this.baseTsConfigPath)
    const buildTsExtendsPrefix = buildTsExtends.match(/^(?:\.?\/)/) ? '' : './'
    const buildTsConfig: TsConfig = {
      extends: `${buildTsExtendsPrefix}${buildTsExtends }`,
      include: packages.reduce((result, pkg) => {
        result.push(
          relative(this.projectPath, resolve(pkg.path, 'index.ts')),
          relative(this.projectPath, resolve(pkg.path, 'src/**/*.ts')),
        )
        return result
      }, []),
      exclude: packages.reduce((result, pkg) => {
        result.push(
          relative(this.projectPath, resolve(pkg.path, 'node_modules')),
          relative(this.projectPath, resolve(pkg.path, '**/*.spec.ts')),
        )
        return result
      }, []),
      references: packages.map(pkg => ({
        path: join(this.packagesDir, pkg.scope || '', pkg.name, this.buildTsConfigFileName),
      })),
    }

    await Util.writeJson(this.buildTsConfigPath, buildTsConfig)
  }

  public async updateProjectPackageBaseTsConfig(): Promise<void> {

    const baseTsExtends = relative(this.projectPath, this.tsConfigPath)
    const baseTsExtendsPrefix = baseTsExtends.match(/^(?:\.?\/)/) ? '' : './'
    const baseTsConfig = {
      extends: `${baseTsExtendsPrefix}${baseTsExtends}`,
      compilerOptions: Object.assign({}, this.compilerOptions, {
        composite: true,
        rootDir: this.packagesDir,
      }),
    }
    await Util.writeJson(this.baseTsConfigPath, baseTsConfig)

  }

  public async updatePackageConfigs(packages: PackageInfo[]): Promise<void> {
    await Promise.all(packages.map(info => Promise.all([
      this.updatePackageTsConfig(info),
      this.updatePackageBuildConfig(info),
    ])))
  }

  public async npmCommand(command: string, args: string[], packages?: PackageInfo[]): Promise<void> {
    if (!packages) {
      packages = await this.discoverPackages()
    }

    await Promise.all(packages.map(info => Util.spawn('npm', [command].concat(args), {
      cwd: info.path,
    })))
  }

  public async installPackageDependencies(packages?: PackageInfo[]): Promise<void> {
    if (!packages) {
      packages = await this.discoverPackages()
    }
    await Promise.all(packages.map(info => Util.spawn('npm', ['install'], {
      cwd: info.path,
    })))
  }

  private async findScopedPackages(packagesPath: string, scopes: string[]): Promise<PackageInfo[]> {
    return (await Promise.all(scopes.map(scope => this.findPackages(resolve(packagesPath, scope), scope))))
      .reduce((result, packages) => result.concat(packages), [])
  }

  private async findPackages(packagesPath: string, scope?: string): Promise<PackageInfo[]> {
    const packageDirs = await readdir(packagesPath)
    return Promise.all(packageDirs.map(async packageDir => {

      const packagePath = resolve(packagesPath, packageDir)
      const packageConfigPath = resolve(packagePath, 'package.json')
      const tsConfigPath = resolve(packagePath, 'tsconfig.json')
      const buildTsConfigPath = resolve(packagePath, this.buildTsConfigFileName)
      const buildTsConfig: any = {}
      const outPath = resolve(this.projectPath, this.tsConfig.compilerOptions.outDir, scope, packageDir)

      const [
        packageConfig,
        tsConfig,
        manifest,
        subPackages,
      ] = await Promise.all([
        await Util.readJson<Package>(packageConfigPath),
        await Util.readJson<TsConfig>(tsConfigPath, {}),
        await this.loadPackageManifest(packagePath),
        await this.findSubPackages(packagePath),
      ])

      return {
        path: resolve(packagesPath, packageDir),
        name: packageDir,
        scope,

        packageConfigPath,
        packageConfig,

        tsConfigPath,
        tsConfig,

        buildTsConfigPath,
        buildTsConfig,

        outPath,
        manifest,
        subPackages,
      }
    }))
  }

  private async findSubPackages(packagePath: string): Promise<string[]> {
    const configs = await Util.glob('*/**/tsconfig.json', { cwd: packagePath, ignore: 'node_modules/**' })
    if (!configs.length) {
      return undefined
    }
    return configs.map(dirname)
  }

  private async loadPackageManifest(packagePath: string): Promise<string[]> {
    const manifestPath = resolve(packagePath, '.buildermanifest')
    const globs = DEFAULT_MANIFEST.slice(0)
    if (await pathExists(manifestPath)) {
      globs.push(...(await readFile(manifestPath, 'utf-8')).split('\n'))
    }
    const results = await Promise.all(globs.map(glob => Util.glob(glob, {
      cwd: packagePath,
      ignore: 'node_modules/**',
    })))
    return results.reduce((result, globResults) => {
      result.push(...globResults)
      return result
    }, [])
  }

  private async updatePackageTsConfig(info: PackageInfo): Promise<PackageInfo> {
    info.tsConfig.extends = relative(info.path, this.tsConfigPath)

    await Util.writeJson(info.tsConfigPath, info.tsConfig)

    return info
  }

  private async updatePackageBuildConfig(info: PackageInfo): Promise<PackageInfo> {

    if (info.packageConfig.peerDependencies) {
      Object.keys(info.packageConfig.peerDependencies).forEach(dep => {
        if (this.scopes && this.scopes.find(scope => dep.startsWith(`@${scope}/`))) {
          if (!info.buildTsConfig.references) {
            info.buildTsConfig.references = []
          }
          const depPath = resolve(this.packagesPath, dep.substring(1))
          info.buildTsConfig.references.push({ path: join(relative(info.path, depPath), this.buildTsConfigFileName) })
        }
      })
    }
    info.buildTsConfig.extends = relative(info.path, this.baseTsConfigPath)
    info.buildTsConfig.include = [
      'index.ts',
      'src/**/*',
    ]
    if (info.subPackages) {
      info.subPackages.reduce((include, packageDir) => {
        include.push(
          join(packageDir, 'index.ts'),
          join(packageDir, 'src/**/*'),
        )
        return include
      }, info.buildTsConfig.include)
    }
    info.buildTsConfig.exclude = [
      'node_modules',
      '**/*.spec.ts',
    ]
    await Util.writeJson(info.buildTsConfigPath, info.buildTsConfig)

    return info
  }

}
