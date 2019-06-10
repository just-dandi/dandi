/**
 * An object containing debugging metadata about where a {@see Provider} is being registered.
 */
export interface RepositoryRegistrationSource {
  constructor: Function
  tag?: string
  parent?: RepositoryRegistrationSource
}
