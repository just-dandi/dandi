// eslint-disable-next-line no-new-func
export const isBrowser = new Function('try { return this === window; } catch(err) { return false; }')
