import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, ILike, In, Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';

import { Branch, BranchVideo, Preference, Service } from '../entities';
import { AnnounceDto, CreateBranchDto, UpdateBranchDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dtos';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(BranchVideo)
    private branchVideoRepository: Repository<BranchVideo>,
    @InjectRepository(Preference)
    private preferenceRepository: Repository<Preference>,
    private configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll({ limit, offset }: PaginationParamsDto) {
    const [branches, length] = await this.branchRepository.findAndCount({
      take: limit,
      skip: offset,
      relations: { services: true, videos: true },
      select: {
        services: { id: true, name: true },
      },
    });

    return {
      branches: branches.map(({ videos, ...props }) => ({
        videos: this._generatePlaylist(videos),
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
    const serviceDB = await this.serviceRepository.find({
      where: { id: In(services) },
    });
    const branch = this.branchRepository.create({
      ...props,
      services: serviceDB,
      videos: videos.map((video) => this.branchVideoRepository.create({ url: video })),
    });
    return await this.branchRepository.save(branch);
  }

  async update(id: string, branchDto: UpdateBranchDto) {
    const { services, videos, ...props } = branchDto;
    const branchDB = await this.branchRepository.findOne({
      where: { id },
      relations: { videos: true },
    });
    if (!branchDB) throw new NotFoundException(`La sucursal editada no existe`);
    const updatedServices = await this.serviceRepository.find({
      where: { id: In(services) },
    });
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
      return {
        ...updatedBranch,
        videos: this._generatePlaylist(updatedBranch.videos),
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this._deleteVideosBranch(videos);
      throw new InternalServerErrorException('Error al actualizar sucursal');
    } finally {
      await queryRunner.release();
    }
  }

  async searchAvailables(term?: string) {
    return await this.branchRepository.find({
      ...(term ? { where: { name: ILike(`%${term}%`) }, take: 5 } : {}),
    });
  }

  async getBranchServices(id: string) {
    const branchDB = await this.branchRepository.findOne({
      where: { id: id },
      relations: { services: true },
    });
    if (!branchDB) throw new BadRequestException(`La sucursal ${id} no existe`);
    return branchDB.services;
  }

  async getBranchConfig(id: string) {
    const branchDB = await this.branchRepository.findOne({
      where: { id },
      relations: {
        videos: true,
        services: { category: true },
      },
    });
    if (!branchDB) throw new BadRequestException(`La sucursal ${id} no existe`);
    const preferences = await this._generatePreferences();
    const menu = this._generateMenu(branchDB.services);
    const videos = this._generatePlaylist(branchDB.videos);
    return {
      id: branchDB.id,
      name: branchDB.name,
      message: branchDB.marqueeMessage,
      menu: menu,
      videos: videos,
      preferences: preferences,
      alertVideoUrl: branchDB.alertVideoUrl,
    };
  }

  async announce({ url, branches }: AnnounceDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(Branch, { id: In(branches) }, { alertVideoUrl: url });
      await queryRunner.commitTransaction();
      return branches;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error al actualizar sucursal');
    } finally {
      await queryRunner.release();
    }
  }

  private _generateMenu(services: Service[]) {
    const menu = services.reduce((acc, { category, name, id }) => {
      const service = { value: id, name: name, services: [] };
      if (!category) return { ...acc, [name]: service };
      const { services } = acc[category.name] ?? { services: [] };
      return {
        ...acc,
        [category.name]: {
          name: category.name,
          services: [...services, service],
        },
      };
    }, {});
    return Object.values(menu);
  }

  private _generatePlaylist(videos: BranchVideo[]) {
    const host = this.configService.getOrThrow('host');
    return videos.map((video) => `${host}/files/branch/${video.url}`);
  }

  private async _generatePreferences() {
    return await this.preferenceRepository.find({
      where: { active: true },
      select: ['id', 'name'],
    });
  }

  private _deleteVideosBranch(fileNames: string[]): void {
    for (const file of fileNames) {
      const filePath = path.join(process.cwd(), 'static', 'branches', file);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
}
