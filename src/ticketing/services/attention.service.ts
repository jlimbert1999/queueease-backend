import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, IsNull, Repository } from 'typeorm';

import { Attention, RequestStatus, ServiceRequest } from '../entities';
import { Counter } from 'src/administration/entities';
import { UpdateRequestServiceDto } from '../dtos';

@Injectable()
export class AttentionService {
  constructor(
    @InjectRepository(ServiceRequest) private requestRepository: Repository<ServiceRequest>,
    @InjectRepository(Attention) private attentionRepository: Repository<Attention>,
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
    return await this.attentionRepository.findOne({
      relations: { request: true, counter: true },
      where: {
        counter: { id: id },
        endTime: IsNull(),
        request: { status: RequestStatus.SERVICING },
      },
    });
  }

  // async getNextRequest(counter: Counter) {
  //   // const request = await this.requestRepository.findOne({
  //   //   where: {
  //   //     status: RequestStatus.PENDING,
  //   //     branchId: counter.branchId,
  //   //     service: In(counter.services.map(({ id }) => id)),
  //   //     counter: IsNull(),
  //   //   },
  //   //   relations: { preference: true },
  //   //   order: {
  //   //     preference: { priority: 'DESC' },
  //   //     createdAt: 'ASC',
  //   //   },
  //   // });
  //   // if (!request) throw new BadRequestException('No hay solicitudes en cola');
  //   // const result = await this.requestRepository.preload({
  //   //   id: request.id,
  //   //   counter: counter,
  //   //   status: RequestStatus.SERVICING,
  //   // });
  //   // const s = await this.requestRepository.save(result);
  //   // console.log('solictud atendida', request.code);
  //   // return s;

  //   // const current = await this.getCurrentRequestByCounter(counter);
  //   // if (current) throw new BadRequestException(`La solicitud ${current.code} aun esta en atencion`);

  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   try {
  //     await queryRunner.startTransaction();
  //     const entityManager: EntityManager = queryRunner.manager;
  //     const request = await entityManager
  //       .createQueryBuilder(ServiceRequest, 'request')
  //       .leftJoinAndSelect('request.preference', 'preference')
  //       .where({
  //         status: RequestStatus.PENDING,
  //         branchId: counter.branchId,
  //         serviceId: In(counter.services.map(({ id }) => id)),
  //         counterId: IsNull(),
  //       })
  //       .orderBy('preference.priority', 'DESC')
  //       .addOrderBy('request.createdAt', 'ASC')
  //       .setLock('pessimistic_write')
  //       .getOne();
  //     // if (!request) throw new BadRequestException('No hay solicitudes en cola');
  //     // await queryRunner.manager.findOne(ServiceRequest, {
  //     //   where: { id: request.id },
  //     //   lock: { mode: 'pessimistic_write' },
  //     // });
  //     request.counter = counter;
  //     request.status = RequestStatus.SERVICING;
  //     const serviceRequest = await queryRunner.manager.save(request);
  //     await queryRunner.commitTransaction();
  //     console.log('solicitud a anteder', request.code);
  //     return serviceRequest;
  //   } catch (error) {
  //     console.log(error);
  //     await queryRunner.rollbackTransaction();
  //     if (error instanceof HttpException) {
  //       throw new HttpException(error.message, error.getStatus());
  //     }
  //     throw new InternalServerErrorException('Error al atender la solicitud');
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async getNextRequest(counter: Counter) {
    const attention = await this.getCurrentRequestByCounter(counter);
    if (attention) throw new BadRequestException(`La solicitud ${attention.request.code} aun esta en atencion`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const request = await queryRunner.manager.findOne(ServiceRequest, {
        where: {
          serviceId: In(counter.services.map(({ id }) => id)),
          branchId: counter.branchId,
          status: RequestStatus.PENDING,
        },
        order: {
          priority: 'DESC',
          createdAt: 'ASC',
        },
        lock: { mode: 'pessimistic_write', onLocked: 'skip_locked' },
      });
      if (!request) throw new BadRequestException('No hay solicitudes en cola');
      // request.counter = counter;
      // request.status = RequestStatus.SERVICING;
      const serviceRequest = await queryRunner.manager.save(request);
      await queryRunner.commitTransaction();
      console.log('request atendida', serviceRequest.code);
      return serviceRequest;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw new InternalServerErrorException('Error al atender la solicitud');
    } finally {
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

// TEST CODE
// import axios from 'axios';

// const url = 'http://192.168.30.34:3000/attention/next'; // Cambia esto por tu URL
// const token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoiMmMyYTYzYTItZTUxZi00M2ZjLWFmMDgtMTcyMjFhMGI0NjdmIiwiZnVsbG5hbWUiOiJKVUFOIFBFUkVaIiwiaWF0IjoxNzIwODE3MDM3LCJleHAiOjE3MjA4NDU4Mzd9.Pie5LaGDMRQINVUyLq_Vzy0GIPxALwkGjNR56QkWfQ0'
// async function makeRequest() {
//   try {
//     await axios.get(url, {headers:{Authorization:`Bearer ${token}` }})
//   } catch (error) {
//     console.error(error.response.data);
//   }
// }

// async function runConcurrentRequests() {
//   const requests = [];
//   for (let i = 0; i < 3; i++) {
//     requests.push(makeRequest());
//   }
//   await Promise.all(requests);
// }

// await runConcurrentRequests();
