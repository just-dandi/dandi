import { keys } from '@dandi/common'
import { filter, map, Observable, OperatorFunction, pairwise, share } from 'rxjs'

export type NoChanges<T extends {}> = { [TKey in keyof T]: never }

function makeNoChanges<T extends {}>(): NoChanges<T> {
  return {} as NoChanges<T>
}

function hasChanges<T>(noChanges: NoChanges<T>): (changes: Partial<T>) => boolean {
  return (changes) => changes !== noChanges
}

export function changes<T extends {}>(): OperatorFunction<T, Partial<T>> {
  return function changesOperator<T extends {}>($input: Observable<T>): Observable<Partial<T>> {
    const NO_CHANGES = makeNoChanges<T>()
    return $input.pipe(
      pairwise(),
      map(([prev, current]) => {
        const inputKeys = keys(current)
        return inputKeys.reduce((result, key) => {
          if (current[key] === prev[key]) {
            return result
          }
          return Object.assign({}, result, { [key]: current[key] })
        }, NO_CHANGES)
      }),
      filter(hasChanges(NO_CHANGES)),
      share(),
    )
  }
}
