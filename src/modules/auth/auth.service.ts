import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { JwtPayload, menuFrontend } from './interfaces';
import { MENU_FRONTEND } from './constants/menu';
import { AuthDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login({ login, password }: AuthDto) {
    const userDB = await this.userRepository.findOneBy({ login });
    if (!userDB) throw new BadRequestException('Usuario o Contraseña incorrectos');
    if (!bcrypt.compareSync(password, userDB.password)) {
      throw new BadRequestException('Usuario o Contraseña incorrectos');
    }
    if (!userDB.isActive) throw new BadRequestException('El usuario ha sido deshabilitado');
    return {
      token: this._generateToken(userDB),
      redirectTo: this._generateRoute(userDB),
    };
  }

  async checkAuthStatus(userId: string) {
    const userDB = await this.userRepository.findOneBy({ id: userId });
    if (!userDB) throw new UnauthorizedException();
    return { token: this._generateToken(userDB), menu: this._generateMenu(userDB.roles), roles: userDB.roles };
  }

  private _generateToken(user: User): string {
    const payload: JwtPayload = {
      id_user: user.id,
      fullname: user.fullname,
    };
    return this.jwtService.sign(payload);
  }

  private _generateRoute(user: User): string {
    if (user.roles.includes(UserRole.ADMIN)) return '/main/administration';
    if (user.roles.includes(UserRole.OFFICER)) return '/main/queue';
    return '/main';
  }

  private _generateMenu(roles: string[]): menuFrontend[] {
    const menu = MENU_FRONTEND;
    return menu
      .filter(({ role }) => roles.includes(role))
      .reduce((previus, current) => [...previus, ...current.menu], []);
  }
}
