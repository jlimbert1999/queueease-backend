import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/users/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('jwt_key'),
        signOptions: { expiresIn: '8h' },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
