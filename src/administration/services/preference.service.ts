import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { PaginationParamsDto } from 'src/common/dtos';
import { Preference } from '../entities';
import { CreatePreferenceDto, UpdatePreferenceDto } from '../dtos';

@Injectable()
export class PreferenceService {
  constructor(
    @InjectRepository(Preference)
    private preferenceRepository: Repository<Preference>,
  ) {}

  async findAll({ limit, offset, term }: PaginationParamsDto) {
    const [preferences, length] = await this.preferenceRepository.findAndCount({
      take: limit,
      skip: offset,
      ...(term && { where: { name: ILike(`%${term}%`) } }),
    });
    return { preferences, length };
  }

  async create(preferenceDto: CreatePreferenceDto) {
    const newService = this.preferenceRepository.create(preferenceDto);
    return await this.preferenceRepository.save(newService);
  }

  async update(id: number, categoryDto: UpdatePreferenceDto) {
    const preferenceDB = await this.preferenceRepository.preload({
      id,
      ...categoryDto,
    });
    if (!preferenceDB) throw new NotFoundException(`La categoria editada no existe`);
    return await this.preferenceRepository.save(preferenceDB);
  }
}
