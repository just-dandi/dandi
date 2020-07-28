import { localToken } from './local-token'

export interface StageVariables {
  [name: string]: string
}

export const StageVariables = localToken.opinionated<StageVariables>('StageVariables', {
  multi: false,
})
