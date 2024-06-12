import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateServiceDto, UpdateServiceDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dtos';
import { Category, Service } from '../entities';

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
        createdAt: 'DESC',
      },
    });
    return { services, length };
  }

  async search(term: string, { limit, offset }: PaginationParamsDto) {
    const [services, length] = await this.serviceRepository.findAndCount({
      where: [{ name: ILike(`%${term}%`) }, { code: ILike(`%${term}%`) }],
      take: limit,
      skip: offset,
      relations: {
        category: true,
      },
    });
    return { services, length };
  }

  async create(createServiceDto: CreateServiceDto) {
    const { category, ...props } = createServiceDto;
    await this._checkDuplicateCode(props.code);
    let categoryDB: Category | null = null;
    if (category) {
      categoryDB = await this.categoryRepository.findOne({ where: { id: category } });
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
    if (serviceDB.code !== toUpdate.code) await this._checkDuplicateCode(toUpdate.code);
    let categoryDB: Category | null = null;
    if (category) {
      categoryDB = await this.categoryRepository.findOne({ where: { id: category } });
    }
    return await this.serviceRepository.save({ id, ...toUpdate, category: categoryDB });
  }

  async searchAvailables(term: string) {
    return await this.serviceRepository.find({
      where: { name: ILike(`%${term}%`) },
      take: 5,
    });
  }

  private async _checkDuplicateCode(code: string) {
    const duplicate = await this.serviceRepository.findOneBy({ code: code });
    if (duplicate) throw new BadRequestException(`El codigo ${code} ya existe`);
  }
}
