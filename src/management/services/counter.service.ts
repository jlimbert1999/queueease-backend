import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Branch, Service, Counter } from '../entities';
import { CreateServiceDeskDto, UpdateServiceDeskDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dtos';

@Injectable()
export class CounterService {
  constructor(
    @InjectRepository(Counter) private deskRepository: Repository<Counter>,
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
  ) {}

  async create(serviceDeskDto: CreateServiceDeskDto) {
    const { services, branch, ...props } = serviceDeskDto;
    const branchDB = await this.branchRepository.findOne({
      where: { id: branch },
      relations: { services: true },
    });
    const validServices = await this._checkAllowedServices(branchDB, services);
    const newDesk = this.deskRepository.create({
      ...props,
      services: validServices,
      branch: branchDB,
    });
    return await this.deskRepository.save(newDesk);
  }

  async update(id: string, serviceDeskDto: UpdateServiceDeskDto) {
    const { services, ...props } = serviceDeskDto;
    const serviceDeskDB = await this.deskRepository.findOne({ where: { id } });
    if (!serviceDeskDB) throw new NotFoundException('La ventanilla editada no existe');
    const branchDB = await this.branchRepository.findOne({
      where: { id: serviceDeskDB.branch.id },
      relations: { services: true },
    });
    const validServices = await this._checkAllowedServices(branchDB, services);
    await this.deskRepository.save({ id, ...props, services: validServices });
    return await this.deskRepository.findOne({ where: { id } });
  }

  async findAll({ limit, offset }: PaginationParamsDto) {
    return await this.deskRepository.findAndCount({
      take: limit,
      skip: offset,
      order: {
        id: 'DESC',
      },
    });
  }

  private async _checkAllowedServices(brach: Branch, assignedServices: string[]) {
    const allowedServices = brach.services.map((el) => el.id);
    const isInvalid = assignedServices.some((el) => !allowedServices.includes(el));
    if (isInvalid) throw new BadRequestException('No se puede asignar un servicio de otra sucursal');
    return await this.serviceRepository.find({ where: { id: In(assignedServices) } });
  }
}
