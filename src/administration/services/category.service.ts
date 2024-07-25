import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Category } from '../entities';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dtos';

@Injectable()
export class CategoryService {
  constructor(@InjectRepository(Category) private categoryRepository: Repository<Category>) {}

  async findAll({ limit, offset, term }: PaginationParamsDto) {
    const [categories, length] = await this.categoryRepository.findAndCount({
      take: limit,
      skip: offset,
      ...(term && { where: { name: ILike(`%${term}%`) } }),
    });
    return { categories, length };
  }

  async create(categoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(categoryDto);
    return await this.categoryRepository.save(category);
  }

  async update(id: string, categoryDto: UpdateCategoryDto) {
    const categoryDB = await this.categoryRepository.preload({ id, ...categoryDto });
    if (!categoryDB) throw new BadRequestException(`La categoria editada no existe`);
    return await this.categoryRepository.save(categoryDB);
  }

  async getAvailables() {
    return await this.categoryRepository.find({});
  }
}
