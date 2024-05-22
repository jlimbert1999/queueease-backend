import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CounterGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: User = request['user'];
    if (!user.counter) throw new ForbiddenException('Sin asginacion a ventanilla');
    if (!user.counter.branch) throw new InternalServerErrorException('Branch for counter is undefined');
    return true;
  }
}
