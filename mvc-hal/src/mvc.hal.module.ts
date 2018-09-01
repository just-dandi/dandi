import { DefaultResourceComposer } from './default.resource.composer';
import { HalResultTransformer } from './hal.result.transformer';

export const MvcHal = [DefaultResourceComposer, HalResultTransformer];
