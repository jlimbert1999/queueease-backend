import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import { JwtPayload } from './interfaces/jwt.interface';

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

  async checkAuthStatus(id_user: number) {
    const userDB = await this.userRepository.findOneBy({ id: id_user });
    if (!userDB) throw new UnauthorizedException();
    return { token: this._generateToken(userDB) };
  }

  private _generateToken(user: User): string {
    const payload: JwtPayload = {
      id_user: user.id,
      fullname: user.fullname,
    };
    return this.jwtService.sign(payload);
  }

  private _generateRoute(user: User) {
    if (user.roles.includes(UserRole.ADMIN)) return 'administration';
    if (user.roles.includes(UserRole.OFFICER)) return 'queue';
    return '';
  }
}
