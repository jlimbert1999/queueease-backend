import {
  Controller,
  Body,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PreferenceService } from '../services';
import { PaginationParamsDto } from 'src/common/dtos';
import { CreatePreferenceDto } from '../dtos';

@Controller('preferences')
export class PreferenceController {
  constructor(private preferenceService: PreferenceService) {}

  @Get()
  findAll(@Query() params: PaginationParamsDto) {
    return this.preferenceService.findAll(params);
  }

  @Get('search/:term')
  search(@Param('term') term: string, @Query() params: PaginationParamsDto) {
    return this.preferenceService.search(term, params);
  }

  @Post()
  create(@Body() data: CreatePreferenceDto) {
    return this.preferenceService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: CreatePreferenceDto) {
    return this.preferenceService.update(+id, data);
  }
}