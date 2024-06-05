import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CounterService } from '../services';
import { PaginationParamsDto } from 'src/common/dtos';
import { CreateServiceDeskDto, UpdateServiceDeskDto } from '../dtos';

@Controller('service-desks')
export class ServiceCounterController {
  constructor(private serviceDeskService: CounterService) {}

  @Get()
  findAll(@Query() params: PaginationParamsDto) {
    return this.serviceDeskService.findAll(params);
  }

  @Post()
  create(@Body() desk: CreateServiceDeskDto) {
    return this.serviceDeskService.create(desk);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() desk: UpdateServiceDeskDto) {
    return this.serviceDeskService.update(id, desk);
  }
}
