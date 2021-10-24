import { MonoTypeOperatorFunction } from 'rxjs'
import { filter } from 'rxjs/operators'

export const silence: () => MonoTypeOperatorFunction<never> = () => filter(() => false)
