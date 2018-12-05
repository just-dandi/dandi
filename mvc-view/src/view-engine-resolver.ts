import { access, constants } from 'fs';
import { extname, resolve } from 'path';

import { Constructor } from '@dandi/common';
import { Inject, Injectable, Logger } from '@dandi/core';

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

@Injectable()
export class ViewEngineResolver {
  private engines: Map<Constructor<ViewEngine>, ViewEngine> = new Map<Constructor<ViewEngine>, ViewEngine>();
  private extensions: Map<string, ConfiguredEngine> = new Map<string, ConfiguredEngine>();
  private configured: ConfiguredEngine[] = [];

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

  public async resolve(view: ViewMetadata): Promise<ResolvedView> {
    if (view.path) {
      return {
        templatePath: view.path,
        engine: this.extensions.get(extname(view.path).substring(1)).engine,
      };
    }
    return this.resolveFile(view);
  }

  private async resolveFile(view: ViewMetadata): Promise<ResolvedView> {
    const path = resolve(view.context, view.name);
    const ext = extname(path).substring(1);

    // if the view name already has a supported extension, check to see if that file exists
    const existingExtConfig = ext && this.extensions.get(ext);
    if (existingExtConfig && (await exists(path))) {
      return {
        templatePath: path,
        engine: existingExtConfig.engine,
      };
    }

    for (const configured of this.configured) {
      const configuredPath = `${path}.${configured.config.extension}`;
      if (await exists(configuredPath)) {
        return {
          templatePath: configuredPath,
          engine: configured.engine,
        };
      }
    }
  }
}
