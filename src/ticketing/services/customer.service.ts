import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Service } from 'src/administration/entities';
import { CreateRequestServiceDto } from '../dtos';
import { ServiceRequest } from '../entities';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(ServiceRequest) private requestRepository: Repository<ServiceRequest>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
  ) {}

  async createRequest(requestDto: CreateRequestServiceDto) {
    const { id_branch, id_service, priority } = requestDto;
    const service = await this.serviceRepository.findOne({
      where: { id: id_service },
      relations: { branches: true },
      select: { branches: { id: true } },
    });
    if (!service) throw new BadRequestException('El servicio solicitado no existe');
    const branch = service.branches.find((branch) => branch.id === id_branch);
    if (!branch) throw new BadRequestException('La sucursal proporcionada no es valida');
    const code = await this._generateRequestCode(service.id, branch.id, service.code);
    const newRequest = this.requestRepository.create({
      priority: priority,
      service: service,
      branch: branch,
      code: code,
    });
    return await this.requestRepository.save(newRequest);
  }

  private async _generateRequestCode(serviceId: string, branchId: string, code: string) {
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999);
    const correlative = await this.requestRepository.countBy({
      service: { id: serviceId },
      branch: { id: branchId },
      createdAt: Between(startDate, endDate),
    });
    return `${code.trim()}${correlative + 1}`;
  }
}
