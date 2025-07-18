// ClientApp/lib/signalr.ts
"use client";
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useEffect, useState } from 'react';

interface MessageData {
  messageId: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface ChatHubHook {
  connection: HubConnection | null;
  joinConversation: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  readMessage: (messageId: string) => Promise<void>;
  onReceiveMessage: (callback: (data: MessageData) => void) => void;
  onUserStatus: (callback: (connectionId: string, status: string) => void) => void;
  onMessageRead: (callback: (messageId: string, userId: string) => void) => void;
}

export function useChatHub(userId: string): ChatHubHook {
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl('http://localhost:5130/chathub')
      .withAutomaticReconnect()
      .build();

    conn
      .start()
      .then(() => setConnection(conn))
      .catch((err) => console.error('SignalR Connection Error:', err));

    return () => {
      conn.stop().catch((err) => console.error('SignalR Stop Error:', err));
    };
  }, []);

  const joinConversation = async (conversationId: string) => {
    if (!connection) {
      throw new Error('SignalR connection not established');
    }
    try {
      await connection.invoke('JoinConversation', conversationId);
    } catch (error) {
      console.error('JoinConversation Error:', error);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!connection) {
      throw new Error('SignalR connection not established');
    }
    try {
      await connection.invoke('SendMessage', conversationId, content, userId);
    } catch (error) {
      console.error('SendMessage Error:', error);
    }
  };

  const readMessage = async (messageId: string) => {
    if (!connection) {
      throw new Error('SignalR connection not established');
    }
    try {
      await connection.invoke('ReadMessage', messageId, userId);
    } catch (error) {
      console.error('ReadMessage Error:', error);
    }
  };

  const onReceiveMessage = (callback: (data: MessageData) => void) => {
    if (connection) {
      connection.on('ReceiveMessage', callback);
    }
  };

  const onUserStatus = (callback: (connectionId: string, status: string) => void) => {
    if (connection) {
      connection.on('UserStatus', callback);
    }
  };

  const onMessageRead = (callback: (messageId: string, userId: string) => void) => {
    if (connection) {
      connection.on('MessageRead', callback);
    }
  };

  return { connection, joinConversation, sendMessage, readMessage, onReceiveMessage, onUserStatus, onMessageRead };
}