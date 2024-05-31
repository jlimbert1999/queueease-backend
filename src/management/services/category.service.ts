import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dtos';

@Injectable()
export class CategoryService {
  constructor(@InjectRepository(Category) private categoryRepository: Repository<Category>) {}

  async create(categoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(categoryDto);
    return await this.categoryRepository.save(category);
  }

  async update(id: string, categoryDto: UpdateCategoryDto) {
    const categoryDB = await this.categoryRepository.findOneBy({ id });
    if (!categoryDB) throw new BadRequestException(`La categoria editada no existe`);
    return await this.categoryRepository.save({ id, ...categoryDto });
  }

  async findAll({ limit, offset }: PaginationParamsDto) {
    return await this.categoryRepository.findAndCount({
      take: limit,
      skip: offset,
      order: {
        id: 'DESC',
      },
    });
  }

  async getAvailables() {
    return await this.categoryRepository.find({});
  }
}
