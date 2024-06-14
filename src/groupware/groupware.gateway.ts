import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

import { GroupwareService } from './groupware.service';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { ServiceRequest } from 'src/ticketing/entities';
import { BranchGateway } from './branch.gateway';

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
    private branchGateway: BranchGateway,
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
    const clients = this.groupwareService.getClientsForServicing(request.branchId, request.serviceId);
    for (const client of clients) {
      this.server.to(client.socketIds).emit('new-request', request);
    }
  }

  notifyRequestHandled(branchId: string, serviceId: string, requestId: string) {
    const clients = this.groupwareService.getClientsForServicing(branchId, serviceId);
    for (const client of clients) {
      this.server.to(client.socketIds).emit('handle-request', requestId);
    }
  }

  @SubscribeMessage('test')
  handleEvent(@MessageBody() data: ServiceRequest) {
    console.log(data);
    // this.branchGateway.announceRequest();
  }
}
