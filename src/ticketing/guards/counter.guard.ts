import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { Counter } from 'src/administration/entities';

@Injectable()
export class CounterGuard implements CanActivate {
  constructor(@InjectRepository(Counter) private counterRepository: Repository<Counter>) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request['user']) throw new InternalServerErrorException('User is not authenticated');
    const ip = this._getIp(request);
    const counter = await this.counterRepository.findOne({
      where: { ip: ip },
      relations: { branch: true, services: true },
      select: { branch: { id: true, name: true }, services: { id: true, name: true } },
    });
    if (!counter) throw new ForbiddenException(`El equipo ${request['ip']} no esta registrado`);
    request['counter'] = counter;
    return true;
  }

  private _getIp(request: Request): string {
    if (request.ip.startsWith('::ffff:')) return request.ip.substring(7);
    return request.ip;
  }
}
