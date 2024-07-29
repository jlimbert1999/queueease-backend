import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FilterByServiceAndUserDto } from './dtos';
import { Attention } from '../ticketing/entities';
import { reportByServiceAndUser, reportWork } from './interfaces';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportService {
  constructor(@InjectRepository(Attention) private attentionRepository: Repository<Attention>) {}

  async getTotalByServiceAndUser(params: FilterByServiceAndUserDto) {
    const queryBuilder = this.attentionRepository
      .createQueryBuilder('attention')
      .innerJoinAndSelect('attention.request', 'request')
      .where('request.branch = :id', { id: params.branchId })
      .innerJoinAndSelect('attention.user', 'user')
      .innerJoinAndSelect('request.service', 'service')
      .select('service.name', 'serviceName')
      .addSelect('user.fullname', 'userName')
      .addSelect('COUNT(attention.id)', 'totalAttentions')
      .groupBy('service.name')
      .addGroupBy('user.fullname');
    if (params.startDate) {
      queryBuilder.andWhere('DATE(request.createdAt) >= :startDate', {
        startDate: params.startDate,
      });
    }
    if (params.endDate) {
      queryBuilder.andWhere('DATE(request.createdAt) <= :endDate', { endDate: params.endDate });
    }
    const result: reportByServiceAndUser[] = await queryBuilder.getRawMany();
    const data = result.reduce((acc, current) => {
      const { users = [], total = 0 } = acc[current.serviceName] ?? {};
      return {
        ...acc,
        [current.serviceName]: {
          service: current.serviceName,
          total: total + parseInt(current.totalAttentions),
          users: [...users, { name: current.userName, total: parseInt(current.totalAttentions) }],
        },
      };
    }, {});
    return Object.values(data);
  }

  async getWorkDetails(user: User, date?: string) {
    const filterDate = date ? new Date(date) : new Date();
    filterDate.setHours(0, 0, 0, 0);
    const result: reportWork[] = await this.attentionRepository
      .createQueryBuilder('attention')
      .where('attention.user = :id', { id: user.id })
      .leftJoinAndSelect('attention.request', 'request')
      .where('DATE(request.createdAt) >= :date', { date: filterDate })
      .leftJoinAndSelect('request.service', 'service')
      .select('service.name', 'serviceName')
      .addSelect('request.status', 'status')
      .addSelect('COUNT(request.id)', 'requestCount')
      .groupBy('service.name')
      .addGroupBy('request.status')
      .getRawMany();

    const data = result.reduce((acc, current) => {
      const { details = [] } = acc[current.serviceName] ?? {};
      return {
        ...acc,
        [current.serviceName]: {
          service: current.serviceName,
          details: [...details, { status: current.status, total: current.requestCount }],
        },
      };
    }, {});
    return Object.values(data);
  }
}
