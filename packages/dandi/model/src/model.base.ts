/**
 * A base class that can be used for model classes.
 */
export abstract class ModelBase {
  protected constructor(obj?: any) {
    Object.assign(this, obj)
  }
}
