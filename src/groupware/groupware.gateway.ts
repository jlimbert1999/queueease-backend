import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

import { GroupwareService } from './groupware.service';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { ServiceRequest } from 'src/ticketing/entities';

@WebSocketGateway({
  namespace: 'users',
  cors: {
    origin: '*',
  },
})
export class GroupwareGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private jwtService: JwtService,
    private groupwareService: GroupwareService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) return;
    try {
      const decoded: JwtPayload = this.jwtService.verify(token);
      this.groupwareService.onClientConnected(client.id, decoded);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.groupwareService.onClientDisconnected(client.id);
    client.broadcast.emit('listar', this.groupwareService.getClients());
  }

  notifyNewRequest(request: ServiceRequest) {
    const users = this.groupwareService.getClientsForServiceRequest(request);
    console.log('USERS TO SEND', users);
    users.forEach((user) => {
      this.server.to(user.socketIds).emit('new-request', request);
    });
  }

  sendNextRequest(request: ServiceRequest) {
    const clients = this.groupwareService.getClientsForServiceRequest(request);
    clients.forEach((user) => {
      this.server.to(user.socketIds).emit('next-request', request);
    });
    this.server.emit('attention', request);
  }
}
