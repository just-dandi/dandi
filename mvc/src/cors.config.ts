export type CorsWhitelist = Array<string | RegExp>
export type CorsWhitelistFn = (origin: string) => boolean
export type CorsOrigin = CorsWhitelist | CorsWhitelistFn
export interface CorsConfig {
  disablePreflight?: boolean;
  origin?: CorsOrigin;
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}
