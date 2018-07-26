import { readdir, stat }    from 'fs-extra';
import { extname, resolve } from 'path';

import { Inject }     from './inject.decorator';
import { Injectable } from './injectable.decorator';
import { Provider }   from './provider';
import { Repository } from './repository';

import { Scanner, ScannerConfig, scannerProvider } from './scanner';

const DEFAULT_EXTENSIONS = ['.ts', '.js'];

export interface FileSystemScannerConfig {
    extensions?: string[];
    include?: RegExp | RegExp[];
}

@Injectable()
export class FileSystemScanner implements Scanner {

    public static withConfig(config: FileSystemScannerConfig[]): Provider<Scanner> {
        return scannerProvider(FileSystemScanner, config);
    }

    constructor(@Inject(ScannerConfig) private config: FileSystemScannerConfig[]) {
    }

    private async scanDir(config: FileSystemScannerConfig, dirPath: string): Promise<any[]> {
        const files = await readdir(dirPath);
        const modules = await Promise.all(files.map(async file => {
            const stats = await stat(file);
            if (stats.isDirectory()) {
                return await this.scanDir(config, resolve(dirPath, file));
            }
            if (!stats.isFile()) {
                return;
            }
            const ext = extname(file);
            if ((config.extensions || DEFAULT_EXTENSIONS).includes(ext)) {
                return require(file);
            }
        }));
        return modules.reduce((result, modules) => {
            if (Array.isArray(modules)) {
                result.push(...modules);
            } else {
                result.push(module);
            }
            return result;
        }, []);
    }

    public async scan(): Promise<Repository> {
        const repo = Repository.for(this);
        await Promise.all(this.config.map(async config => {
            const modules = await this.scanDir(config, process.cwd());
            modules.forEach(module => repo.register(module));
        }));
        return repo;
    }
}
