export abstract class ModelBase {
    protected constructor(obj?: any) {
        Object.assign(this, obj);
    }
}
