import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ServiceRequest } from '../entities';
import { CreateRequestServiceDto } from '../dtos';
import { Branch, Service } from 'src/management/entities';

@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectRepository(ServiceRequest) private requestRepository: Repository<ServiceRequest>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
  ) {}

  async create(requestDto: CreateRequestServiceDto) {
    const { id_branch, id_service, priority } = requestDto;
    const service = await this.serviceRepository.findOne({
      where: { id: id_service },
      relations: { branches: true },
      select: { branches: { id: true } },
    });
    if (!service) throw new BadRequestException('El servicio solicitado no existe');
    const branch = service.branches.find((el) => el.id === id_branch);
    if (!branch) throw new BadRequestException('La sucursal no tiene el servicio seleccionado');
    const code = await this._generateRequestCode(service, branch);
    const newRequest = this.requestRepository.create({
      priority: priority,
      service: service,
      branch: branch,
      code: code,
    });
    const createdRequest = await this.requestRepository.save(newRequest);
    return { name: service.name, serviceRequest: createdRequest };
  }

  private async _generateRequestCode(service: Service, branch: Branch) {
    const currentDate = new Date();

    const startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999);

    const correlative = await this.requestRepository.countBy({
      service: service,
      branch: branch,
      date: Between(startDate, endDate),
    });
    return `${service.code.trim()}${correlative + 1}`;
  }
}
