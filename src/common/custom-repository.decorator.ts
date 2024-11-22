import { SetMetadata } from '@nestjs/common';

export const CUSTOM_REPOSITORY = 'CUSTOM_REPOSITORY';

export function CustomRepository(entity: Function): ClassDecorator {
  return SetMetadata(CUSTOM_REPOSITORY, entity);
}
