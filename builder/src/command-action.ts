import { Command } from 'commander'

import { localToken } from './local-token'

export type Action = (...args: any[]) => Promise<void>

export type Filtered<TType, TCondition> = {
  [TKey in keyof TType]: TType[TKey] extends TCondition ? TKey : never
}
export type AllowedKeys<TType, TCondition> = Filtered<TType, TCondition>[keyof TType]
export type Subset<TType, TCondition> = Pick<TType, AllowedKeys<TType, TCondition>>

export type Actions<T> = Subset<T, Action>

export type CommandAction<THost> = keyof Actions<THost>
export const CommandAction = localToken.opinionated<CommandAction<any>>('CommandAction', {
  multi: false,
})

export const ActionHost = localToken.opinionated<any>('ActionHost', {
  multi: false,
})

export interface CommandInfo {
  command: Command
  args: string[]
}
export const CommandInfo = localToken.opinionated<CommandInfo>('CommandInfo', {
  multi: false,
})
