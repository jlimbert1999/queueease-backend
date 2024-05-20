import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { ServiceRequest } from 'src/customer/entities';
import { UserSocket } from './interfaces/user-socket.interface';

@Injectable()
export class GroupwareService {
  private clients: Record<string, UserSocket> = {};

  constructor(private jwtService: JwtService) {}

  onClientConnected(id_socket: string, token: string): void {
    const decoded: JwtPayload = this.jwtService.verify(token);
    if (!decoded.counter) return;
    if (this.clients[decoded.id_user]) {
      this.clients[decoded.id_user].socketIds.push(id_socket);
      return;
    }
    this.clients[decoded.id_user] = {
      ...decoded,
      socketIds: [id_socket],
    };
  }

  onClientDisconnected(id_socket: string) {
    const client = Object.values(this.clients).find(({ socketIds }) => socketIds.includes(id_socket));
    if (!client) return;
    this.clients[client.id_user].socketIds = client.socketIds.filter((id) => id !== id_socket);
    if (this.clients[client.id_user].socketIds.length === 0) delete this.clients[client.id_user];
  }

  getClients() {
    return Object.values(this.clients);
  }

  getClientsForServiceRequest({ branch, service }: ServiceRequest) {
    return Object.values(this.clients).filter(
      ({ counter }) => counter.id_branch === branch.id && counter.services.includes(service.id),
    );
  }
}
