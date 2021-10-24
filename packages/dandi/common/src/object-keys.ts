export type Keys<T extends {}> = (keyof T)[]

export function keys<T extends {}>(obj: T): Keys<T> {
  return Object.keys(obj) as Keys<T>
}
