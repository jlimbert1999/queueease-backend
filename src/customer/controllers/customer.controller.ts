import { Controller, Get, Param } from '@nestjs/common';
import { BranchesService } from 'src/management/services';

@Controller('customers')
export class CustomerController {
  constructor(private brancService: BranchesService) {}

  @Get('menu/:id_branch')
  getMenu(@Param('id_branch') id_branch: string) {
    return this.brancService.getMenu(+id_branch);
  }
}
