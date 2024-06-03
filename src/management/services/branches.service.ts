import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ILike, In, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { Branch, Service, VideoPlatform } from '../entities';
import { CreateBranchDto, UpdateBranchDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dtos';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    private configService: ConfigService,
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
    return { branches: branches.map((el) => this._buildUrlVideo(el)), length };
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
    if (branchDto) {
      if (branchDB.videoUrl === branchDto.videoUrl) return;
      this._deleteVideoBranch(branchDB.videoUrl);
    }
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

  private _buildUrlVideo(branch: Branch): Branch {
    let secureUrl = this.configService.getOrThrow('host');
    switch (branch.videoPlatform) {
      case VideoPlatform.FACEBOOK:
        break;
      case VideoPlatform.YOUTUBE:
        secureUrl = `https://www.youtube.com/embed/${branch.videoUrl}?autoplay=1&playlist=${branch.videoUrl}&loop=1&muted=1`;
        break;
      default:
        secureUrl = `${secureUrl}/files/branch/${branch.videoUrl}`;
        break;
    }
    return { ...branch, videoUrl: secureUrl };
  }

  private _deleteVideoBranch(fileName: string): void {
    const filePath = path.join(__dirname, '..', 'static', 'branches', fileName);
    console.log(fileName);
    if (!fs.existsSync(filePath)) return;
    try {
      fs.unlinkSync(fileName);
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar ');
    }
  }
}
