export interface RegistrationSource {
  constructor: Function
  tag?: string
  parent?: RegistrationSource
}
