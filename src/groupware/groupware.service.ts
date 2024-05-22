import { Injectable } from '@nestjs/common';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { UserSocket } from './interfaces/user-socket.interface';
import { ServiceRequest } from 'src/ticketing/entities';

@Injectable()
export class GroupwareService {
  private clients: Record<string, UserSocket> = {};

  constructor() {}

  onClientConnected(id_socket: string, payload: JwtPayload): void {
    if (this.clients[payload.id_user]) {
      this.clients[payload.id_user].socketIds.push(id_socket);
      return;
    }
    this.clients[payload.id_user] = {
      ...payload,
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
    return Object.values(this.clients)
      .filter((el) => el.counter)
      .filter(({ counter }) => counter.id_branch === branch.id && counter.services.includes(service.id));
  }
}
