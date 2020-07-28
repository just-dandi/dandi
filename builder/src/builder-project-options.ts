import { localToken } from './local-token'

export interface BuilderProjectOptions {
  projectPath?: string
  configFile?: string
}

export const BuilderProjectOptions = localToken.opinionated<BuilderProjectOptions>('BuilderProjectOptions', {
  multi: false,
})
