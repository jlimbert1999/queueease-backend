import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, QueryFailedError, Repository } from 'typeorm';

import { PaginationParamsDto } from 'src/common/dtos';
import { CreateCounterDto, UpdateCounterDto } from '../dtos';
import { Branch, Service, Counter } from '../entities';

@Injectable()
export class CounterService {
  constructor(
    @InjectRepository(Counter) private deskRepository: Repository<Counter>,
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
  ) {}

  async findAll({ limit, offset }: PaginationParamsDto) {
    const [counters, length] = await this.deskRepository.findAndCount({
      take: limit,
      skip: offset,
      relations: ['services', 'branch'],
      select: { services: { id: true, name: true }, branch: { id: true, name: true } },
      order: {
        createdAt: 'DESC',
      },
    });
    return { counters, length };
  }

  async search(term: string, { limit, offset }: PaginationParamsDto) {
    const [counters, length] = await this.deskRepository.findAndCount({
      where: [{ ip: ILike(`%${term}%`) }, { branch: { name: ILike(`%${term}%`) } }],
      relations: ['services', 'branch'],
      select: { services: { id: true, name: true }, branch: { id: true, name: true } },
      take: limit,
      skip: offset,
    });
    return { counters, length };
  }

  async create(serviceDeskDto: CreateCounterDto) {
    const { services, branch, ...props } = serviceDeskDto;
    await this._checkDuplicateIp(props.ip);
    const { branchDB, servicesDB } = await this._checkBranchServices(branch, services);
    try {
      const newDesk = this.deskRepository.create({
        ...props,
        services: servicesDB,
        branch: branchDB,
      });
      return await this.deskRepository.save(newDesk);
    } catch (error) {
      this._handleErrors(error);
    }
  }

  async update(id: string, { services, ...props }: UpdateCounterDto) {
    const counterDB = await this.deskRepository.findOneBy({ id: id });
    if (!counterDB) throw new NotFoundException('La ventanilla editada no existe');
    // if (props.ip !== counterDB.ip) await this._checkDuplicateIp(props.ip);
    let validServices = counterDB.services;
    if (services) {
      const { servicesDB } = await this._checkBranchServices(counterDB.branchId, services);
      validServices = servicesDB;
    }
    try {
      await this.deskRepository.save({ id: id, services: validServices, ...props });
      return await this.deskRepository.findOne({
        where: { id: id },
        relations: ['services', 'branch'],
        select: { services: { id: true, name: true }, branch: { id: true, name: true } },
      });
    } catch (error) {
      this._handleErrors(error);
    }
  }

  private async _checkDuplicateIp(ip: string) {
    const duplicate = await this.deskRepository.findOneBy({ ip: ip.trim() });
    if (duplicate) throw new BadRequestException(`La ip ${ip} ya esta asignada`);
  }

  private async _checkBranchServices(
    branchId: string,
    servicesIds: string[],
  ): Promise<{ branchDB: Branch; servicesDB: Service[] }> {
    const branch = await this.branchRepository.findOne({ where: { id: branchId }, relations: { services: true } });
    if (!branch) throw new BadRequestException(`La sucursal ${branchId} no existe.`);
    const services = await this.serviceRepository.findBy({ id: In(servicesIds) });
    const invalid = services.some(({ id }) => !branch.services.find((item) => item.id === id));
    if (invalid) throw new BadRequestException(`Solo puede asignar servicio de la sucursal ${branch.name}`);
    return { branchDB: branch, servicesDB: services };
  }

  private _handleErrors(error: any) {
    if (error instanceof QueryFailedError) {
      throw new BadRequestException('El numero de ventanilla es unico por sucursal');
    }
    throw new InternalServerErrorException('Error al crear la ventanilla');
  }
}
