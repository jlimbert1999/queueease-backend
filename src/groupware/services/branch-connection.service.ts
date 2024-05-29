import { Injectable } from '@nestjs/common';
import { BranchSocket } from '../interfaces';

interface branch {
  id: number;
  name: string;
}
@Injectable()
export class BranchConnectionService {
  private branches: Record<number, BranchSocket> = {};

  onBranchConnected(id_socket: string, branch: branch) {
    if (this.branches[branch.id]) {
      return this.branches[branch.id].socketIds.push(id_socket);
    }
    this.branches[branch.id] = {
      ...branch,
      socketIds: [id_socket],
    };
  }

  onBranchDisconnected(id_socket: string) {
    const branch = this.getBranches().find(({ socketIds }) => socketIds.includes(id_socket));
    if (!branch) return;
    const connectedSockets = branch.socketIds.filter((id) => id !== id_socket);
    if (connectedSockets.length === 0) return delete this.branches[branch.id];
    this.branches[branch.id].socketIds = connectedSockets;
  }

  getBranches() {
    return Object.values(this.branches);
  }

  getBranch(id_branch: number) {
    return this.getBranches().find((branch) => branch.id === id_branch);
  }

  checkBranchIsValid(object: { [key: string]: any } = {}): [string?, branch?] {
    const { id, name } = object;
    if (!id || !name) return ['invalid branch'];
    return [undefined, { id, name }];
  }
}
