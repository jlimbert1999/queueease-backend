import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from 'src/modules/users/entities/user.entity';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from './roles.decorator';

export const META_ROLE = 'roles';
export function Protected(...roles: UserRole[]) {
  return applyDecorators(Roles(roles), UseGuards(RoleGuard));
}
