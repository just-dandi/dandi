import { readFileSync } from 'fs'

import { spawn, SpawnOptions } from 'child_process'

import { readFile, writeFile } from 'fs-extra'
import * as glob from 'glob'

import { PackageInfo } from './package-info'

const JSON_SPACING = 2

export class Util {

  public static async writeJson(path: string, data: any): Promise<void> {
    return writeFile(path, JSON.stringify(data, null, JSON_SPACING), 'utf-8')
  }

  public static async readJson<T>(path: string, defaultValue?: any): Promise<T> {
    try {
      return JSON.parse(await readFile(path, 'utf-8'))
    } catch (err) {
      return this.handleReadJsonError(err, defaultValue)
    }
  }

  public static readJsonSync<T>(path: string, defaultValue?: any): T {
    try {
      return JSON.parse(readFileSync(path, 'utf-8'))
    } catch (err) {
      return this.handleReadJsonError(err, defaultValue)
    }
  }

  public static glob(pattern: string, options: glob.IOptions): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      glob(pattern, options, (err, matches) => {
        if (err) {
          return reject(err)
        }
        return resolve(matches)
      })
    })
  }

  public static spawn(command: string, args?: string[], options?: SpawnOptions): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      options = Object.assign(options || {}, {
        env: process.env,
      }, options)
      console.debug('Spawning', command, ...args, 'in', options && options.cwd || process.cwd())
      const cmd = spawn(command, args, options)
      let output: string = ''
      let error: string = ''
      cmd.stdout.on('data', chunk => output += chunk)
      cmd.stderr.on('data', chunk => error += chunk)
      cmd.on('close', code => code === 0 ? resolve(output) : reject(new Error(output + error)))
    })
  }

  public static spawnForPackage(info: PackageInfo, command: string, args?: string[], options?: SpawnOptions): Promise<string> {
    return Util.spawn(command, args, Object.assign({
      cwd: info.path,
    }, options))
  }

  public static spawnForPackages(packages: PackageInfo[], command: string, args?: string[], options?: SpawnOptions): Promise<string[]> {
    return Promise.all(packages.map(info => Util.spawnForPackage(info, command, args, options)))
  }

  private static handleReadJsonError(err: Error & { code?: string }, defaultValue: any): any {
    if (err.code === 'ENOENT' && defaultValue) {
      return defaultValue
    }
    throw err
  }
}
