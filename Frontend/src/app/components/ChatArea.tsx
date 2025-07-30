import { FaPaperclip, FaSmile, FaPaperPlane } from 'react-icons/fa';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import debounce from 'lodash/debounce';

interface Message {
  messageId: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  name: string;
  online: boolean;
}

interface ChatAreaProps {
  selectedConversation: Conversation | null;
}

export default function ChatArea({ selectedConversation }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn, user } = useAuth();
  const isConversationInitialized = useRef<Map<number, boolean>>(new Map());

  // Kết nối SignalR
  useEffect(() => {
    if (!isLoggedIn || !user) {
      console.log('[ChatArea] User not logged in or user data missing');
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.log('[ChatArea] No access token found in localStorage');
      toast.error('Chưa đăng nhập');
      return;
    }

    console.log('[ChatArea] Starting SignalR connection with token:', accessToken.substring(0, 10) + '...');

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5130/chatHub', {
        accessTokenFactory: () => accessToken,
        logger: signalR.LogLevel.Debug,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    setConnection(newConnection);

    newConnection
      .start()
      .then(() => {
        console.log('[ChatArea] SignalR connected successfully. ConnectionId:', newConnection.connectionId);
      })
      .catch(err => {
        console.error('[ChatArea] SignalR Connection Error:', err);
        toast.error(`Không thể kết nối SignalR: ${err.message}`);
      });

    newConnection.onclose((error) => {
      console.error('[ChatArea] SignalR connection closed:', error);
      toast.error('Mất kết nối với server, đang thử kết nối lại...');
    });

    return () => {
      console.log('[ChatArea] Cleaning up SignalR connection');
      newConnection.stop().catch(err => console.error('[ChatArea] Error stopping SignalR:', err));
    };
  }, [isLoggedIn, user]);

  // Hàm fetchMessages
  const fetchMessages = useCallback(async (convId: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No access token found');

      console.log('[ChatArea] Fetching messages for conversation:', convId);
      const response = await axios.get<Message[]>(
        `http://localhost:5130/api/Messages?conversationId=${convId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      console.log('[ChatArea] Messages fetched:', response.data);
      setMessages(response.data.map(msg => ({ ...msg, createdAt: new Date(msg.createdAt) })));
    } catch (error) {
      console.error('[ChatArea] Error fetching messages:', error);
      toast.error('Không thể tải tin nhắn');
    }
  }, []);

  // Hàm markMessagesAsRead
  const markMessagesAsRead = useCallback(async (convId: number) => {
    if (!connection || !user) return;
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No access token found');

      console.log('[ChatArea] Marking messages as read for conversation:', convId);
      for (const msg of messages.filter(m => !m.isRead && m.senderId !== user?.userId)) {
        try {
          await connection.invoke('MarkMessageAsRead', convId, msg.messageId);
          console.log('[ChatArea] Marked message as read:', msg.messageId);
        } catch (err) {
          console.error('[ChatArea] SignalR MarkMessageAsRead Error:', err);
          await axios.post(
            `http://localhost:5130/api/Messages/${msg.messageId}/read`,
            {},
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          console.log('[ChatArea] Fallback API marked message as read:', msg.messageId);
        }
      }
    } catch (error) {
      console.error('[ChatArea] Error marking messages as read:', error);
    }
  }, [connection, user, messages]);

  // Xử lý khi chọn conversation
  useEffect(() => {
    if (!selectedConversation || !connection || !isLoggedIn || !user) {
      console.log('[ChatArea] Missing required data:', {
        selectedConversation: !!selectedConversation,
        connection: !!connection,
        isLoggedIn,
        user: !!user,
      });
      return;
    }

    const convId = parseInt(selectedConversation.id);
    console.log('[ChatArea] Joining conversation:', convId);

    const initializeConversation = async () => {
      if (isConversationInitialized.current.get(convId)) {
        console.log('[ChatArea] Conversation already initialized:', convId);
        return;
      }

      if (connection.state === signalR.HubConnectionState.Connected) {
        try {
          await connection.invoke('JoinConversation', convId);
          console.log('[ChatArea] Joined conversation:', convId);
          isConversationInitialized.current.set(convId, true);
          await fetchMessages(convId);
          if (messages.some(m => !m.isRead && m.senderId !== user?.userId)) {
            await markMessagesAsRead(convId);
          }
        } catch (err) {
          console.error('[ChatArea] JoinConversation Error:', err);
          toast.error('Không thể tham gia cuộc hội thoại');
        }
      } else {
        console.log('[ChatArea] SignalR not connected, skipping JoinConversation');
      }
    };

    initializeConversation();

    connection.on('ReceiveMessage', (message: Message) => {
      console.log('[ChatArea] Received message:', message);
      setMessages(prev => {
        // Tránh thêm tin nhắn trùng lặp
        if (prev.some(msg => msg.messageId === message.messageId)) {
          console.log('[ChatArea] Message already exists, skipping:', message.messageId);
          return prev;
        }
        const newMessages = [...prev, { ...message, createdAt: new Date(message.createdAt) }];
        console.log('[ChatArea] Updated messages state:', newMessages);
        return newMessages;
      });
    });

    connection.on('MessageRead', (messageId: number) => {
      console.log('[ChatArea] Message read:', messageId);
      setMessages(prev =>
        prev.map(msg => (msg.messageId === messageId ? { ...msg, isRead: true } : msg))
      );
    });

    connection.on('TypingIndicator', (userId: number, typing: boolean) => {
      console.log('[ChatArea] Typing indicator:', { userId, typing });
      setIsTyping(typing && userId !== user?.userId);
    });

    return () => {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        console.log('[ChatArea] Leaving conversation:', convId);
        connection.invoke('LeaveConversation', convId).catch(err =>
          console.error('[ChatArea] LeaveConversation Error:', err)
        );
        connection.off('ReceiveMessage');
        connection.off('MessageRead');
        connection.off('TypingIndicator');
        isConversationInitialized.current.delete(convId);
      }
    };
  }, [selectedConversation, connection, isLoggedIn, user]);

  // Scroll đến tin nhắn mới nhất
  useEffect(() => {
    console.log('[ChatArea] Scrolling to latest message');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage || !selectedConversation || !connection || !isLoggedIn || !user) {
      console.log('[ChatArea] Cannot send message:', {
        newMessage: !!newMessage,
        selectedConversation: !!selectedConversation,
        connection: !!connection,
        isLoggedIn,
        user: !!user,
      });
      return;
    }

    // Khai báo tempMessage ở phạm vi ngoài try...catch
    const tempMessage: Message = {
      messageId: Date.now(), // ID tạm thời
      conversationId: parseInt(selectedConversation.id),
      senderId: user.userId,
      content: newMessage,
      createdAt: new Date(),
      isRead: false,
    };

    try {
      console.log('[ChatArea] Sending message to conversation:', selectedConversation.id);
      // Thêm tin nhắn tạm thời vào state
      setMessages(prev => [...prev, tempMessage]);
      await connection.invoke('SendMessage', parseInt(selectedConversation.id), newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('[ChatArea] Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
      // Xóa tin nhắn tạm thời nếu gửi thất bại
      setMessages(prev => prev.filter(msg => msg.messageId !== tempMessage.messageId));
    }
  };

  // Xử lý typing với debounce
  const debouncedTyping = useCallback(
    debounce(async (convId: number, isTyping: boolean) => {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        try {
          console.log('[ChatArea] Sending typing indicator for conversation:', convId);
          await connection.invoke('Typing', convId, isTyping);
        } catch (error) {
          console.error('[ChatArea] Typing Error:', error);
        }
      }
    }, 500),
    [connection]
  );

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (selectedConversation) {
      debouncedTyping(parseInt(selectedConversation.id), e.target.value.length > 0);
    }
  };

  if (!selectedConversation) {
    return (
      <div id="chatArea" className="flex-1 flex flex-col bg-background justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-600">Chào mừng đến với chat</h2>
      </div>
    );
  }

  return (
    <div id="chatArea" className="flex-1 flex flex-col bg-background">
      <div className="chat-header p-4 bg-sidebar flex items-center gap-3">
        <div className="chat-avatar">
          <img
            alt="Avatar"
            src="https://s120-ava-talk.zadn.vn/2/0/3/8/3/120/122e957f96878f6a59f77aec2f6b7c09.jpg"
            className="avatar-img"
          />
          <div className="chat-status online"></div>
        </div>
        <div className="chat-info">
          <div className="chat-name">{selectedConversation.name}</div>
          <div className="chat-status-text">{selectedConversation.online ? 'Online' : 'Offline'}</div>
        </div>
      </div>
      <div className="chat-messages flex-1 p-6 overflow-y-auto flex flex-col">
        {messages.map((msg) => (
          <div key={msg.messageId} className={`message ${msg.senderId === user?.userId ? 'sent' : 'received'}`}>
            <div>{msg.content}</div>
            <div className="text-xs text-gray-500">
              {msg.createdAt.toLocaleTimeString('vi-VN')} {msg.isRead ? '(Đã đọc)' : ''}
            </div>
          </div>
        ))}
        {messages.length === 0 && <div className="text-center text-gray-500">Chưa có tin nhắn</div>}
        {isTyping && <div className="typing-indicator">Đang nhập...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="message-input p-4 bg-sidebar border-t border-gray-200 flex items-center gap-3">
        <button className="input-btn">
          <FaPaperclip />
        </button>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          className="flex-1 text-main"
          value={newMessage}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button className="input-btn">
          <FaSmile />
        </button>
        <button className="input-btn send" onClick={handleSendMessage}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}