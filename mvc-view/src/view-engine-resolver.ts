import { access, constants } from 'fs';
import { extname, resolve } from 'path';

import { Constructor } from '@dandi/common';
import { Inject, Injectable, Logger, Singleton } from '@dandi/core';

import { ViewEngine } from './view-engine';
import { ViewMetadata } from './view-metadata';
import { ViewEngineConfig } from './view-engine-config';

export interface ResolvedView {
  engine: ViewEngine;
  templatePath: string;
}

interface ViewEngineIndexedConfig extends ViewEngineConfig {
  index: number;
}

interface ConfiguredEngine {
  config: ViewEngineConfig;
  engine: ViewEngine;
}

function exists(path: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    access(path, constants.R_OK, (err) => {
      if (err) {
        return reject(false);
      }
      return resolve(true);
    });
  });
}

@Injectable(Singleton)
export class ViewEngineResolver {
  private engines: Map<Constructor<ViewEngine>, ViewEngine> = new Map<Constructor<ViewEngine>, ViewEngine>();
  private extensions: Map<string, ConfiguredEngine> = new Map<string, ConfiguredEngine>();
  private configured: ConfiguredEngine[] = [];
  private resolvedViews = new Map<string, ResolvedView>();

  constructor(
    @Inject(Logger) private logger: Logger,
    @Inject(ViewEngine) engines: ViewEngine[],
    @Inject(ViewEngineConfig) private configs: ViewEngineIndexedConfig[],
  ) {
    engines.forEach((engine) => this.engines.set(engine.constructor as any, engine));
    this.configs.forEach((config, index) => (config.index = index));

    // order the configs by preference:
    // - has a priority
    // - ascending priority value (0 is first)
    // - ascending index value (0 is first)
    this.configs.sort((a, b) => {
      if (!isNaN(a.priority) && !isNaN(b.priority)) {
        return a.priority - b.priority;
      }
      if (!isNaN(a.priority)) {
        return -1;
      }
      if (!isNaN(b.priority)) {
        return 1;
      }
      return a.index - b.index;
    });

    this.configs.forEach((config) => {
      if (this.extensions.has(config.extension)) {
        this.logger.warn(
          `'ignoring duplicate view engine configuration for extension '${config.extension}' (${config.engine.name})`,
        );
        return;
      }
      const result = {
        config,
        engine: this.engines.get(config.engine),
      };
      this.extensions.set(config.extension, result);
      this.configured.push(result);
    });
  }

  public async resolve(view: ViewMetadata, name?: string): Promise<ResolvedView> {
    const knownPath = resolve(view.context, name || view.name);
    let resolvedView = this.resolvedViews.get(knownPath);
    if (resolvedView) {
      return resolvedView;
    }
    resolvedView = await this.resolveFile(knownPath);
    this.resolvedViews.set(knownPath, resolvedView);
    return resolvedView;
  }

  private async resolveFile(knownPath: string): Promise<ResolvedView> {
    const ext = extname(knownPath).substring(1);

    // if the view name already has a supported extension, check to see if that file exists
    const existingExtConfig = ext && this.extensions.get(ext);
    if (existingExtConfig && (await exists(knownPath))) {
      return {
        templatePath: knownPath,
        engine: existingExtConfig.engine,
      };
    }

    for (const configured of this.configured) {
      const configuredPath = `${knownPath}.${configured.config.extension}`;
      if (await exists(configuredPath)) {
        return {
          templatePath: configuredPath,
          engine: configured.engine,
        };
      }
    }
  }
}
