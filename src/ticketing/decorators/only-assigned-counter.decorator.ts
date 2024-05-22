import { UseGuards, applyDecorators } from '@nestjs/common';
import { Protected } from 'src/auth/decorators';
import { UserRole } from 'src/users/entities/user.entity';
import { CounterGuard } from '../guards/counter.guard';

export function onlyAssignedCounter() {
  return applyDecorators(Protected(UserRole.OFFICER), UseGuards(CounterGuard));
}
