import { localOpinionatedToken } from './local-token'

export interface BuilderProjectOptions {
  projectPath?: string
  configFile?: string
}

export const BuilderProjectOptions = localOpinionatedToken('BuilderProjectOptions', {
  multi: false,
})
