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
        { ip: ILike(`%${term}%`) },
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
    const { services, branch, ...props } = serviceDeskDto;
    await this._checkDuplicateIp(props.ip);
    const { branchDB, servicesDB } = await this._checkBranchServices(branch, services);
    try {
      const newDesk = this.deskRepository.create({
        ...props,
        services: servicesDB,
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

  async update(id: string, { services, ...props }: UpdateCounterDto) {
    const counterDB = await this.deskRepository.findOne({ where: { id }, relations: { branch: { services: true } } });
    if (!counterDB) throw new NotFoundException('La ventanilla editada no existe');
    const validServices = await this._checkAllowedServices(counterDB.branch, services);
    try {
      await this.deskRepository.save({
        id,
        ...props,
        services: validServices,
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

  private async _checkDuplicateIp(ip: string) {
    const duplicate = await this.deskRepository.findOneBy({ ip: ip.trim() });
    if (duplicate) throw new BadRequestException(`La ip ${ip} ya esta asignada`);
  }

  private async _checkBranchServices(
    id_branch: string,
    services: string[],
  ): Promise<{ branchDB: Branch; servicesDB: Service[] }> {
    const branch = await this.branchRepository.findOne({ where: { id: id_branch }, relations: { services: true } });
    if (!branch) throw new BadRequestException(`La sucursal ${id_branch} no existe.`);
    const validServices = await this.serviceRepository.findBy({ id: In(services) });
    validServices.forEach(({ id }) => {
      const isValid = branch.services.find((item) => item.id === id);
      if (!isValid) throw new BadRequestException(`Solo puede asignar servicio de la sucursal ${branch.name}`);
    });
    return { branchDB: branch, servicesDB: validServices };
  }

  private _handleErrors(error: any) {
    if (error instanceof QueryFailedError) {
      throw new BadRequestException('El numero de ventanilla es unico por sucursal');
    }
    throw new InternalServerErrorException('Error al crear la ventanilla');
  }
}
