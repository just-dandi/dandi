import { extname, resolve } from 'path'

import { Inject, Injectable, Provider, Registerable, Scanner, scannerProvider } from '@dandi/core'

import { readdir, stat } from 'fs-extra'

import { localToken } from './local-token'

const DEFAULT_EXTENSIONS = ['.ts', '.js']

export interface FileSystemScannerConfig {
  extensions?: string[];
  include?: RegExp | RegExp[];
}
export const FileSystemScannerConfig = localToken.opinionated('FileSystemScannerConfig', {
  multi: true,
})

@Injectable()
export class FileSystemScanner implements Scanner {
  public static withConfig(...configs: FileSystemScannerConfig[]): Provider<Scanner> {
    return scannerProvider(FileSystemScanner, ...configs.map(config => ({
      provide: FileSystemScannerConfig,
      useValue: config,
    })))
  }

  constructor(@Inject(FileSystemScannerConfig) private configs: FileSystemScannerConfig[]) {}

  public async scan(): Promise<Registerable[]> {
    return (await Promise.all(
      this.configs.map((config) => this.scanDir(config, process.cwd()),
      )))
      .reduce((result, modules) => {
        result.push(...modules)
        return result
      }, [])
  }

  private async scanDir(config: FileSystemScannerConfig, dirPath: string): Promise<any[]> {
    const files = await readdir(dirPath)
    const modules = await Promise.all(
      files.map(async (file) => {
        const stats = await stat(file)
        if (stats.isDirectory()) {
          return await this.scanDir(config, resolve(dirPath, file))
        }
        if (!stats.isFile()) {
          return
        }
        const ext = extname(file)
        if ((config.extensions || DEFAULT_EXTENSIONS).includes(ext)) {
          return require(file)
        }
      }),
    )
    return modules.reduce((result, modules) => {
      if (Array.isArray(modules)) {
        result.push(...modules)
      } else {
        result.push(module)
      }
      return result
    }, [])
  }
}
