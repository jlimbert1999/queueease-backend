import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { PaginationParamsDto } from 'src/common/dtos';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async findAll({ limit, offset }: PaginationParamsDto) {
    const [users, length] = await this.userRepository.findAndCount({
      take: limit,
      skip: offset,
      order: {
        id: 'DESC',
      },
      relations: {
        counter: true,
      },
    });
    return { users, length };
  }

  async create({ password, ...props }: CreateUserDto) {
    await this._checkDuplicateLogin(props.login);
    const encryptedPassword = this._encryptPassword(password);
    const newUser = this.userRepository.create({ ...props, password: encryptedPassword });
    const createdUser = await this.userRepository.save(newUser);
    return this._removePasswordField(createdUser);
  }

  async update(id: number, user: UpdateUserDto) {
    const userDB = await this.userRepository.findOneBy({ id });
    if (!userDB) throw new NotFoundException(`El usuario editado no existe`);
    if (user.login !== userDB.login) await this._checkDuplicateLogin(user.login);
    if (user.password) user['password'] = this._encryptPassword(user.password);
    const updatedUser = await this.userRepository.save({ id, ...user });
    return this._removePasswordField(updatedUser);
  }

  private _encryptPassword(password: string): string {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(password, salt);
  }

  private async _checkDuplicateLogin(login: string) {
    const duplicate = await this.userRepository.findOneBy({ login });
    if (duplicate) throw new BadRequestException(`El login ${login} ya existe`);
  }

  private _removePasswordField(user: User) {
    delete user.password;
    return user;
  }
}
