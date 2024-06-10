import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, ILike, In, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { Branch, BranchVideo, Service } from '../entities';
import { CreateBranchDto, UpdateBranchDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dtos';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(BranchVideo) private branchVideoRepository: Repository<BranchVideo>,
    private configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll({ limit, offset }: PaginationParamsDto) {
    const [branches, length] = await this.branchRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
      relations: { services: true, videos: true },
      select: {
        services: { id: true, name: true },
      },
    });

    return {
      branches: branches.map(({ videos, ...props }) => ({
        videos: videos.map((video) => this._buildUrlVideo(video)),
        ...props,
      })),
      length,
    };
  }

  async search(term: string, { limit, offset }: PaginationParamsDto) {
    const [branches, length] = await this.branchRepository.findAndCount({
      where: {
        name: ILike(`%${term}%`),
      },
      relations: { services: true, videos: true },
      select: {
        services: {
          id: true,
          name: true,
        },
      },
      take: limit,
      skip: offset,
    });
    return { branches, length };
  }

  async create(branchDto: CreateBranchDto) {
    const { services, videos, ...props } = branchDto;
    const serviceDB = await this.serviceRepository.find({ where: { id: In(services) } });
    const branch = this.branchRepository.create({
      ...props,
      services: serviceDB,
      videos: videos.map((video) => this.branchVideoRepository.create({ url: video })),
    });
    return await this.branchRepository.save(branch);
  }

  async update(id: string, branchDto: UpdateBranchDto) {
    const { services, videos, ...props } = branchDto;
    const branchDB = await this.branchRepository.findOne({ where: { id }, relations: { videos: true } });
    if (!branchDB) throw new NotFoundException(`La sucursal editada no existe`);
    const updatedServices = await this.serviceRepository.find({ where: { id: In(services) } });
    let deletedVideos = branchDB.videos;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (videos.length > 0) {
        await queryRunner.manager.delete(BranchVideo, { branch: { id } });
        branchDB.videos = videos.map((video) => this.branchVideoRepository.create({ url: video }));
      } else {
        deletedVideos = [];
      }
      const toUpdate = this.branchRepository.merge(branchDB, {
        ...props,
        ...(updatedServices.length > 0 && { services: updatedServices }),
      });
      await queryRunner.manager.save(toUpdate);
      await queryRunner.commitTransaction();
      this._deleteVideosBranch(deletedVideos.map((el) => el.url));
      const updatedBranch = await this.branchRepository.findOne({
        where: { id },
        relations: { services: true, videos: true },
      });
      return { ...updatedBranch, videos: updatedBranch.videos.map((video) => this._buildUrlVideo(video)) };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this._deleteVideosBranch(videos);
      throw new InternalServerErrorException('Error al actualizar sucursal');
    } finally {
      await queryRunner.release();
    }
  }

  async searchAvailables(term: string) {
    return await this.branchRepository.find({
      where: { name: ILike(`%${term}%`) },
      take: 5,
    });
  }

  async getBranchServices(id: string) {
    const branchDB = await this.branchRepository.findOne({ where: { id: id }, relations: { services: true } });
    if (!branchDB) throw new BadRequestException(`La sucursal ${id} no existe`);
    return branchDB.services;
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

  async getBranchAdvertisement(id: string) {
    const branch = await this.branchRepository.findOne({
      where: { id: id },
      relations: { videos: true },
    });

    return { message: branch.marqueeMessage, videos: branch.videos.map((el) => this._buildUrlVideo(el)) };
  }

  private _buildUrlVideo(video: BranchVideo): string {
    const host = this.configService.getOrThrow('host');
    return `${host}/files/branch/${video.url}`;

    // switch (video.platform) {
    //   case VideoPlatform.FACEBOOK:
    //     break;
    //   case VideoPlatform.YOUTUBE:
    //     secureUrl = `https://www.youtube.com/embed/${video.url}?autoplay=1&playlist=${video.url}&loop=1&muted=1`;
    //     break;
    //   default:
    //     secureUrl = `${secureUrl}/files/branch/${video.url}`;
    //     break;
    // }
    // return secureUrl;
  }

  private _deleteVideosBranch(fileNames: string[]): void {
    for (const file of fileNames) {
      const filePath = path.join(process.cwd(), 'static', 'branches', file);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
}
