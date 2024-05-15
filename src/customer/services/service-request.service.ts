import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ServiceRequest } from '../entities';
import { CreateRequestServiceDto } from '../dtos';
import { Service } from 'src/management/entities';

@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectRepository(ServiceRequest) private requestRepository: Repository<ServiceRequest>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
  ) {}

  async create(requestDto: CreateRequestServiceDto) {
    const serviceDB = await this.serviceRepository.findOneBy({ id: requestDto.service });
    if (!serviceDB) throw new BadRequestException('El servicio solicitado no existe');
    const code = await this._generateRequestCode(serviceDB);
    const newRequest = this.requestRepository.create({ ...requestDto, service: serviceDB, code: code });
    const createdRequest = await this.requestRepository.save(newRequest);
    return { code: createdRequest.code, date: createdRequest.date, name: serviceDB.name };
  }

  private async _generateRequestCode(service: Service) {
    const currentDate = new Date();

    const startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999);

    const correlative = await this.requestRepository.countBy({
      service: service,
      date: Between(startDate, endDate),
    });
    return `${service.code}-${correlative + 1}`;
  }
}
