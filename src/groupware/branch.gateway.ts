import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { BranchConnectionService } from './services';

interface advertisement {
  id: string;
  code: string;
  counterNumber: number;
}

@WebSocketGateway({ namespace: 'branches' })
export class BranchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private branchConnectionService: BranchConnectionService) {}

  handleConnection(client: Socket) {
    const data = client.handshake.auth['branch'];
    const [error, brach] = this.branchConnectionService.checkBranchIsValid(data);
    if (error) return client.disconnect();
    this.branchConnectionService.onBranchConnected(client.id, brach);
  }

  handleDisconnect(client: Socket) {
    this.branchConnectionService.onBranchDisconnected(client.id);
  }

  announceRequest(id_branch: string, advertisement: advertisement) {
    const { socketIds } = this.branchConnectionService.getBranch(id_branch) ?? { socketIds: [] };
    this.server.to(socketIds).emit('announce', advertisement);
  }
}
