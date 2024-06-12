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
      relations: { service: true },
      select: { service: { name: true } },
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
      relations: { service: true },
      select: { service: { name: true } },
    });
  }

  async getNextRequest({ counter }: User) {
    await this._checkPendings(counter.id);
    const request = await this.requestRepository.findOne({
      where: {
        status: RequestStatus.PENDING,
        branch: { id: counter.branch.id },
        service: In(counter.services.map(({ id }) => id)),
        counter: IsNull(),
      },
      order: {
        priority: 'DESC',
        createdAt: 'ASC',
      },
    });
    if (!request) throw new BadRequestException('No hay solicitudes en cola');
    await this.requestRepository.update(request.id, { counter: counter, status: RequestStatus.SERVICING });
    return await this.requestRepository.findOne({
      where: { id: request.id },
      relations: { service: true },
      select: { service: { name: true } },
    });
  }

  private async _checkPendings(id_counter: string) {
    const pendingRequest = await this.requestRepository.findOne({
      where: { counter: { id: id_counter }, status: RequestStatus.SERVICING },
    });
    if (pendingRequest) throw new BadRequestException(`La solitud ${pendingRequest.code} aun esta siendo atendida`);
  }
}
