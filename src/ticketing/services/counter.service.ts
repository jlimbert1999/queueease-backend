import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { RequestStatus, ServiceRequest } from '../entities';

@Injectable()
export class CounterService {
  constructor(@InjectRepository(ServiceRequest) private requestRepository: Repository<ServiceRequest>) {}

  async getServiceRequests(user: User) {
    return await this.requestRepository.find({
      where: {
        branch: user.counter.branch,
        status: RequestStatus.PENDING,
        service: In(user.counter.services.map((el) => el.id)),
      },
      order: {
        priority: 'DESC',
        id: 'DESC',
      },
    });
  }

  async getCurrentRequest(user: User) {
    const services = user.counter?.services.map((el) => el.id);
    return await this.requestRepository.findOne({
      where: {
        status: RequestStatus.PENDING,
        service: In(services),
        branch: user.counter.branch,
      },
    });
  }

  async getNextRequest(user: User) {
    const services = user.counter?.services.map((el) => el.id);
    const request = await this.requestRepository.findOne({
      where: {
        status: RequestStatus.PENDING,
        service: In(services),
        branch: user.counter.branch,
      },
      relations: { branch: true, service: true },
      order: {
        priority: 'DESC',
        id: 'DESC',
      },
    });
    if (!request) {
      throw new BadRequestException('No hay solicitudes en cola');
    }
    return request;
    // return await this.requestRepository.save({
    //   ...request,
    //   status: RequestStatus.SERVICING,
    //   desk: user.serviceCounter,
    // });
  }
}
