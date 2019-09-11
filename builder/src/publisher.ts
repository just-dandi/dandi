import { Inject, Injectable, Logger } from '@dandi/core'

import { Builder } from './builder'
import { BuilderProject } from './builder-project'
import { PackageInfo } from './package-info'
import { Util } from './util'

interface PublishState {
  published: Set<string>
  remaining: PackageInfo[]
}

@Injectable()
export class Publisher {

  constructor(
    @Inject(BuilderProject) private project: BuilderProject,
    @Inject(Builder) private builder: Builder,
    @Inject(Util) private util: Util,
    @Inject(Logger) private logger: Logger,
  ) { }

  public async publish(): Promise<void> {
    const packages = await this.project.discoverPackages()
    await this.builder.build()

    const state: PublishState = {
      published: new Set<string>(),
      remaining: packages.slice(0),
    }

    let lastBatch: PackageInfo[]
    while (!lastBatch || lastBatch.length > 0) {
      lastBatch = await this.publishClearedPackages(state)
      lastBatch.forEach(info => state.published.add(info.fullName))
      // eslint-disable-next-line require-atomic-updates
      state.remaining = state.remaining.filter(info => !state.published.has(info.fullName))
    }

    if (state.remaining.length) {
      const remainingNames = state.remaining.map(info => info.fullName)
      throw new Error(`Unable to publish packages due to possible circular dependencies: ${remainingNames.join(', ')}`)
    }
  }

  public async unpublish(version?: string): Promise<void> {
    const packages = await this.project.discoverPackages()
    const registry = this.project.npmOptions && this.project.npmOptions.registry
    if (!version) {
      version = this.project.mainPkg.version
    }
    await Promise.all(packages.map(info => {
      const unpublishArgs = ['unpublish', `${info.fullName}@${version}`]
      if (registry) {
        unpublishArgs.push('--registry', registry)
      }
      return this.util.spawn('npm', unpublishArgs)
    }))
  }

  public async deprecate(message: string, version?: string): Promise<void> {
    const packages = await this.project.discoverPackages()
    const registry = this.project.npmOptions && this.project.npmOptions.registry
    if (!version) {
      version = this.project.mainPkg.version
    }
    await Promise.all(packages.map(info => {
      const deprecateArgs = ['deprecate', `${info.fullName}@${version}`, `"${message.replace(/"/g, '\\"')}"`]
      if (registry) {
        deprecateArgs.push('--registry', registry)
      }
      return this.util.spawn('npm', deprecateArgs)
    }))
  }

  private async publishClearedPackages(state: PublishState): Promise<PackageInfo[]> {
    const toPublish = this.findClearedPackages(state)
    await Promise.all(toPublish.map(info => this.checkInfoAndPublish(info, this.project.npmOptions && this.project.npmOptions.registry)))
    return toPublish
  }

  private findClearedPackages(state: PublishState): PackageInfo[] {
    return state.remaining
      .filter(info => !info.projectDependencies.length || info.projectDependencies.every(dep => state.published.has(dep)))
  }

  private async checkInfoAndPublish(info: PackageInfo, registry: string): Promise<string> {
    const publishTarget = `${info.fullName}@${this.project.mainPkg.version}`

    this.logger.debug(`${publishTarget}: checking for existing package...`)
    let packageInfo = await this.getPackageInfo(info, registry)
    if (packageInfo[this.project.mainPkg.version]) {
      this.logger.warn(`${publishTarget}: skipping publish, already exists - published`, packageInfo[this.project.mainPkg.version])
      return packageInfo[this.project.mainPkg.version]
    }

    this.logger.debug(`${publishTarget}: publishing${registry ? ` to ${registry}` : ''}...`)
    const publishArgs = ['publish']
    if (registry) {
      publishArgs.push('--registry', registry)
    }
    if (!packageInfo[this.project.mainPkg.version] && !info.packageConfig.private) {
      publishArgs.push('--access', 'public')
    }
    publishArgs.push('--tag', 'latest')
    await this.util.spawn('npm', publishArgs, {
      cwd: info.outPath,
    })
    this.logger.debug(`${publishTarget}: publish complete`)

    while(!packageInfo[this.project.mainPkg.version]) {
      this.logger.debug(`${publishTarget}: waiting for package to become available...`)
      packageInfo = await this.getPackageInfo(info, registry)
    }
    this.logger.debug(`${publishTarget}: done.`)
  }

  private async getPackageInfo(info: PackageInfo, registry: string): Promise<{ [key: string]: string }> {
    const infoArgs = ['info', info.fullName, 'time', '--json']
    if (registry) {
      infoArgs.push('--registry', registry)
    }
    return JSON.parse((await this.util.spawn('npm', infoArgs, undefined, true)) || '{}')
  }

}
