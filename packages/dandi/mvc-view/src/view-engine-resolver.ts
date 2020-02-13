import { access, constants } from 'fs'
import { basename, dirname, extname, resolve } from 'path'

import { AppError, Constructor } from '@dandi/common'
import { Inject, Injectable, Logger, Injector, Optional } from '@dandi/core'

import { MissingTemplateError } from './missing-template.error'
import { ViewEngine } from './view-engine'
import { ViewMetadata } from './view-metadata'
import { ViewEngineConfig } from './view-engine-config'

export interface ResolvedView {
  engine: ViewEngine;
  templatePath: string;
}

interface ViewEngineIndexedConfig extends ViewEngineConfig {
  index: number;
  ignored: boolean;
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

    for (const config of this.configs) {
      if (config.ignored) {
        continue
      }
      const configuredPath = `${knownPath}.${config.extension}`
      if (await ViewEngineResolver.exists(configuredPath)) {
        return {
          templatePath: configuredPath,
          engine: await this.getEngineInstance(config.engine),
        }
      }
    }

    throw new MissingTemplateError(dirname(knownPath), basename(knownPath))
  }

  private async getEngineInstance(engine: Constructor<ViewEngine>): Promise<ViewEngine> {
    const result = await this.injector.inject(engine)
    return result.singleValue
  }
}
