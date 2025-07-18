"use client";
import { FaSearch, FaUserPlus, FaUserFriends } from 'react-icons/fa';
import { useState } from 'react';

// Định nghĩa kiểu cho Conversation
type Conversation = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
};

// Định nghĩa kiểu cho props
type ConversationPanelProps = {
  onSelectConversation: (conversation: Conversation) => void;
};

export default function ConversationPanel({ onSelectConversation }: ConversationPanelProps) {
  const [selectedTab, setSelectedTab] = useState('Tất cả');
  const [selectedConversationId, setSelectedConversationId] = useState('conv1');

  const conversations: Conversation[] = [
    {
      id: 'conv1',
      name: 'Nguyễn Văn A',
      preview: 'Hôm nay đi cafe không?',
      time: '10:30',
      unread: 3,
      online: true,
    },
    {
      id: 'conv2',
      name: 'Cloud của tôi',
      preview: 'Chưa có tin nhắn',
      time: 'Hôm qua',
      unread: 0,
      online: false,
    },
    {
      id: 'conv3',
      name: 'Trần Văn B',
      preview: 'Đã xem',
      time: '09:00',
      unread: 1,
      online: true,
    },
  ];

  const filteredConversations = selectedTab === 'Tất cả'
    ? conversations
    : conversations.filter(conv => conv.unread > 0);

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    const selectedConv = conversations.find(conv => conv.id === convId);
    if (selectedConv) {
      onSelectConversation(selectedConv);
    }
  };

  return (
    <div id="convPanel" className="flex flex-col bg-sidebar transition-all duration-300">
      <div id="contact-search" className="p-4 flex items-center gap-2">
        <div className="group-search flex-1">
          <FaSearch className="search-icon" />
          <input
            id="contact-search-input"
            type="text"
            placeholder="Tìm kiếm bạn bè, nhóm..."
            className="text-main"
          />
        </div>
        <button className="input-btn" title="Thêm bạn">
          <FaUserPlus />
        </button>
        <button className="input-btn" title="Tạo nhóm">
          <FaUserFriends />
        </button>
      </div>
      <div className="filter-tabs pt-0 flex gap-4 relative">
        <span
          className={`filter-tab ${selectedTab === 'Tất cả' ? 'selected' : ''}`}
          onClick={() => setSelectedTab('Tất cả')}
        >
          Tất cả
        </span>
        <span
          className={`filter-tab ${selectedTab === 'Chưa đọc' ? 'selected' : ''}`}
          onClick={() => setSelectedTab('Chưa đọc')}
        >
          Chưa đọc
        </span>
      </div>
      <div className="divider"></div>
      <div className="conv-list flex-1 overflow-y-auto" key={selectedTab}>
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            className={`conv-item animate-fadeIn ${selectedConversationId === conv.id ? 'selected' : ''}`}
            data-id={conv.id}
            onClick={() => handleSelectConversation(conv.id)}
          >
            <div className="conv-avatar">
              <img
                alt="Avatar"
                src="https://s120-ava-talk.zadn.vn/2/0/3/8/3/120/122e957f96878f6a59f77aec2f6b7c09.jpg"
                className="avatar-img"
              />
              {conv.online && <div className="conv-status online"></div>}
            </div>
            <div className="conv-info">
              <div className="conv-name">{conv.name}</div>
              <div className="conv-preview">{conv.preview}</div>
            </div>
            <div className="conv-meta">
              <div className="conv-time">{conv.time}</div>
              {conv.unread > 0 && <div className="conv-badge">{conv.unread}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
