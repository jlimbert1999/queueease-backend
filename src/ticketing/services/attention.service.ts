import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';

import { RequestStatus, ServiceRequest } from '../entities';
import { Counter } from 'src/administration/entities';
import { UpdateRequestServiceDto } from '../dtos';

@Injectable()
export class AttentionService {
  constructor(
    @InjectRepository(ServiceRequest)
    private requestRepository: Repository<ServiceRequest>,
    private readonly dataSource: DataSource,
  ) {}

  async getPendingsByCounter(counter: Counter) {
    return await this.requestRepository.find({
      where: {
        status: RequestStatus.PENDING,
        branchId: counter.branchId,
        service: In(counter.services.map(({ id }) => id)),
      },
      order: {
        preference: { priority: 'DESC' },
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const request = await queryRunner.manager.findOne(ServiceRequest, {
        where: {
          status: RequestStatus.PENDING,
          branchId: counter.branchId,
          serviceId: In(counter.services.map(({ id }) => id)),
          // counter: IsNull(),
        },
        // relations: { counter: true, preference: true },
        // order: {
        //   preference: { priority: 'DESC' },
        //   createdAt: 'ASC',
        // },
        lock: { mode: 'pessimistic_write' },
      });
      console.log('request');
       throw Error('test')

      return request

      console.log('request encontrada', request);
      if (!request) throw new BadRequestException('No hay solicitudes en cola');
      request.counter = counter;
      request.status = RequestStatus.SERVICING;
      const serviceRequest = await queryRunner.manager.save(request);
      await queryRunner.commitTransaction();
      return serviceRequest;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error al atender la solicitud');
    } finally {
      console.log('end transaction');
      await queryRunner.release();
    }
  }

  async updateRequest(id: string, { status }: UpdateRequestServiceDto) {
    const request = await this.requestRepository.preload({ id, status });
    if (!request) throw new BadRequestException(`La solicitud ${id} no existe.`);
    await this.requestRepository.save(request);
    return { message: 'Solicitud actualizada' };
  }
}
