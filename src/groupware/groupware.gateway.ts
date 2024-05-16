import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { GroupwareService } from './groupware.service';

import { Server, Socket } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { JwtService } from '@nestjs/jwt';
import { ServiceRequest } from 'src/customer/entities';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GroupwareGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(
    private groupwareService: GroupwareService,
    private jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const decoded: JwtPayload = this.jwtService.verify(token);
      this.groupwareService.onClientConnected(client.id, decoded);
      this.server.emit('listar', this.groupwareService.getClients());
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.groupwareService.onClientDisconnected(client.id);
    client.broadcast.emit('listar', this.groupwareService.getClients());
  }

  sendServiceRequests(request: ServiceRequest) {
    const users = this.groupwareService.getUsersForServiceRequest(request);
    users.forEach((user) => {
      user.socketIds.forEach((socketId) => {
        this.server.to(socketId).emit('new-request', request);
      });
    });
  }
}
