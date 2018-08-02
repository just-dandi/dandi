import { Uuid } from '@dandi/common';
import { ModelBase, Property, Required } from '@dandi/model';

export class DataModelRequest extends ModelBase {
  constructor(source?: any) {
    super(source);
  }

  @Property(String)
  @Required()
  public name: string;

  @Property(String)
  public tag: string;
}

export class DataModel extends DataModelRequest {
  constructor(source?: any) {
    super(source);
  }

  @Property(Uuid)
  @Required()
  public id: Uuid;
}
