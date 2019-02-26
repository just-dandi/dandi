import { Inject } from './inject.decorator'
import { Injectable } from './injectable.decorator'
import { MultiProvider } from './provider'
import { Repository } from './repository'
import { Scanner, ScannerConfig, scannerProvider } from './scanner'

export type ManualScannerFn = () => any[]

@Injectable()
export class ManualScanner implements Scanner {
  public static withConfig(...config: ManualScannerFn[]): MultiProvider<Scanner> {
    return scannerProvider(ManualScanner, config)
  }

  constructor(@Inject(ScannerConfig) private config: ManualScannerFn[]) {}

  public async scan(): Promise<Repository> {
    const repo = Repository.for(this)
    const source = {
      constructor: this.constructor,
      tag: '.scan',
    }
    this.config.forEach((config) => {
      const modules = config()
      modules.forEach((module) => {
        repo.register(source, module)
      })
    })
    return repo
  }
}
