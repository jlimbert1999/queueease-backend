import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerStatus, ServiceRequest } from 'src/customer/entities';
import { User } from 'src/users/entities/user.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class ServiceDeskService {
  constructor(@InjectRepository(ServiceRequest) private requestRepository: Repository<ServiceRequest>) {}

  async getServiceRequests(user: User) {
    const services = user.serviceCounter?.services.map((el) => el.id);
    return await this.requestRepository.find({
      where: { status: CustomerStatus.PENDING, service: In(services), branch: user.serviceCounter.branch },
      order: {
        priority: 'DESC',
        id: 'DESC',
      },
    });
  }
}
