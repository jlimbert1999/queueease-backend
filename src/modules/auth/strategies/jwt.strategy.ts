import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt.interface';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('jwt_key'),
    });
  }
  async validate(payload: JwtPayload) {
    const { id_user } = payload;
    const userDB = await this.userRepository.findOne({ where: { id: id_user } });
    if (!userDB) throw new UnauthorizedException('Token invalido, vuelva a iniciar sesion');
    if (!userDB.isActive) throw new UnauthorizedException('El usuario ha sido deshabilitado');
    delete userDB.password;
    return userDB;
  }
}
