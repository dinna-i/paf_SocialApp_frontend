// src/types/message.ts
export interface User {
    userId: number;
    userName: string;
    email: string;
  }
  
  export interface MessageRequest {
    receiverId: number;
    content: string;
  }
  
  export interface MessageResponse {
    messageId: number;
    senderId: number;
    senderName: string;
    receiverId: number;
    receiverName: string;
    content: string;
    timestamp: string;
  }
  
  export interface ChatNotification {
    senderId: number;
    senderName: string;
    message: string;
  }