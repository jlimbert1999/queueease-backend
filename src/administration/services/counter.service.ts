import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ILike, In, QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCounterDto, UpdateCounterDto } from '../dtos';
import { Branch, Service, Counter } from '../entities';
import { PaginationParamsDto } from 'src/common/dtos';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CounterService {
  constructor(
    @InjectRepository(Counter) private deskRepository: Repository<Counter>,
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findAll({ limit, offset }: PaginationParamsDto) {
    const [counters, length] = await this.deskRepository.findAndCount({
      take: limit,
      skip: offset,
      relations: { user: true },
      select: { user: { id: true, fullname: true } },
      order: {
        createdAt: 'DESC',
      },
    });
    return { counters, length };
  }

  async search(term: string, { limit, offset }: PaginationParamsDto) {
    const [counters, length] = await this.deskRepository.findAndCount({
      where: [
        { name: ILike(`%${term}%`) },
        { branch: { name: ILike(`%${term}%`) } },
        { user: { fullname: ILike(`%${term}%`) } },
      ],
      take: limit,
      skip: offset,
      relations: { user: true },
      select: { user: { id: true, fullname: true } },
    });
    return { counters, length };
  }

  async create(serviceDeskDto: CreateCounterDto) {
    const { services, user, branch, ...props } = serviceDeskDto;
    const branchDB = await this.branchRepository.findOne({
      where: { id: branch },
      relations: { services: true },
    });
    const validServices = await this._checkAllowedServices(branchDB, services);
    try {
      const newDesk = this.deskRepository.create({
        ...props,
        user: user ? await this.userRepository.findOne({ where: { id: user } }) : null,
        services: validServices,
        branch: branchDB,
      });
      const createdCounter = await this.deskRepository.save(newDesk);
      return await this.deskRepository.findOne({
        where: { id: createdCounter.id },
        relations: { user: true },
        select: { user: { id: true, fullname: true } },
      });
    } catch (error) {
      this._handleErrors(error);
    }
  }

  async update(id: string, { services, user, ...props }: UpdateCounterDto) {
    const counterDB = await this.deskRepository.findOne({ where: { id }, relations: { branch: { services: true } } });
    if (!counterDB) throw new NotFoundException('La ventanilla editada no existe');
    const validServices = await this._checkAllowedServices(counterDB.branch, services);
    try {
      await this.deskRepository.save({
        id,
        ...props,
        services: validServices,
        user: user ? await this.userRepository.findOne({ where: { id: user } }) : null,
      });
      return await this.deskRepository.findOne({
        where: { id: id },
        relations: { user: true },
        select: { user: { id: true, fullname: true } },
      });
    } catch (error) {
      this._handleErrors(error);
    }
  }

  private async _checkAllowedServices(brach: Branch, assignedServices: string[]) {
    const allowedServices = brach.services.map((el) => el.id);
    const isInvalid = assignedServices.some((el) => !allowedServices.includes(el));
    if (isInvalid) throw new BadRequestException('No se puede asignar un servicio de otra sucursal');
    return await this.serviceRepository.find({ where: { id: In(assignedServices) } });
  }

  private _handleErrors(error: any) {
    if (error instanceof QueryFailedError) {
      throw new BadRequestException('El numero de ventanilla es unico por sucursal');
    }
    throw new InternalServerErrorException('Error al crear la ventanilla');
  }
}
