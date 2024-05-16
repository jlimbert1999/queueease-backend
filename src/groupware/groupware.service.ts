import { Injectable } from '@nestjs/common';
import { UserSocket } from './interfaces/user-socket.interace';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { ServiceRequest } from 'src/customer/entities';

@Injectable()
export class GroupwareService {
  private clients: Record<string, UserSocket> = {};

  onClientConnected(id_socket: string, payload: JwtPayload): void {
    if (this.clients[payload.id_user]) {
      this.clients[payload.id_user].socketIds.push(id_socket);
      return;
    }
    this.clients[payload.id_user] = {
      branch: payload.serviceCounter.id_branch,
      fullname: payload.fullname,
      id_user: payload.id_user,
      services: payload.serviceCounter.service,
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

  getUsersForServiceRequest(request: ServiceRequest) {
    console.log(request);
    console.log(this.clients);
    return this.getClients().filter(
      ({ branch, services }) => branch === request.branch.id && services.includes(request.service.id),
    );
  }
}
