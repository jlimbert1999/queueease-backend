import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CounterConnectionService } from './services/counter-connection.service';
import { GroupwareGateway } from './gateways/groupware.gateway';
import { BranchConnectionService } from './services/branch-connection.service';
import { BranchGateway } from './gateways/branch.gateway';

@Module({
  providers: [GroupwareGateway, CounterConnectionService, BranchConnectionService, BranchGateway],
  imports: [AuthModule],
  exports: [BranchGateway, GroupwareGateway, CounterConnectionService],
})
export class GroupwareModule {}
