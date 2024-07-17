import { Injectable } from '@nestjs/common';
import { counterPayload } from '../interfaces';

interface CounterSocket {
  id: string;
  branchId: string;
  services: string[];
  socketIds: string[];
}

@Injectable()
export class GroupwareService {
  private counters: Record<string, CounterSocket> = {};

  onCounterConnected(id_socket: string, counter: counterPayload): void {
    const { socketIds } = this.counters[counter.id] ?? { socketIds: [] };
    this.counters[counter.id] = {
      ...counter,
      socketIds: [...socketIds, id_socket],
    };
  }

  onCounterDisconnected(id_socket: string) {
    const counter = this.getCounterBySocketId(id_socket);
    if (!counter) return;
    this.counters[counter.id].socketIds = counter.socketIds.filter((id) => id !== id_socket);
    if (this.counters[counter.id].socketIds.length === 0) {
      delete this.counters[counter.id];
    }
  }

  getCounters() {
    return Object.values(this.counters);
  }

  getCounterBySocketId(id_socket: string): CounterSocket | undefined {
    return Object.values(this.counters).find(({ socketIds }) => socketIds.includes(id_socket));
  }

  getCountersByGroup(branchId: string, serviceId: string) {
    return Object.values(this.counters).filter(
      (counter) => counter.branchId === branchId && counter.services.includes(serviceId),
    );
  }
}
