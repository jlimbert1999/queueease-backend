import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';

import { ManagementModule } from './management/management.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { GroupwareModule } from './groupware/groupware.module';
import { TicketingModule } from './ticketing/ticketing.module';


@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get('DATABASE_PORT'),
        database: configService.get('DATABASE_NAME'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    GroupwareModule,
    TicketingModule,
    ManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
