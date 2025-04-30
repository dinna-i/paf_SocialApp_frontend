// API URL
export const API_BASE_URL = 'http://localhost:8084';

// WebSocket events
export const WS_EVENTS = {
  CONNECT: 'CONNECT',
  DISCONNECT: 'DISCONNECT',
  MESSAGE: 'MESSAGE',
  NOTIFICATION: 'NOTIFICATION'
};

// Message status
export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}