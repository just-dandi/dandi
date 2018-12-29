export interface TsConfigCompilerOptions {
  composite?: boolean
  baseUrl?: string
  paths: { [path: string]: string[] }
  outDir?: string
}

export interface TsConfigProjectReference {
  path: string
}

export interface TsConfig {
  extends?: string
  compilerOptions?: TsConfigCompilerOptions
  references?: TsConfigProjectReference[]
  include?: string[]
  exclude?: string[]
  files?: string[]
}
