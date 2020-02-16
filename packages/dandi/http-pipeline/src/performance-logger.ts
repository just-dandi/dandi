export interface PerformanceLogger {
  mark(component: string, name: string): [number, number]
}
