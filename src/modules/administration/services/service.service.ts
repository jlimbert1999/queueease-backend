import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { PaginationParamsDto } from 'src/common/dtos';
import { CreateServiceDto, UpdateServiceDto } from '../dtos';
import { Category, Service } from '../entities';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
  ) {}

  async findAll({ limit, offset, term }: PaginationParamsDto) {
    const [services, length] = await this.serviceRepository.findAndCount({
      take: limit,
      skip: offset,
      relations: {
        category: true,
      },
      ...(term && { where: { name: ILike(`%${term}%`) } }),
    });
    return { services, length };
  }

  async create(createServiceDto: CreateServiceDto) {
    const { category, ...props } = createServiceDto;
    await this._checkDuplicateCode(props.code);
    const categoryDB = category ? await this.categoryRepository.findOne({ where: { id: category } }) : null;
    const newService = this.serviceRepository.create({
      ...props,
      category: categoryDB,
    });
    return await this.serviceRepository.save(newService);
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const { category, ...toUpdate } = updateServiceDto;
    const serviceDB = await this.serviceRepository.preload({ id, ...toUpdate });
    if (!serviceDB) throw new NotFoundException(`El servicio editado no existe`);
    if (serviceDB.code !== toUpdate.code) await this._checkDuplicateCode(toUpdate.code);
    const categoryDB = category ? await this.categoryRepository.findOne({ where: { id: category } }) : null;
    return await this.serviceRepository.save({ ...serviceDB, category: categoryDB });
  }

  async searchAvailables(term: string) {
    return await this.serviceRepository.find({
      where: { name: ILike(`%${term}%`) },
      take: 5,
    });
  }

  async filterByBranch(branchId: string) {
    return await this.serviceRepository.find({
      relations: { branches: true },
      where: { branches: { id: branchId } },
      select: { id: true, name: true },
    });
  }

  private async _checkDuplicateCode(code: string) {
    const duplicate = await this.serviceRepository.findOneBy({ code: code });
    if (duplicate) throw new BadRequestException(`El codigo ${code} ya existe`);
  }
}
