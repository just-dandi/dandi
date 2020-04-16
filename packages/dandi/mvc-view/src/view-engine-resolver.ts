import { access, constants } from 'fs'
import { basename, dirname, extname, resolve, join } from 'path'

import { AppError, Constructor } from '@dandi/common'
import { Inject, Injectable, Logger, Injector, Optional } from '@dandi/core'

import { MissingTemplateError } from './missing-template.error'
import { ViewEngine } from './view-engine'
import { ViewEngineConfig } from './view-engine-config'
import { ViewMetadata } from './view-metadata'
import { camelCase, kebabCase, startCase, snakeCase, lowerCase } from 'lodash'

export interface ResolvedView {
  engine: ViewEngine
  templatePath: string
}

export interface ViewEngineIndexedConfig extends ViewEngineConfig {
  index: number
  ignored: boolean
}

@Injectable()
export class ViewEngineResolver {
  private extensions: Map<string, Constructor<ViewEngine>> = new Map<string, Constructor<ViewEngine>>()
  private resolvedViews = new Map<string, ResolvedView>()

  private static exists(path: string): Promise<boolean> {
    return new Promise((resolve) => {
      access(path, constants.R_OK, (err) => {
        if (err) {
          return resolve(false)
        }
        return resolve(true)
      })
    })
  }

  constructor(
    @Inject(Logger) private logger: Logger,
    @Inject(ViewEngineConfig) @Optional() private configs: ViewEngineIndexedConfig[],
    @Inject(Injector) private injector: Injector,
  ) {
    if (!configs) {
      return
    }
    this.configs.forEach((config, index) => (config.index = index))

    // order the configs by preference:
    // - has a priority
    // - ascending priority value (0 is first)
    // - ascending index value (0 is first)
    this.configs.sort((a, b) => {
      if (!isNaN(a.priority) && !isNaN(b.priority)) {
        return a.priority - b.priority || a.index - b.index
      }
      if (!isNaN(a.priority)) {
        return -1
      }
      if (!isNaN(b.priority)) {
        return 1
      }
      return a.index - b.index
    })

    this.configs.forEach((config) => {
      if (this.extensions.has(config.extension)) {
        this.logger.warn(
          `ignoring duplicate view engine configuration for extension '${config.extension}' (${config.engine.name})`,
        )
        config.ignored = true
        return
      }
      this.extensions.set(config.extension, config.engine)
    })
  }

  public async resolve(view: ViewMetadata, name?: string): Promise<ResolvedView> {
    const knownPath = resolve(view?.context || '', name || view?.name)
    let resolvedView = this.resolvedViews.get(knownPath)
    if (resolvedView) {
      return resolvedView
    }
    resolvedView = await this.resolveFile(knownPath)
    this.resolvedViews.set(knownPath, resolvedView)
    return resolvedView
  }

  private async resolveFile(knownPath: string): Promise<ResolvedView> {
    const ext = extname(knownPath).substring(1)

    // if the view name already has a supported extension, check to see if that file exists
    const existingExtConfig = ext && this.extensions.get(ext)
    if (existingExtConfig && (await ViewEngineResolver.exists(knownPath))) {
      return {
        templatePath: knownPath,
        engine: await this.getEngineInstance(existingExtConfig),
      }
    }

    if (!this.configs) {
      throw new AppError('No view engines have been configured')
    }

    const alternateResolvedView = await this.getAlternateResolvedView(knownPath)

    if (alternateResolvedView) return alternateResolvedView
    
    throw new MissingTemplateError(this.getCasedPaths(knownPath), basename(knownPath), this.configs)
  }

  private getCasedPaths(path: string): string[] {
    const supportedNamingSchemes = {
      camelCase: (name: string) => camelCase(name),
      kebabCase: (name: string) => kebabCase(name),
      lowerCase: (name: string) => lowerCase(name).replace(/\s/g, ''),
      snakeCase: (name: string) => snakeCase(name),
      pascalCase: (name: string) => startCase(name).replace(/\s/g, ''),
    }
    const casedPaths = []
    const pathSegments = path.split('/')
    const fileName = pathSegments.pop()
    
    for (const namingScheme in supportedNamingSchemes) {
      casedPaths.push(join('/',...pathSegments, supportedNamingSchemes[namingScheme](fileName)))
    }
    return casedPaths
  }

  private async getAlternateResolvedView(knownPath: string): Promise<ResolvedView> {
    let configuredPath
    let resolvedConfig

    for (const config of this.configs) {
      if (config.ignored) {
        continue
      }
      const casedPaths = this.getCasedPaths(knownPath)
      for (const casedPath of casedPaths) {
        configuredPath = `${casedPath}.${config.extension}`
        if (await ViewEngineResolver.exists(configuredPath)) {
          resolvedConfig = config
          break
        }
      }
      
      if (resolvedConfig) break
    }

    if (configuredPath && resolvedConfig) {
      return {
        templatePath: configuredPath,
        engine: await this.getEngineInstance(resolvedConfig.engine)
      }
    }
  }

  private async getEngineInstance(engine: Constructor<ViewEngine>): Promise<ViewEngine> {
    const result = await this.injector.inject(engine)
    return result.singleValue
  }
}
