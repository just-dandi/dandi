import { Constructor } from '@dandi/common'

export interface DbQueryable {
  query(cmd: string, ...args: any[]): Promise<any[]>
  queryModel<T>(model: Constructor<T>, cmd: string, ...args: any[]): Promise<T[]>
  queryModelSingle<T>(model: Constructor<T>, cmd: string, ...args: any[]): Promise<T>
}
