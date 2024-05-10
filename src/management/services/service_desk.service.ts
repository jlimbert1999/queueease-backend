import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Branch, Service, ServiceDesk } from '../entities';
import { CreateServiceDeskDto, UpdateServiceDeskDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dtos';

@Injectable()
export class ServiceDeskService {
  constructor(
    @InjectRepository(ServiceDesk) private deskRepository: Repository<ServiceDesk>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
  ) {}

  async create(serviceDeskDto: CreateServiceDeskDto) {
    const { services, branch, password, ...props } = serviceDeskDto;
    const branchDB = await this.branchRepository.findOne({
      where: { id: branch },
      relations: { services: true },
    });
    const validServices = await this._checkAllowedServices(branchDB, services);
    const encryptedPassword = this._encryptPassword(password);
    const newDesk = this.deskRepository.create({
      ...props,
      password: encryptedPassword,
      services: validServices,
      branch: branchDB,
    });
    return await this.deskRepository.save(newDesk);
  }

  async update(id: number, serviceDeskDto: UpdateServiceDeskDto) {
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

  private async _checkAllowedServices(brach: Branch, assignedServices: number[]) {
    const allowedServices = brach.services.map((el) => el.id);
    const isInvalid = assignedServices.some((el) => !allowedServices.includes(el));
    if (isInvalid) throw new BadRequestException('No se puede asignar un servicio de otra sucursal');
    return await this.serviceRepository.find({ where: { id: In(assignedServices) } });
  }

  private _encryptPassword(password: string): string {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(password, salt);
  }
}
