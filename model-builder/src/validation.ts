import { DecoratorModelBuilder } from './decorator.model.builder';
import { TypeConverters } from './type.converters';

export const Validation: any[] = [...TypeConverters, DecoratorModelBuilder];
