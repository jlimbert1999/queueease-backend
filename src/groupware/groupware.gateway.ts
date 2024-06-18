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
import { ServiceRequest } from 'src/ticketing/entities';
import { BranchGateway } from './branch.gateway';
import { advertisement } from './interfaces';

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

  handleConnection(socket: Socket) {
    try {
      const { token, counter } = socket.handshake.auth;
      this.jwtService.verify(token);
      this.groupwareService.onCounterConnected(socket.id, counter);
    } catch (error) {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    this.groupwareService.onCounterDisconnected(socket.id);
  }

  notifyNewRequest(request: ServiceRequest) {
    const clients = this.groupwareService.getCountersByGroup(request.branchId, request.serviceId);
    for (const client of clients) {
      this.server.to(client.socketIds).emit('new-request', request);
    }
  }

  notifyRequestHandled(branchId: string, serviceId: string, requestId: string) {
    const clients = this.groupwareService.getCountersByGroup(branchId, serviceId);
    for (const client of clients) {
      this.server.to(client.socketIds).emit('handle-request', requestId);
    }
  }

  @SubscribeMessage('notify')
  handleEvent(@MessageBody() data: { branchId: string; advertisement: advertisement }) {
    this.branchGateway.announceRequest(data.branchId, data.advertisement);
  }
}
