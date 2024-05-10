import { Injectable, NotFoundException } from '@nestjs/common';
import { Branch, Service } from '../entities';
import { ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBranchDto, UpdateBranchDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dtos';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
  ) {}

  async create(branchDto: CreateBranchDto) {
    const { services, ...props } = branchDto;
    const serviceDB = await this.serviceRepository.find({ where: { id: In(services) } });
    const branch = this.branchRepository.create({ ...props, services: serviceDB });
    return await this.branchRepository.save(branch);
  }

  async update(id: number, branchDto: UpdateBranchDto) {
    const { services, ...props } = branchDto;
    const branchDB = await this.branchRepository.findOneBy({ id });
    if (!branchDB) throw new NotFoundException(`La sucursal editada no existe`);
    const serviceDB = await this.serviceRepository.find({ where: { id: In(services) } });
    await this.branchRepository.save({ id, ...props, services: serviceDB });
    return await this.branchRepository.findOne({ where: { id }, relations: { services: true } });
  }

  async findAll({ limit, offset }: PaginationParamsDto) {
    return await this.branchRepository.findAndCount({
      take: limit,
      skip: offset,
      order: {
        id: 'DESC',
      },
      relations: {
        services: true,
      },
    });
  }

  async searchAvailables(term: string) {
    return await this.branchRepository.find({
      where: { name: ILike(`%${term}%`) },
      take: 5,
    });
  }
  async getServicesByBranch(id: number) {
    const branchDB = await this.branchRepository.findOne({ where: { id }, relations: { services: true } });
    return branchDB.services;
  }

  async getMenu(id: number) {
    const branchDB = await this.branchRepository.findOne({
      where: { id },
      relations: { services: { category: true } },
    });
    return branchDB.services;
  }
}