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
    const { branch, service } = requestDto;
    const serviceDB = await this.serviceRepository.findOne({ where: { id: service }, relations: { branch: true } });
    if (!serviceDB) throw new BadRequestException('El servicio solicitado no existe');
    const branchDB = serviceDB.branch.find((el) => el.id === branch);
    if (!branchDB) throw new BadRequestException('La sucursa no tiene el servicio seleccionado');
    const code = await this._generateRequestCode(serviceDB, branchDB);
    const newRequest = this.requestRepository.create({
      ...requestDto,
      service: serviceDB,
      code: code,
      branch: branchDB,
    });
    const createdRequest = await this.requestRepository.save(newRequest);
    return { name: serviceDB.name, createdRequest };
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
    return `${service.code}-${correlative + 1}`;
  }
}
