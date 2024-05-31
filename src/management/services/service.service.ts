import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
import { CreateServiceDto, UpdateServiceDto } from '../dtos';
import { Category, Service } from '../entities';
import { PaginationParamsDto } from 'src/common/dtos';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
  ) {}

  async findAll({ limit, offset }: PaginationParamsDto) {
    const [services, length] = await this.serviceRepository.findAndCount({
      take: limit,
      skip: offset,
      relations: {
        category: true,
      },
      order: {
        id: 'DESC',
      },
    });
    return { services, length };
  }

  async create(createServiceDto: CreateServiceDto) {
    const { category, ...props } = createServiceDto;
    let categoryDB: Category | undefined = undefined;
    if (category) {
      categoryDB = await this.categoryRepository.findOne({ where: { id: category ? category : IsNull() } });
    }
    const newService = this.serviceRepository.create({
      ...props,
      category: categoryDB,
    });
    return await this.serviceRepository.save(newService);
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const { category, ...toUpdate } = updateServiceDto;
    const serviceDB = await this.serviceRepository.findOneBy({ id });
    if (!serviceDB) throw new NotFoundException(`El servicio editado no existe`);
    let categoryDB: Category | undefined = undefined;
    if (category) {
      categoryDB = await this.categoryRepository.findOne({ where: { id: category ? category : IsNull() } });
    }
    await this.serviceRepository.update({ id }, { ...toUpdate, category: categoryDB ?? null });
    return await this.serviceRepository.findOne({ where: { id }, relations: { category: true } });
  }

  async searchAvailables(term: string) {
    return await this.serviceRepository.find({
      where: { name: ILike(`%${term}%`) },
      take: 5,
    });
  }
}
