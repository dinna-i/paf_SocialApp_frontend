import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosInstance from '../lib/axiosInstance';

export interface MessageResponse {
  messageId: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  content: string;
  timestamp: string; // ISO string
}

export interface ChatNotification {
  senderId: number;
  senderName: string;
  message: string;
}

export interface ChatUser {
  userId: number;
  userName: string;
}

type MsgCallback    = (msg: MessageResponse) => void;
type NotifCallback = (notif: ChatNotification) => void;

class ChatService {
  private client: Client | null = null;
  private messageCallbacks: MsgCallback[] = [];
  private notificationCallbacks: ((n: ChatNotification) => void)[] = [];

  onMessage(cb: MsgCallback) {
    this.messageCallbacks.push(cb);
  }

  onNotification(cb: (n: ChatNotification) => void) {
    this.notificationCallbacks.push(cb);
  }

  connect() {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8084/ws'),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      },
      reconnectDelay: 5000,
      onConnect: () => this._handleConnect(),
      onStompError: frame => {
        console.error('Broker error:', frame.headers['message'], frame.body);
      }
    });

    this.client.activate();
  }

  disconnect() {
    this.client?.deactivate();
    this.client = null;
  }

  sendMessage(toUserId: number, content: string) {
    this._publish('/app/chat', { receiverId: toUserId, content });
  }

  markDelivered(messageId: number) {
    this._publish('/app/message/delivered', messageId);
  }

  markRead(messageId: number) {
    this._publish('/app/message/read', messageId);
  }

  async fetchHistory(userId: number): Promise<MessageResponse[]> {
    const resp = await axiosInstance
      .get<MessageResponse[]>(`/messages/${userId}`);
    return resp.data;
  }

  async fetchChatUsers(): Promise<ChatUser[]> {
    const resp = await axiosInstance
      .get<ChatUser[]>(`/messages/users`);
    return resp.data;
  }

  private _handleConnect() {
    if (!this.client) return;

    this.client.subscribe('/user/queue/messages', (msg: IMessage) => {
      const body = JSON.parse(msg.body) as MessageResponse;
      this.messageCallbacks.forEach(cb => cb(body));
    });

     this.client.subscribe('/user/queue/notification', msg => {
      const body: ChatNotification = JSON.parse(msg.body);
      this.notificationCallbacks.forEach(cb => cb(body));
    });
  }

  private _publish(destination: string, payload: any) {
    if (!this.client?.active) {
      console.warn('STOMP not connected, reconnecting…');
      this.connect();
      return;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(payload)
    });
  }
}

export default new ChatService();
