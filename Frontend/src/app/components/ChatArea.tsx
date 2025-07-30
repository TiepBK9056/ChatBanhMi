import { FaPaperclip, FaSmile, FaPaperPlane } from 'react-icons/fa';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import debounce from 'lodash/debounce';
import { initializeSignalRConnection} from '../service/signalRService';

interface Message {
  messageId: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: Date;
  isRead: boolean;
  isTemp?: boolean;
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

    let isMounted = true;

    const initConnection = async () => {
      try {
        const conn = await initializeSignalRConnection(accessToken);
        if (isMounted) {
          setConnection(conn);
        }
      } catch  {
        // Không cần toast ở đây vì signalRService đã xử lý
      }
    };

    initConnection();

    return () => {
      isMounted = false;
      // Không stop kết nối ở đây vì signalRService quản lý
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
          const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
          console.error('[ChatArea] SignalR MarkMessageAsRead Error:', errorMessage);
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
      toast.error('Không thể đánh dấu tin nhắn đã đọc');
    }
  }, [connection, user, messages]);

  // Xử lý khi chọn conversation
  useEffect(() => {
    if (!selectedConversation || !connection || !isLoggedIn || !user || connection.state !== signalR.HubConnectionState.Connected) {
      console.log('[ChatArea] Missing required data or connection not established:', {
        selectedConversation: !!selectedConversation,
        connection: !!connection,
        isLoggedIn,
        user: !!user,
        connectionState: connection?.state,
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

      try {
        await connection.invoke('JoinConversation', convId);
        console.log('[ChatArea] Joined conversation:', convId);
        isConversationInitialized.current.set(convId, true);
        await fetchMessages(convId);
        if (messages.some(m => !m.isRead && m.senderId !== user?.userId)) {
          await markMessagesAsRead(convId);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
        console.error('[ChatArea] JoinConversation Error:', errorMessage);
        toast.error('Không thể tham gia cuộc hội thoại');
      }
    };

    initializeConversation();

    console.log('[ChatArea] Registering ReceiveMessage event');
    connection.on('ReceiveMessage', (message: Message) => {
      console.log('[ChatArea] Received message:', message);
      setMessages(prev => {
        const tempIndex = prev.findIndex(
          msg => msg.isTemp && msg.senderId === message.senderId && msg.content === message.content && Math.abs(msg.createdAt.getTime() - new Date(message.createdAt).getTime()) < 1000
        );
        if (tempIndex !== -1) {
          const newMessages = [...prev];
          newMessages[tempIndex] = { ...message, createdAt: new Date(message.createdAt) };
          console.log('[ChatArea] Replaced temp message with server message:', newMessages);
          return newMessages;
        }
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
        connection.invoke('LeaveConversation', convId).catch(err => {
          const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
          console.error('[ChatArea] LeaveConversation Error:', errorMessage);
        });
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
    if (!newMessage || !selectedConversation || !connection || !isLoggedIn || !user || connection.state !== signalR.HubConnectionState.Connected) {
      console.log('[ChatArea] Cannot send message:', {
        newMessage: !!newMessage,
        selectedConversation: !!selectedConversation,
        connection: !!connection,
        isLoggedIn,
        user: !!user,
        connectionState: connection?.state,
      });
      return;
    }

    const tempMessage: Message = {
      messageId: Date.now(),
      conversationId: parseInt(selectedConversation.id),
      senderId: user.userId,
      content: newMessage,
      createdAt: new Date(),
      isRead: false,
      isTemp: true,
    };

    try {
      console.log('[ChatArea] Sending message to conversation:', selectedConversation.id);
      setMessages(prev => [...prev, tempMessage]);
      await connection.invoke('SendMessage', parseInt(selectedConversation.id), newMessage);
      setNewMessage('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      console.error('[ChatArea] Error sending message:', errorMessage);
      toast.error('Không thể gửi tin nhắn');
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
          const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
          console.error('[ChatArea] Typing Error:', errorMessage);
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

  console.log('[ChatArea] Rendering messages:', messages);

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
              {msg.createdAt.toLocaleTimeString('vi-VN')} {msg.isRead ? '(Đã đọc)' : ''} {msg.isTemp ? '(Tạm thời)' : ''}
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