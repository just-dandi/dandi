export interface PerfRecorder {
  mark(component: string, name: string): [number, number];
}
