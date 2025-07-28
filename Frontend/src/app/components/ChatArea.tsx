"use client";
import { FaPaperclip, FaSmile, FaPaperPlane } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Định nghĩa kiểu cho Message (cập nhật để khớp với response từ API)
type Message = {
  messageId: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
};

// Định nghĩa kiểu cho Conversation
type Conversation = {
  id: string;
  name: string;
  online: boolean;
};

// Định nghĩa kiểu cho props
type ChatAreaProps = {
  selectedConversation: Conversation | null;
};

export default function ChatArea({ selectedConversation }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      // Chỉ gọi API nếu selectedConversation tồn tại và id là số hợp lệ
      if (!selectedConversation || isNaN(parseInt(selectedConversation.id))) {
        setMessages([]);
        return;
      }

      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('No access token found');
        }

        const response = await axios.get<Message[]>(
          `http://localhost:5130/api/Messages?conversationId=${parseInt(selectedConversation.id)}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  // Nếu chưa chọn cuộc trò chuyện, hiển thị thông điệp chào mừng ở trung tâm
  if (!selectedConversation) {
    return (
      <div id="chatArea" className="flex-1 flex flex-col bg-background justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-600">Chào mừng đến với chat</h2>
      </div>
    );
  }

  // Nếu đã chọn cuộc trò chuyện, hiển thị giao diện hiện tại
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
          <div key={msg.messageId} className={`message ${msg.senderId === 8 ? 'sent' : 'received'}`}>
            {msg.content}
          </div>
        ))}
        {messages.length === 0 && <div className="text-center text-gray-500">Chưa có tin nhắn</div>}
        <div className="typing-indicator">Đang nhập...</div>
      </div>
      <div className="message-input p-4 bg-sidebar border-t border-gray-200 flex items-center gap-3">
        <button className="input-btn">
          <FaPaperclip />
        </button>
        <input type="text" placeholder="Nhập tin nhắn..." className="flex-1 text-main" />
        <button className="input-btn">
          <FaSmile />
        </button>
        <button className="input-btn send">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}