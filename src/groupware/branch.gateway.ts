import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { BranchConnectionService } from './services';
import { ServiceRequest } from 'src/ticketing/entities';

// interface advertisement {
//   id: string;
//   code: string;
//   counterNumber: number;
// }

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

  announceRequest(request: ServiceRequest) {
    console.log(request);
    const branch = this.branchConnectionService.getBranch(request.branchId);
    // if (!branch) return;
    // // console.log('sending data ', branch);
    this.server
      .to(branch.socketIds)
      .emit('announce', { id: request.id, code: request.code, counterNumber: 2 });
  }
}
