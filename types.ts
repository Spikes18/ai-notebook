export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export enum AIActionStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AIState {
  status: AIActionStatus;
  message?: string;
}
