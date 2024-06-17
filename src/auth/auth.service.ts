import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import { JwtPayload } from './interfaces/jwt.interface';
import { menuFrontend } from './interfaces/menu-frontend.interface';

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
    return {
      token: this._generateToken(userDB),
      redirectTo: this._generateRoute(userDB),
    };
  }

  async checkAuthStatus(id_user: string) {
    const userDB = await this.userRepository.findOne({ where: { id: id_user } });
    if (!userDB) throw new UnauthorizedException();
    return { token: this._generateToken(userDB), menu: this._generateMenu(userDB.roles) };
  }

  private _generateToken(user: User): string {
    const payload: JwtPayload = {
      id_user: user.id,
      fullname: user.fullname,
    };
    return this.jwtService.sign(payload);
  }

  private _generateRoute(user: User) {
    if (user.roles.includes(UserRole.ADMIN)) return '/main/administration';
    if (user.roles.includes(UserRole.OFFICER)) return '/main/queue';
    return '/main';
  }

  private _generateMenu(roles: string[]): menuFrontend[] {
    const menu: menuFrontend[] = [];
    if (roles.includes(UserRole.ADMIN)) {
      menu.push({
        label: 'Administracion',
        icon: 'pi pi-list',
        items: [
          {
            label: 'Categorias',
            routerLink: 'administration/categories',
          },
          {
            label: 'Servicios',
            routerLink: 'administration/services',
          },
          {
            label: 'Sucursales',
            routerLink: 'administration/branches',
          },
          {
            label: 'Ventanillas',
            routerLink: 'administration/counters',
          },
          {
            label: 'Usuarios',
            routerLink: 'administration/users',
          },
        ],
      });
    }
    return menu;
  }
}
