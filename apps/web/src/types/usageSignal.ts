export interface UsageSignal {
  id: number;
  subscriptionId: number;
  signalType: string;
  value: string;
  createdAt: string;
}

export interface UsageSignalPayload {
  subscriptionId: number;
  signalType: string;
  value: string;
}
