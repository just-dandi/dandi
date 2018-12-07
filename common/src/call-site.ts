import CallSite = NodeJS.CallSite;

export function callsite(): CallSite[] {
  const ogPrep = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) => stack
  const stack = (new Error().stack.slice(1) as unknown) as CallSite[]
  Error.prepareStackTrace = ogPrep
  return stack
}
