import { ConfigToken }         from '@dandi/config';
import { ModelBase, Property } from '@dandi/model';

import * as admin from 'firebase-admin';

export class FirebaseServiceAccount extends ModelBase implements admin.ServiceAccount {

    public static configToken(key: string): ConfigToken<FirebaseServiceAccount> {
        return {
            key,
            type:      FirebaseServiceAccount,
            encrypted: true,
        };
    }

    constructor(source?: any) {
        super(source);
    }

    @Property(String)
    public projectId?: string;

    @Property(String)
    public clientEmail?: string;

    @Property(String)
    public privateKey?: string;

}
