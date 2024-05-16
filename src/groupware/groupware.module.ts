import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GroupwareService } from './groupware.service';
import { GroupwareGateway } from './groupware.gateway';

@Module({
  providers: [GroupwareGateway, GroupwareService],
  imports: [AuthModule],
  exports: [GroupwareGateway, GroupwareService],
})
export class GroupwareModule {}
