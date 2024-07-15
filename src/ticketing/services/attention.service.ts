import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';

import { Attention, RequestStatus, ServiceRequest } from '../entities';
import { User } from 'src/users/entities/user.entity';
import { Counter } from 'src/administration/entities';
import { UpdateRequestServiceDto } from '../dtos';

interface attentionProps {
  user: User;
  counter: Counter;
  serviceRequest: ServiceRequest;
  queryRunner: QueryRunner;
}

@Injectable()
export class AttentionService {
  constructor(
    @InjectRepository(ServiceRequest) private requestRepository: Repository<ServiceRequest>,
    private readonly dataSource: DataSource,
  ) {}

  async getPendingsByCounter(counter: Counter) {
    return await this.requestRepository.find({
      where: {
        serviceId: In(counter.services.map(({ id }) => id)),
        branchId: counter.branchId,
        status: RequestStatus.PENDING,
      },
      order: {
        priority: 'DESC',
        createdAt: 'ASC',
      },
    });
  }

  async getCurrentRequestByCounter(counter: Counter) {
    const current = await this.requestRepository.findOne({
      relations: { attention: true },
      where: {
        status: RequestStatus.SERVICING,
        attention: { counter: { id: counter.id } },
      },
    });
    if (!current) return undefined;
    const { attention:{startTime, endTime}, ...props } = current;
    return { serviceRequest: props, startTime, endTime };
  }

  async getNextRequest(counter: Counter, user: User) {
    const currentRequest = await this.getCurrentRequestByCounter(counter);
    if (currentRequest) throw new BadRequestException(`La solicitud ${currentRequest.serviceRequest.code} aun esta en atencion`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const requestDB = await queryRunner.manager.findOne(ServiceRequest, {
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
      if (!requestDB) throw new BadRequestException('No hay solicitudes en cola');
      const { startTime, endTime } = await this._createAttention({
        user: user,
        counter: counter,
        serviceRequest: requestDB,
        queryRunner: queryRunner,
      });
      requestDB.status = RequestStatus.SERVICING;
      const requestToAttend = await queryRunner.manager.save(requestDB);
      await queryRunner.commitTransaction();
      return { serviceRequest: requestToAttend, startTime, endTime };
    } catch (error) {
      this._handleTransactionError(error, queryRunner);
    } finally {
      await queryRunner.release();
    }
  }

  async handleRequest(id: string, { status }: UpdateRequestServiceDto) {
    const request = await this.requestRepository.findOne({ where: { id }, relations: { attention: true } });
    if (!request) throw new BadRequestException(`La solicitud ${id} no existe.`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      request.status = status;
      await queryRunner.manager.save(ServiceRequest, request);
      const { attention } = request;
      attention.endTime = new Date();
      const { endTime } = await queryRunner.manager.save(Attention, attention);
      await queryRunner.commitTransaction();
      return { endTime };
    } catch (error) {
      this._handleTransactionError(error, queryRunner);
    } finally {
      await queryRunner.release();
    }
  }

  private async _createAttention({ user, counter, serviceRequest, queryRunner }: attentionProps) {
    const createdAttention = queryRunner.manager.create(Attention, {
      counter: counter,
      request: serviceRequest,
      user: user,
      startTime: new Date(),
    });
    return await queryRunner.manager.save(Attention, createdAttention);
  }

  private async _handleTransactionError(error: unknown, queryRunner: QueryRunner) {
    await queryRunner.rollbackTransaction();
    if (error instanceof HttpException) {
      throw new HttpException(error.message, error.getStatus());
    }
    throw new InternalServerErrorException('Error al atender la solicitud');
  }
}
