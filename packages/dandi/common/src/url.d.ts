export class Url {
  constructor(url: string);

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

  toString(): string;
}

export interface URLSearchParams {
  append(name: string, value: string): void

  delete(name: string): void

  get(name: string): string | null

  getAll(name: string): string[]

  has(name: string): boolean

  set(name: string, value: string): void
}
