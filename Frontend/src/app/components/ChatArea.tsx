"use client";
import { FaPaperclip, FaSmile, FaPaperPlane } from 'react-icons/fa';

// Định nghĩa kiểu cho Message
type Message = {
  id: string;
  text: string;
  type: 'sent' | 'received';
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
  // Dữ liệu tin nhắn giả lập cho từng người dùng
  const messageData: Record<string, Message[]> = {
    conv1: [
      { id: '1', text: 'Hôm nay đi chơi hồng tỷ không?', type: 'received' },
      { id: '2', text: 'OK, 3h chiều nhé!', type: 'sent' },
      { id: '3', text: 'Tuyệt, hẹn gặp ở quán quen!', type: 'received' },
      { id: '4', text: '👍', type: 'sent' },
      { id: '5', text: 'oke em thắng', type: 'received' },
      { id: '6', text: 'Đêm qua em tuyệt quá thắng ơi', type: 'sent' },
    ],
    conv2: [
      { id: '1', text: 'Chào bạn, lâu rồi không chat!', type: 'received' },
      { id: '2', text: 'Ừ, bận quá! Hôm nào gặp nhé?', type: 'sent' },
    ],
    conv3: [
      { id: '1', text: 'Bạn ơi, tối nay rảnh không?', type: 'received' },
      { id: '2', text: 'Rảnh, đi ăn nhé?', type: 'sent' },
      { id: '3', text: 'OK, 7h tối nha!', type: 'received' },
    ],
  };

  const messages = selectedConversation ? messageData[selectedConversation.id] || [] : [];

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
          <div className="chat-name">{selectedConversation?.name || 'Chọn một cuộc trò chuyện'}</div>
          <div className="chat-status-text">{selectedConversation?.online ? 'Online' : 'Offline'}</div>
        </div>
      </div>
      <div className="chat-messages flex-1 p-6 overflow-y-auto flex flex-col">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.type}`}>
            {msg.text}
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
