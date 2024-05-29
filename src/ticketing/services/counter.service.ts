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
      select: { service: { name: true } },
      relations: { service: true },
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

  async handleRequest({ counter }: User) {
    const request = await this.requestRepository.findOne({
      where: {
        status: RequestStatus.PENDING,
        service: In(counter.services.map((el) => el.id)),
        branch: counter.branch,
      },
      order: {
        priority: 'DESC',
        id: 'DESC',
      },
    });
    if (!request) {
      throw new BadRequestException('No hay solicitudes en cola');
    }
    await this.requestRepository.update(request.id, { counter: counter, status: RequestStatus.SERVICING });
    return await this.requestRepository.findOne({
      where: { id: request.id },
      relations: { branch: true, service: true, counter: true },
    });
  }
}
