import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/common/utils/enum/user-enum';

export const RBAC = Reflector.createDecorator<UserRole>;
