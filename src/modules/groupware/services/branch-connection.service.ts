import { Injectable } from '@nestjs/common';
import { BranchSocket } from '../interfaces';

interface branch {
  id: string;
  name: string;
}
@Injectable()
export class BranchConnectionService {
  private branches: Record<string, BranchSocket> = {};

  onBranchConnected(socketId: string, branch: branch) {
    if (this.branches[branch.id]) {
      return this.branches[branch.id].socketIds.push(socketId);
    }
    this.branches[branch.id] = {
      ...branch,
      socketIds: [socketId],
    };
  }

  onBranchDisconnected(socketId: string) {
    const branch = this.getBranches().find(({ socketIds }) => socketIds.includes(socketId));
    if (!branch) return;
    const connectedSockets = branch.socketIds.filter((id) => id !== socketId);
    if (connectedSockets.length === 0) return delete this.branches[branch.id];
    this.branches[branch.id].socketIds = connectedSockets;
  }

  getBranches() {
    return Object.values(this.branches);
  }

  getBranch(branchId: string): BranchSocket | undefined {
    return this.getBranches().find((branch) => branch.id === branchId);
  }

  checkBranchIsValid(object: { [key: string]: any } = {}): [string?, branch?] {
    const { id, name } = object;
    if (!id || !name) return ['invalid branch'];
    return [undefined, { id, name }];
  }
}
