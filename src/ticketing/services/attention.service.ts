import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';

import { RequestStatus, ServiceRequest } from '../entities';
import { Counter } from 'src/administration/entities';
import { UpdateRequestServiceDto } from '../dtos';

@Injectable()
export class AttentionService {
  constructor(@InjectRepository(ServiceRequest) private requestRepository: Repository<ServiceRequest>) {}

  async getPendingsByCounter(counter: Counter) {
    return await this.requestRepository.find({
      where: {
        status: RequestStatus.PENDING,
        branchId: counter.branchId,
        service: In(counter.services.map(({ id }) => id)),
      },
      order: {
        priority: 'DESC',
        createdAt: 'ASC',
      },
    });
  }

  async getCurrentRequestByCounter({ id }: Counter) {
    return await this.requestRepository.findOne({
      where: {
        counter: { id: id },
        status: RequestStatus.SERVICING,
      },
    });
  }

  async getNextRequest(counter: Counter) {
    const currentRequest = await this.getCurrentRequestByCounter(counter);
    if (currentRequest) throw new BadRequestException(`La solicitud ${currentRequest.code} aun esta en atencion`);
    const request = await this.requestRepository.findOne({
      where: {
        status: RequestStatus.PENDING,
        branchId: counter.branchId,
        service: In(counter.services.map(({ id }) => id)),
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
      counter: counter,
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
