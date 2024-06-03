import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';

import { CreateBranchDto, UpdateBranchDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dtos';
import { Branch, Service } from '../entities';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
  ) {}

  async findAll({ limit, offset }: PaginationParamsDto) {
    const [branches, length] = await this.branchRepository.findAndCount({
      take: limit,
      skip: offset,
      order: {
        createdAt: 'DESC',
      },
      relations: {
        services: true,
      },
      select: {
        services: {
          id: true,
          name: true,
        },
      },
    });
    return { branches, length };
  }

  async search(term: string, { limit, offset }: PaginationParamsDto) {
    const [branches, length] = await this.branchRepository.findAndCount({
      where: {
        name: ILike(`%${term}%`),
      },
      relations: {
        services: true,
      },
      select: {
        services: {
          id: true,
          name: true,
        },
      },
      take: limit,
      skip: offset,
      order: {
        createdAt: 'DESC',
      },
    });
    return { branches, length };
  }

  async create(branchDto: CreateBranchDto) {
    const { services, ...props } = branchDto;
    const serviceDB = await this.serviceRepository.find({ where: { id: In(services) } });
    const branch = this.branchRepository.create({ ...props, services: serviceDB });
    return await this.branchRepository.save(branch);
  }

  async update(id: string, branchDto: UpdateBranchDto) {
    const { services, ...props } = branchDto;
    const branchDB = await this.branchRepository.findOneBy({ id });
    if (!branchDB) throw new NotFoundException(`La sucursal editada no existe`);
    const serviceDB = await this.serviceRepository.find({ where: { id: In(services) } });
    await this.branchRepository.save({ id, ...props, services: serviceDB });
    return await this.branchRepository.findOne({ where: { id }, relations: { services: true } });
  }

  async searchAvailables(term: string) {
    return await this.branchRepository.find({
      where: { name: ILike(`%${term}%`) },
      take: 5,
    });
  }

  async getMenu(id: string) {
    const branchDB = await this.branchRepository.findOne({
      where: { id },
      relations: { services: { category: true } },
    });
    const menu = branchDB.services.reduce((acc, current) => {
      if (current.category) {
        if (!acc[current.category.name]) {
          acc[current.category.name] = {
            name: current.category.name,
            services: [{ value: current.id, name: current.name, services: [] }],
          };
        } else {
          acc[current.category.name]['services'].push({ value: current.id, name: current.name, services: [] });
        }
      } else {
        acc[current.name] = { value: current.id, name: current.name, services: [] };
      }
      return { ...acc };
    }, {});
    return Object.values(menu);
  }
}
