/**
 * A `symbol` or `string` presenting the custom inspector for the current environment.
 *
 * The value will be the `util.inspect.custom` symbol for NodeJS, or `toString()` for browser environments.
 */
export const CUSTOM_INSPECTOR: string | symbol
