export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min
}

export function generateRandomInt(min: number, max: number): () => number {
  return randomInt.bind(undefined, min, max)
}

export type RandomOpts<T> = T[] | RandomOpts<T>[]

export interface RandomFn<T> {
  (opts: RandomOpts<T>): T
}

export function random<T>(opts: RandomOpts<T>): T {
  const next = opts[randomInt(0, opts.length - 1)]
  if (Array.isArray(next)) {
    return random(next)
  }
  return next
}

export function generateRandom<T>(opts: RandomOpts<T>): () => T {
  const rnd = random as RandomFn<T>
  return rnd.bind(undefined, opts)
}
