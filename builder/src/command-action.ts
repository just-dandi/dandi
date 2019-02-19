import { InjectionToken } from '@dandi/core'
import { Command } from 'commander'

import { localOpinionatedToken } from './local-token'

export type Action = (...args: any[]) => Promise<void>

export type Filtered<TType, TCondition> = {
  [key in keyof TType]: TType[key] extends TCondition ? key: never
}
export type AllowedKeys<TType, TCondition> = Filtered<TType, TCondition>[keyof TType]
export type Subset<TType, TCondition> = Pick<TType, AllowedKeys<TType, TCondition>>

export type Actions<T> = Subset<T, Action>

export type CommandAction<THost> = keyof Actions<THost>
export const CommandAction: InjectionToken<CommandAction<any>> = localOpinionatedToken('CommandAction', {
  multi: false,
})

export const ActionHost = localOpinionatedToken('ActionHost', {
  multi: false,
})

export interface CommandInfo {
  command: Command
  args: string[]
}
export const CommandInfo = localOpinionatedToken<CommandInfo>('CommandInfo', {
  multi: false,
})
