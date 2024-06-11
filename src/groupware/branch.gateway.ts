import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { BranchConnectionService } from './services';
import { ServiceRequest } from 'src/ticketing/entities';

@WebSocketGateway({ namespace: 'branches' })
export class BranchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private branchConnectionService: BranchConnectionService) {}

  handleConnection(client: Socket) {
    const data = client.handshake.auth['branch'];
    const [error, brach] = this.branchConnectionService.checkBranchIsValid(data);
    if (error) return client.disconnect();
    this.branchConnectionService.onBranchConnected(client.id, brach);
    console.log(this.branchConnectionService.getBranches());
  }

  handleDisconnect(client: Socket) {
    this.branchConnectionService.onBranchDisconnected(client.id);
  }

  notifyRequest(request: ServiceRequest) {
    const branch = this.branchConnectionService.getBranch(request.branch.id);
    console.log('active branch', branch);
    if (!branch) return;
    this.server.to(branch.socketIds).emit('attention', request);
  }
}
