export type Option<T> = { [key in keyof T]?: T[key] };
