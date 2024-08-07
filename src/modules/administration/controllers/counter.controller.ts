import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CreateCounterDto, UpdateCounterDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dtos';

import { CounterService } from '../services';
import { Protected } from 'src/modules/auth/decorators';
import { UserRole } from 'src/modules/users/entities/user.entity';

@Controller('counter')
@Protected(UserRole.ADMIN)
export class CounterController {
  constructor(private serviceDeskService: CounterService) {}

  @Get()
  findAll(@Query() params: PaginationParamsDto) {
    return this.serviceDeskService.findAll(params);
  }

  @Post()
  create(@Body() counter: CreateCounterDto) {
    return this.serviceDeskService.create(counter);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() counter: UpdateCounterDto) {
    return this.serviceDeskService.update(id, counter);
  }
}
