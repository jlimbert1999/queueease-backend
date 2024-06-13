import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { RequestStatus, ServiceRequest } from '../entities';

@Injectable()
export class RequestService {
  constructor(@InjectRepository(ServiceRequest) private requestRepository: Repository<ServiceRequest>) {}

  async getRequests({ counter }: User) {
    return await this.requestRepository.find({
      where: {
        status: RequestStatus.PENDING,
        branch: { id: counter.branch.id },
        service: In(counter.services.map((el) => el.id)),
      },
      order: {
        priority: 'DESC',
        createdAt: 'ASC',
      },
    });
  }

  async getCurrentRequest({ counter }: User) {
    return await this.requestRepository.findOne({
      where: {
        counter: { id: counter.id },
        status: RequestStatus.SERVICING,
      },
    });
  }

  async getNextRequest(user: User) {
    const currentRequest = await this.getCurrentRequest(user);
    if (currentRequest) throw new BadRequestException(`La solicitud ${currentRequest.code} aun esta en atencion`);
    const request = await this.requestRepository.findOne({
      where: {
        status: RequestStatus.PENDING,
        branch: { id: user.counter.branch.id },
        service: In(user.counter.services.map(({ id }) => id)),
        counter: IsNull(),
      },
      order: {
        priority: 'DESC',
        createdAt: 'ASC',
      },
    });
    if (!request) throw new BadRequestException('No hay solicitudes en cola');
    const result = await this.requestRepository.preload({
      id: request.id,
      counter: user.counter,
      status: RequestStatus.SERVICING,
    });
    return await this.requestRepository.save(result);
  }
}
