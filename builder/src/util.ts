import { spawn, SpawnOptions } from 'child_process'
import { readFileSync } from 'fs'

import { Inject, Injectable, Logger } from '@dandi/core'

import { readFile, writeFile } from 'fs-extra'
import * as glob from 'glob'

import { PackageInfo } from './package-info'

const JSON_SPACING = 2

@Injectable()
export class Util {
  constructor(@Inject(Logger) private logger: Logger) {}

  public async writeJson(path: string, data: any): Promise<void> {
    return writeFile(path, JSON.stringify(data, null, JSON_SPACING) + '\n', 'utf-8')
  }

  public async readJson<T>(path: string, defaultValue?: any): Promise<T> {
    try {
      return JSON.parse(await readFile(path, 'utf-8'))
    } catch (err) {
      return this.handleReadJsonError(err, defaultValue)
    }
  }

  public readJsonSync<T>(path: string, defaultValue?: any): T {
    try {
      return JSON.parse(readFileSync(path, 'utf-8'))
    } catch (err) {
      return this.handleReadJsonError(err, defaultValue)
    }
  }

  public glob(pattern: string, options: glob.IOptions): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      glob(pattern, options, (err, matches) => {
        if (err) {
          return reject(err)
        }
        return resolve(matches)
      })
    })
  }

  public spawn(command: string, args?: string[], options?: SpawnOptions, ignoreErrors = false): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      options = Object.assign(
        options || {},
        {
          env: process.env,
        },
        options,
      )
      this.logger.debug('Spawning', command, ...args, 'in', (options && options.cwd) || process.cwd())
      const cmd = spawn(command, args, options)
      let output = ''
      let error = ''
      cmd.stdout.on('data', (chunk) => (output += chunk))
      cmd.stderr.on('data', (chunk) => (error += chunk))
      cmd.on('close', (code) => {
        if (code === 0 || ignoreErrors) {
          if (error) {
            this.logger.debug('Ignored error:', error)
          }
          resolve(error ? undefined : output)
        } else {
          reject(new Error(output + error))
        }
      })
    })
  }

  public spawnForPackage(
    info: PackageInfo,
    command: string,
    args?: string[],
    options?: SpawnOptions,
  ): Promise<string> {
    return this.spawn(
      command,
      args,
      Object.assign(
        {
          cwd: info.path,
        },
        options,
      ),
    )
  }

  public spawnForPackages(
    packages: PackageInfo[],
    command: string,
    args?: string[],
    options?: SpawnOptions,
  ): Promise<string[]> {
    return Promise.all(packages.map((info) => this.spawnForPackage(info, command, args, options)))
  }

  private handleReadJsonError(err: Error & { code?: string }, defaultValue: any): any {
    if (err.code === 'ENOENT' && defaultValue) {
      return defaultValue
    }
    throw err
  }
}
