import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GroupwareService } from './services/groupware.service';
import { GroupwareGateway } from './groupware.gateway';
import { BranchConnectionService } from './services/branch-connection.service';
import { BranchGateway } from './branch.gateway';

@Module({
  providers: [GroupwareGateway, GroupwareService, BranchConnectionService, BranchGateway],
  imports: [AuthModule],
  exports: [BranchGateway, GroupwareGateway, GroupwareService],
})
export class GroupwareModule {}
