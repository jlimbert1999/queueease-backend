import { Controller, Post, Body, Get, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Public, UserRequest } from './decorators';
import { User } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @Get()
  checkAuth(@UserRequest() user: User, @Ip() ip: string) {
    console.log(ip);
    return this.authService.checkAuthStatus(user.id);
  }
}
