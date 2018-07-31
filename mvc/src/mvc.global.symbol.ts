import { globalSymbol } from '@dandi/core';

export function mvcGlobalSymbol(desc: string): symbol {
  return globalSymbol(`mvc:${desc}`);
}
