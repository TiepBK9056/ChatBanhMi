import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';

let connection: signalR.HubConnection | null = null;

export const initializeSignalRConnection = async (accessToken: string): Promise<signalR.HubConnection> => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    console.log('[SignalRService] Reusing existing connection. ConnectionId:', connection.connectionId);
    return connection;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5130/chatHub', {
      accessTokenFactory: () => {
        console.log('[SignalRService] Sending access token:', accessToken.substring(0, 10) + '...');
        return accessToken;
      },
      logger: signalR.LogLevel.Debug,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .build();

  try {
    await connection.start();
    console.log('[SignalRService] SignalR connected successfully. ConnectionId:', connection.connectionId);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
    console.error('[SignalRService] SignalR Connection Error:', err);
    toast.error(`Không thể kết nối SignalR: ${errorMessage}`);
    throw err;
  }

  connection.onclose((error) => {
    console.error('[SignalRService] SignalR connection closed:', error);
    toast.error('Mất kết nối với server, đang thử kết nối lại...');
  });

  return connection;
};

export const getSignalRConnection = (): signalR.HubConnection | null => {
  return connection;
};

export const stopSignalRConnection = async () => {
  if (connection) {
    console.log('[SignalRService] Cleaning up SignalR connection');
    await connection.stop().catch(err => {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      console.error('[SignalRService] Error stopping SignalR:', errorMessage);
    });
    connection = null;
  }
};