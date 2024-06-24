import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';
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
  checkAuth(@UserRequest() user: User) {
    return this.authService.checkAuthStatus(user.id);
  }
}
