// src/services/ChatService.ts
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { MessageResponse } from '../types/message';

class ChatService {
  private stompClient: any;
  private isConnected: boolean = false;
  private subscriptions: Map<string, any> = new Map();
  private connectionPromise: Promise<any> | null = null;
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('accessToken');
    console.log('ChatService initialized, token exists:', !!this.token);
  }

  public connect(): Promise<any> {
    console.log('Attempting to connect to WebSocket...');
    
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      if (this.isConnected) {
        console.log('Already connected to WebSocket');
        resolve(this.stompClient);
        return;
      }

      try {
        console.log('Creating SockJS connection to http://localhost:8084/ws');
        const socket = new SockJS('http://localhost:8084/ws');
        
        console.log('Initializing STOMP client');
        this.stompClient = Stomp.over(socket);
        
        // Enable debug logs
        this.stompClient.debug = function(str: string) {
          console.log('STOMP: ' + str);
        };

        // Connect headers with JWT token
        const headers: Record<string, string> = {};
        if (this.token) {
          headers['Authorization'] = `Bearer ${this.token}`;
          console.log('Added authorization header with token');
        }

        console.log('Connecting to STOMP broker...');
        this.stompClient.connect(
          headers,
          (frame: any) => {
            console.log('WebSocket connection successful:', frame);
            this.isConnected = true;

            // Re-establish any subscriptions
            if (this.subscriptions.size > 0) {
              console.log('Restoring', this.subscriptions.size, 'subscriptions');
              this.subscriptions.forEach((callback, destination) => {
                this._subscribe(destination, callback);
              });
            }

            resolve(this.stompClient);
          },
          (error: any) => {
            console.error('WebSocket connection error:', error);
            this.isConnected = false;
            this.connectionPromise = null;
            reject(error);
          }
        );
      } catch (error) {
        console.error('Exception during WebSocket connection setup:', error);
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  public disconnect(): void {
    if (this.stompClient && this.isConnected) {
      console.log('Disconnecting WebSocket');
      this.stompClient.disconnect();
      this.isConnected = false;
      this.connectionPromise = null;
      this.subscriptions.clear();
      console.log('WebSocket disconnected');
    }
  }

  public subscribe(destination: string, callback: (data: any) => void): any {
    console.log(`Subscribing to ${destination}`);
    // Store subscription for reconnection
    this.subscriptions.set(destination, callback);

    // If connected, subscribe immediately
    if (this.isConnected && this.stompClient) {
      return this._subscribe(destination, callback);
    }

    // Otherwise connect first, then subscribe
    console.log('Not connected yet, connecting first before subscribing');
    return this.connect().then(() => {
      return this._subscribe(destination, callback);
    });
  }

  private _subscribe(destination: string, callback: (data: any) => void): any {
    console.log(`Executing subscription to ${destination}`);
    const subscription = this.stompClient.subscribe(destination, (message: any) => {
      console.log(`Received message on ${destination}:`, message);
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    console.log(`Subscription to ${destination} successful`);
    return subscription;
  }

  public unsubscribe(destination: string): void {
    console.log(`Unsubscribing from ${destination}`);
    this.subscriptions.delete(destination);
  }

  public send(destination: string, message: any): Promise<void> {
    console.log(`Sending message to ${destination}:`, message);
    return this.connect().then(() => {
      this.stompClient.send(destination, {}, JSON.stringify(message));
      console.log('Message sent successfully');
    });
  }

  public async getConversation(userId: number): Promise<MessageResponse[]> {
    console.log(`Fetching conversation with user ${userId}`);
    try {
      const response = await fetch(`http://localhost:8084/api/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch conversation: ${response.status}`, errorText);
        throw new Error(`Failed to fetch conversation: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} messages`);
      return data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  public async getChatUsers(): Promise<any[]> {
    console.log('Fetching chat users');
    try {
      const response = await fetch('http://localhost:8084/api/messages/users', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch chat users: ${response.status}`, errorText);
        throw new Error(`Failed to fetch chat users: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} chat users`);
      return data;
    } catch (error) {
      console.error('Error fetching chat users:', error);
      throw error;
    }
  }

  public async getAllUsers(): Promise<any[]> {
    try {
      const response = await fetch('http://localhost:8084/api/user/all', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }
  
}

// Create a singleton instance
const chatService = new ChatService();
export default chatService;