import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, ILike, In, Repository } from 'typeorm';

import { Branch, BranchVideo, Preference, Service } from '../entities';
import { AnnounceDto, CreateBranchDto, UpdateBranchDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dtos';
import { FilesService } from 'src/modules/files/files.service';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(BranchVideo) private branchVideoRepository: Repository<BranchVideo>,
    @InjectRepository(Preference) private preferenceRepository: Repository<Preference>,
    private readonly dataSource: DataSource,
    private configService: ConfigService,
    private fileService: FilesService,
  ) {}

  async findAll({ limit, offset, term }: PaginationParamsDto) {
    const [branches, length] = await this.branchRepository.findAndCount({
      take: limit,
      skip: offset,
      relations: { services: true, videos: true },
      ...(term && { where: { name: ILike(`%${term}%`) } }),
    });
    return {
      branches: branches.map(({ videos, ...props }) => ({
        videos: this._generatePlaylist(videos),
        ...props,
      })),
      length,
    };
  }

  async create(branchDto: CreateBranchDto) {
    const { services, videos, ...props } = branchDto;
    const serviceDB = await this.serviceRepository.find({ where: { id: In(services) } });
    const branch = this.branchRepository.create({
      ...props,
      services: serviceDB,
      videos: videos.map((video) => this.branchVideoRepository.create({ url: video })),
    });
    const createdBranch = await this.branchRepository.save(branch);
    this.fileService.saveFiles(videos, 'branches');
    return this._plainBranch(createdBranch);
  }

  async update(id: string, branchDto: UpdateBranchDto) {
    const { videos, services, ...props } = branchDto;
    const branchDB = await this.branchRepository.findOne({
      where: { id },
      relations: { videos: true, services: true },
    });
    if (!branchDB) throw new NotFoundException(`La sucursal ${id} no existe`);
    let videosToDelete: string[] = [];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (videos) {
        await queryRunner.manager.delete(BranchVideo, { branch: { id } });
        videosToDelete = branchDB.videos.filter(({ url }) => !videos.includes(url)).map(({ url }) => url);
        branchDB.videos = videos.map((video) => this.branchVideoRepository.create({ url: video }));
      }
      if (services) {
        branchDB.services = await queryRunner.manager.find(Service, {
          where: { id: In(services) },
        });
      }
      const updatedBranch = this.branchRepository.merge(branchDB, props);
      await queryRunner.manager.save(updatedBranch);
      await queryRunner.commitTransaction();
      this.fileService.deleteFiles(videosToDelete, 'branches');
      this.fileService.saveFiles(videos, 'branches');
      return this._plainBranch(updatedBranch);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Error al actualizar sucursal');
    } finally {
      console.log('object');
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

  async announceVideo({ url, branches }: AnnounceDto) {
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

  private async _plainBranch({ videos, ...props }: Branch) {
    return { ...props, videos: this._generatePlaylist(videos) };
  }
}
