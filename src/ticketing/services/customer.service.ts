import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { Preference, Service } from 'src/administration/entities';
import { CreateRequestServiceDto } from '../dtos';
import { ServiceRequest } from '../entities';

interface codeOptions {
  serviceId: string;
  branchId: string;
  code: string;
  preference: Preference;
}

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(ServiceRequest)
    private requestRepository: Repository<ServiceRequest>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(Preference)
    private preferenceRepository: Repository<Preference>,
  ) {}

  async createRequest(requestDto: CreateRequestServiceDto) {
    const { id_branch, id_service, preferenceId } = requestDto;
    const service = await this.serviceRepository.findOne({
      where: { id: id_service },
      relations: { branches: true },
      select: { branches: { id: true } },
    });
    if (!service) throw new BadRequestException('El servicio solicitado no existe');
    const branch = service.branches.find((branch) => branch.id === id_branch);
    if (!branch) throw new BadRequestException('La sucursal proporcionada no es valida');

    const preference = await this.preferenceRepository.findOneBy({
      id: preferenceId,
    });
    if (!preference) throw new BadRequestException('La preferencia solicitada no existe');
    const code = await this._generateRequestCode({
      serviceId: service.id,
      branchId: branch.id,
      code: service.code,
      preference: preference,
    });
    const newRequest = this.requestRepository.create({
      preference: preference,
      service: service,
      branch: branch,
      code: code,
    });
    return await this.requestRepository.save(newRequest);
  }

  private async _generateRequestCode({ code, branchId, serviceId, preference }: codeOptions) {
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999);
    const correlative = await this.requestRepository.countBy({
      service: { id: serviceId },
      branch: { id: branchId },
      preference: { id: preference.id },
      createdAt: Between(startDate, endDate),
    });
    return code.trim().concat(preference.acronym, `${correlative + 1}`);
  }
}
