import { PerformanceLogger } from './performance-logger'

export class NoopPerformanceLogger implements PerformanceLogger {
  public mark(): [number, number] {
    return [0, 0]
  }
}
