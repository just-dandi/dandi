import { modelDecorator } from './model.decorator';

// TODO: this probably belongs in @dandi/data
// -- nope! putting it in data would require model libraries to reference core
//    data having a dependency on model is also not great - maybe a new data-model package if there are more decorators?
/**
 * Marks a member as being backed by JSON storage
 */
export function Json(): PropertyDecorator {
  return modelDecorator.bind(null, {
    json: true,
  });
}
