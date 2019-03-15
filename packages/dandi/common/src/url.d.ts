/**
 * A placeholder for the current environment's URL implementation. For NodeJS, this class will be the NodeJS
 * [URL](https://nodejs.org/api/url.html). For browsers, it will be the browser's native
 * [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL).
 */
export class Url {
  constructor(url: string)

  hash: string
  host: string
  hostname: string
  href: string
  readonly origin: string
  password: string
  pathname: string
  port: string
  protocol: string
  search: string
  readonly searchParams: URLSearchParams
  username: string

  toString(): string
}

/**
 * @ignore
 */
export interface URLSearchParams {
  append(name: string, value: string): void

  delete(name: string): void

  get(name: string): string | null

  getAll(name: string): string[]

  has(name: string): boolean

  set(name: string, value: string): void
}
