export interface RepositoryRegistrationSource {
  constructor: Function
  tag?: string
  parent?: RepositoryRegistrationSource
}
