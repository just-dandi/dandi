import { globalSymbol } from '@dandi/di-core';

export function mvcGlobalSymbol(desc: string): symbol {
    return globalSymbol(`mvc:${desc}`);
}
