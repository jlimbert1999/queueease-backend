import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, In, Repository } from 'typeorm';

import { AnnounceDto, CreateBranchDto, UpdateBranchDto } from '../dtos';
import { Branch, BranchVideo, Preference, Service } from '../entities';
import { FilesService } from 'src/modules/files/files.service';
import { PaginationParamsDto } from 'src/common/dtos';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
    @InjectRepository(Service) private serviceRepository: Repository<Service>,
    @InjectRepository(BranchVideo) private branchVideoRepository: Repository<BranchVideo>,
    @InjectRepository(Preference) private preferenceRepository: Repository<Preference>,
    private dataSource: DataSource,
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
      branches: branches.map((branch) => this._plainBranch(branch)),
      length,
    };
  }

  async create(branchDto: CreateBranchDto) {
    const { services, videos, ...props } = branchDto;
    const branch = this.branchRepository.create({
      ...props,
      services: await this.serviceRepository.find({ where: { id: In(services) } }),
      videos: videos.map((video) => this.branchVideoRepository.create({ url: video })),
    });
    const createdBranch = await this.branchRepository.save(branch);
    this.fileService.saveFiles(videos, 'branches');
    return this._plainBranch(createdBranch);
  }

  async update(id: string, branchDto: UpdateBranchDto) {
    const { videos, services, ...props } = branchDto;
    const branchDb = await this.branchRepository.findOne({
      where: { id },
      relations: { videos: true, services: true },
    });
    if (!branchDb) throw new NotFoundException(`La sucursal ${id} no existe`);
    const files = { toDelete: [], toSave: [] };
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (videos) {
        const savedVideos = branchDb.videos.map(({ url }) => url);
        files.toDelete = savedVideos.filter((name) => !videos.includes(name));
        files.toSave = videos.filter((name) => !savedVideos.includes(name));
        // Replace videos with new videos
        await queryRunner.manager.delete(BranchVideo, { branch: { id } });
        branchDb.videos = videos.map((video) => this.branchVideoRepository.create({ url: video }));
      }
      if (services) {
        branchDb.services = await queryRunner.manager.find(Service, {
          where: { id: In(services) },
        });
      }
      const updatedBranch = this.branchRepository.merge(branchDb, props);
      await queryRunner.manager.save(updatedBranch);

      // Remove unused files
      this.fileService.deleteFiles(files.toDelete, 'branches');
      // Move temp files to folder
      this.fileService.saveFiles(files.toSave, 'branches');
      
      await queryRunner.commitTransaction();
      return this._plainBranch(updatedBranch);
    } catch (err) {
      await queryRunner.rollbackTransaction();
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
    const videos = branchDB.videos.map(({ url }) => this.fileService.buildFileUrl(url, 'branches'));
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

  private async _generatePreferences() {
    return await this.preferenceRepository.find({
      where: { active: true },
      select: ['id', 'name'],
    });
  }

  private _plainBranch({ videos, ...props }: Branch) {
    return {
      videos: videos.map(({ url }) => this.fileService.buildFileUrl(url, 'branches')),
      ...props,
    };
  }
}
