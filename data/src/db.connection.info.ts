import { ConfigToken }         from '@dandi/config';
import { ModelBase, Property } from '@dandi/model';

export class DbConnectionInfo extends ModelBase {

    public static configToken(key: string): ConfigToken<DbConnectionInfo> {
        return {
            key,
            type:      DbConnectionInfo,
            encrypted: true,
        };
    }

    constructor(source?: any) {
        super(source);
    }

    @Property(Number)
    public port: number;

    @Property(String)
    public host: string;

    @Property(String)
    public database: string;

}
