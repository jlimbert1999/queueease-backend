import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { GroupwareService } from './groupware.service';
import { ServiceRequest } from 'src/customer/entities';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GroupwareGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private groupwareService: GroupwareService) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) return;
    this.groupwareService.onClientConnected(client.id, token);
  }

  handleDisconnect(client: Socket) {
    this.groupwareService.onClientDisconnected(client.id);
    client.broadcast.emit('listar', this.groupwareService.getClients());
  }

  sendServiceRequests(request: ServiceRequest) {
    const users = this.groupwareService.getClientsForServiceRequest(request);
    users.forEach((user) => {
      user.socketIds.forEach((socketId) => {
        this.server.to(socketId).emit('new-request', request);
      });
    });
  }

  sendNextRequest(request: ServiceRequest) {
    const clients = this.groupwareService.getClientsForServiceRequest(request);
    clients.forEach((user) => {
      user.socketIds.forEach((socketId) => {
        this.server.to(socketId).emit('next-request', request);
      });
    });
    this.server.emit('attention', request);
  }
}
