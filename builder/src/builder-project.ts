import { dirname, join, relative, resolve } from 'path'

import { Inject, Injectable, Logger, Optional } from '@dandi/core'

import { pathExists, readdir, readFile } from 'fs-extra'

import { BUILD_CONFIG_DEFAULTS, BuilderConfig, NpmOptions } from './builder-config'
import { BuilderProjectOptions } from './builder-project-options'
import { InvalidPackageError } from './invalid-package-error'
import { PackageInfo, InvalidPackageInfo } from './package-info'
import { TsConfig, TsConfigCompilerOptions } from './ts-config'
import { Util } from './util'

export const DEFAULT_MANIFEST = ['**/*.md']

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
  private?: boolean
}

export const BUILDER_PROJECT_DEFAULTS: BuilderProjectOptions = {
  configFile: './.builderrc',
}

@Injectable()
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
  public readonly npmOptions: NpmOptions

  private _packages: PackageInfo[]
  public get packages(): PackageInfo[] {
    return this._packages
  }

  constructor(
    @Inject(BuilderProjectOptions) @Optional() options: BuilderProjectOptions,
    @Inject(Util) private util: Util,
    @Inject(Logger) private logger: Logger,
  ) {
    this.configFile = options.configFile || BUILDER_PROJECT_DEFAULTS.configFile

    this.configFilePath = resolve(process.cwd(), this.configFile)
    this.projectPath = dirname(this.configFilePath)

    Object.assign(this, BUILD_CONFIG_DEFAULTS, this.util.readJsonSync(this.configFilePath))

    this.tsConfigPath = resolve(this.projectPath, this.tsConfigFileName)
    this.buildTsConfigPath = resolve(this.projectPath, this.buildTsConfigFileName)
    this.baseTsConfigPath = resolve(this.projectPath, this.packageBaseTsConfigFileName)
    this.packagesPath = resolve(this.projectPath, this.packagesDir)

    this.tsConfig = this.util.readJsonSync(this.tsConfigPath)

    this.mainPkg = this.util.readJsonSync(resolve(this.projectPath, 'package.json'))
  }

  public async discoverPackages(): Promise<PackageInfo[]> {
    this.logger.debug('discoverPackages')
    this._packages = this.scopes
      ? await this.findScopedPackages(this.packagesPath, this.scopes)
      : await this.findPackages(this.packagesPath)
    this.validatePackages(this._packages)
    return this._packages
  }

  public async updateConfigs(packages?: PackageInfo[]): Promise<void> {
    this.logger.debug('updateConfigs', packages)
    this.logger.info('Discovering packages and updating configurations...')
    if (!packages || !packages.length) {
      packages = await this.discoverPackages()
    }
    await Promise.all([
      this.updateProjectTsConfig(),
      this.updateProjectPackageBaseTsConfig(),
      this.updateProjectBuildTsConfig(packages),
      this.updatePackageConfigs(packages),
    ])
    this.logger.info('Updated configurations for packages\n ', packages.map((info) => info.fullName).join('\n  '))
  }

  public async updateProjectTsConfig(): Promise<void> {
    this.logger.debug('updateProjectTsConfig')
    if (this.scopes) {
      this.tsConfig.compilerOptions.baseUrl = '.'
      this.tsConfig.compilerOptions.paths = this.scopes.reduce((result, scope) => {
        result[`@${scope}/*`] = ['./' + join(this.packagesDir, scope, '*')]
        return result
      }, {})
      await this.util.writeJson(this.tsConfigPath, this.tsConfig)
    }
  }

  public async updateProjectBuildTsConfig(packages: PackageInfo[]): Promise<void> {
    this.logger.debug('updateProjectBuildTsConfig', packages)

    const buildTsExtends = relative(this.projectPath, this.baseTsConfigPath)
    const buildTsExtendsPrefix = buildTsExtends.match(/^(?:\.?\/)/) ? '' : './'
    const buildTsConfig: TsConfig = {
      extends: `${buildTsExtendsPrefix}${buildTsExtends}`,
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
      references: packages.map((pkg) => ({
        path: join(this.packagesDir, pkg.scope || '', pkg.name, this.buildTsConfigFileName),
      })),
    }

    await this.util.writeJson(this.buildTsConfigPath, buildTsConfig)
  }

  public async updateProjectPackageBaseTsConfig(): Promise<void> {
    this.logger.debug('updateProjectPackageBaseTsConfig')

    const baseTsExtends = relative(this.projectPath, this.tsConfigPath)
    const baseTsExtendsPrefix = baseTsExtends.match(/^(?:\.?\/)/) ? '' : './'
    const baseTsConfig = {
      extends: `${baseTsExtendsPrefix}${baseTsExtends}`,
      compilerOptions: Object.assign({}, this.compilerOptions, {
        composite: true,
        rootDir: this.packagesDir,
      }),
    }
    await this.util.writeJson(this.baseTsConfigPath, baseTsConfig)
  }

  public async updatePackageConfigs(packages: PackageInfo[]): Promise<void> {
    this.logger.debug('updatePackageConfigs', packages)
    await Promise.all(
      packages.map((info) => Promise.all([this.updatePackageTsConfig(info), this.updatePackageBuildConfig(info)])),
    )
  }

  public async npmCommand(args: string[], packages?: PackageInfo[]): Promise<void> {
    this.logger.debug('npmCommand', ...args, packages)
    if (!packages) {
      packages = await this.discoverPackages()
    }

    await this.util.spawnForPackages(
      packages,
      'yarn',
      args.filter((arg) => arg),
    )
  }

  public async yarnOutdated(): Promise<void> {
    this.logger.debug('yarnOutdated')
    const packages = await this.discoverPackages()
    const outdated = await Promise.all(
      packages.map(async (info) => {
        return {
          name: info.fullName,
          data: await (async () => {
            try {
              return await this.util.spawnForPackage(info, 'yarn', ['outdated'])
            } catch (err) {
              return err.message
            }
          })(),
        }
      }),
    )
    if (!outdated.length) {
      this.logger.info('All packages are up to date')
      return
    }
    this.logger.info('')
    outdated.forEach((info) => {
      if (info.data) {
        this.logger.info(`${info.name}\n`, info.data)
      }
    })
  }

  private async findScopedPackages(packagesPath: string, scopes: string[]): Promise<PackageInfo[]> {
    return (
      await Promise.all(scopes.map((scope) => this.findPackages(resolve(packagesPath, scope), scope)))
    ).reduce((result, packages) => result.concat(packages), [])
  }

  private async findPackages(packagesPath: string, scope?: string): Promise<PackageInfo[]> {
    const packageDirs = await readdir(packagesPath)
    return Promise.all<PackageInfo>(
      packageDirs.map(async (packageDir) => {
        const packagePath = resolve(packagesPath, packageDir)
        const packageConfigPath = resolve(packagePath, 'package.json')
        const tsConfigPath = resolve(packagePath, 'tsconfig.json')
        const buildTsConfigPath = resolve(packagePath, this.buildTsConfigFileName)
        const buildTsConfig: any = {}
        const outPath = resolve(this.projectPath, this.tsConfig.compilerOptions.outDir, scope, packageDir)

        const [packageConfig, tsConfig, manifest, subPackages] = await Promise.all([
          this.util.readJson<Package>(packageConfigPath),
          this.util.readJson<TsConfig>(tsConfigPath, {}),
          this.loadPackageManifest(packagePath),
          this.findSubPackages(packagePath),
        ])

        const projectDependencies = Object.keys(packageConfig.peerDependencies).filter(
          (dep) => this.scopes && this.scopes.find((scope) => dep.startsWith(`@${scope}/`)),
        )

        return {
          path: resolve(packagesPath, packageDir),
          name: packageDir,
          scope,
          fullName: scope ? `@${scope}/${packageDir}` : packageDir,

          packageConfigPath,
          packageConfig,

          projectDependencies,

          tsConfigPath,
          tsConfig,

          buildTsConfigPath,
          buildTsConfig,

          outPath,
          manifest,
          subPackages,
        }
      }),
    )
  }

  private async findSubPackages(packagePath: string): Promise<string[]> {
    const configs = await this.util.glob('*/**/+(tsconfig.json|.builderinclude)', {
      cwd: packagePath,
      ignore: 'node_modules/**',
      dot: true,
    })
    if (!configs.length) {
      return undefined
    }
    return configs.map(dirname)
  }

  private validatePackages(packages: PackageInfo[]): void {
    const invalidPkgs = packages
      .map(
        (validatePkg) =>
          [
            validatePkg,
            validatePkg.projectDependencies.filter((dep) => !packages.some((pkg) => pkg.fullName === dep)),
          ] as InvalidPackageInfo,
      )
      .filter(([, invalidDeps]) => invalidDeps.length)
    if (invalidPkgs.length) {
      throw new InvalidPackageError(invalidPkgs)
    }
  }

  private async loadPackageManifest(packagePath: string): Promise<string[]> {
    const manifestPath = resolve(packagePath, '.buildermanifest')
    const globs = DEFAULT_MANIFEST.slice(0)
    if (await pathExists(manifestPath)) {
      globs.push(...(await readFile(manifestPath, 'utf-8')).split('\n'))
    }
    const results = await Promise.all(
      globs.map((glob) =>
        this.util.glob(glob, {
          cwd: packagePath,
          ignore: 'node_modules/**',
        }),
      ),
    )
    return results.reduce((result, globResults) => {
      result.push(...globResults)
      return result
    }, [])
  }

  private async updatePackageTsConfig(info: PackageInfo): Promise<PackageInfo> {
    info.tsConfig.extends = relative(info.path, this.tsConfigPath)

    await this.util.writeJson(info.tsConfigPath, info.tsConfig)

    return info
  }

  private async updatePackageBuildConfig(info: PackageInfo): Promise<PackageInfo> {
    if (info.packageConfig.peerDependencies) {
      info.projectDependencies.forEach((dep) => {
        if (!info.buildTsConfig.references) {
          info.buildTsConfig.references = []
        }
        const depPath = resolve(this.packagesPath, dep.substring(1))
        info.buildTsConfig.references.push({
          path: join(relative(info.path, depPath), this.buildTsConfigFileName),
        })
      })
    }
    info.buildTsConfig.extends = relative(info.path, this.baseTsConfigPath)
    info.buildTsConfig.include = ['index.ts', 'src/**/*']
    if (info.subPackages) {
      info.subPackages.reduce((include, packageDir) => {
        include.push(join(packageDir, 'index.ts'), join(packageDir, 'src/**/*'))
        return include
      }, info.buildTsConfig.include)
    }
    info.buildTsConfig.exclude = ['node_modules', '**/*.spec.ts']
    await this.util.writeJson(info.buildTsConfigPath, info.buildTsConfig)

    return info
  }
}
