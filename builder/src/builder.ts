import { resolve } from 'path'

import { copy, pathExists } from 'fs-extra'

import { BuilderProject, PackageInfo } from './builder-project'
import { Util } from './util'

export class Builder {

  constructor(private readonly project: BuilderProject) {}

  public async build(): Promise<void> {
    const packages = await this.project.discoverPackages()

    await this.project.updateConfigs(packages)

    try {
      await this.compile()
    } catch (err) {
      console.error('compile failed', err)
      throw err
    }

    try {
      await this.finalizePackages(packages)
    } catch (err) {
      console.error('error finalizing packages', err)
      throw err
    }

  }

  private compile(): Promise<any> {
    return Util.spawn('tsc', ['-b', this.project.buildTsConfigPath], {
      cwd: this.project.projectPath,
    })
  }

  private finalizePackages(packages: PackageInfo[]): Promise<any> {
    return Promise.all(packages.map(info => Promise.all([
      this.copyPackageJson(info),
      this.copyLicense(info),
      this.copyManifestFiles(info),
    ])))
  }

  private async copyPackageJson(info: PackageInfo): Promise<void> {
    const builtPackage = Object.assign({}, info.packageConfig, {
      version: this.project.mainPkg.version,
      author: this.project.mainPkg.author,
      repository: this.project.mainPkg.repository,
      bugs: this.project.mainPkg.bugs,
      homepage: this.project.mainPkg.homepage,
      license: this.project.mainPkg.license,
      module: 'index.js',
      main: 'index.js',
    })

    // replace versions for configured scopes
    if (builtPackage.peerDependencies) {
      Object.keys(builtPackage.peerDependencies).forEach(dep => {
        if (builtPackage.peerDependencies[dep] === '*' && this.project.scopes && this.project.scopes.find(scope => dep.startsWith(`@${scope}/`))) {
          builtPackage.peerDependencies[dep] = this.project.mainPkg.version
        }
      })
    }
    await Util.writeJson(resolve(info.outPath, 'package.json'), builtPackage)
  }

  private async copyLicense(info: PackageInfo): Promise<void> {
    if (!this.project.licenseFile) {
      return
    }
    await this.copyProjectFile(info, this.project.licenseFile)
  }

  private async copyPackageFile(info: PackageInfo, packageFileName: string, skipIfNotExists: boolean = false): Promise<void> {
    try {
      const sourcePath = resolve(info.path, packageFileName)
      if (!(await pathExists(sourcePath))) {
        if (skipIfNotExists) {
          return
        }
        throw new Error(`${sourcePath} does not exist`)
      }
      await copy(sourcePath, resolve(info.outPath, packageFileName))
    } catch (err) {
      console.error('error copying package file', info.name, packageFileName, err)
      throw err
    }
  }

  private copyProjectFile(info: PackageInfo, projectFileName: string): Promise<void> {
    try {
      return copy(resolve(this.project.projectPath, projectFileName), resolve(info.outPath, projectFileName))
    } catch (err) {
      console.error('error copying project file', info.name, projectFileName, err)
      throw err
    }
  }

  private async copyManifestFiles(info: PackageInfo): Promise<void> {
    if (!info.manifest) {
      return
    }
    try {
      await Promise.all(info.manifest.map(this.copyPackageFile.bind(this, info)))
    } catch (err) {
      console.error('error copying manifest files', info.name)
      throw err
    }
  }

}
