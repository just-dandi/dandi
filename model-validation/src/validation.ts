import { DecoratorModelValidator }          from './decorator.model.validator';
import { TypeValidators }                   from './type.validators';

export const Validation: any[] = [
    ...TypeValidators,
    DecoratorModelValidator,
];
