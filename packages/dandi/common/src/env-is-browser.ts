/**
 * A boolean value representing whether the current environment is a browser environment.
 */
// eslint-disable-next-line no-new-func
export const ENV_IS_BROWSER = new Function(
  'try { return this === window } catch(err) { return false }',
)()
