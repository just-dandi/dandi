import { modelDecorator } from './model.decorator';

// TODO: this probably belongs in @dandi/data
/**
 * Marks a member as being backed by JSON storage
 */
export function Json() {
    return modelDecorator.bind(null, {
        json: true,
    });
}
