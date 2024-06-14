import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { RequestStatus, ServiceRequest } from '../entities';
import { UpdateRequestServiceDto } from '../dtos';

@Injectable()
export class RequestService {
  constructor(@InjectRepository(ServiceRequest) private requestRepository: Repository<ServiceRequest>) {}

  async getPendingsByCounter({ counter }: User) {
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

  async getCurrentRequestByCounter({ counter }: User) {
    return await this.requestRepository.findOne({
      where: {
        counter: { id: counter.id },
        status: RequestStatus.SERVICING,
      },
    });
  }

  async getNextRequest(user: User) {
    const currentRequest = await this.getCurrentRequestByCounter(user);
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

  async updateRequest(id: string, { status }: UpdateRequestServiceDto) {
    const request = await this.requestRepository.preload({ id, status });
    if (!request) throw new BadRequestException(`La solicitud ${id} no existe.`);
    await this.requestRepository.save(request);
    return { message: 'Solicitud actualizada' };
  }
}
