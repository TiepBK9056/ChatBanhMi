// ClientApp/app/components/ConversationPanel.tsx
"use client";
import { FaSearch, FaUserPlus, FaUserFriends } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Conversation {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
  avatarUrl?: string;
}

interface ConversationApiResponse {
  conversationId: number;
  name: string;
  isGroup: boolean;
  preview: string;
  time: string; // Hoặc Date nếu backend trả về định dạng ISO
  unreadCount: number;
  avatarUrl?: string;
}

interface ConversationPanelProps {
  onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationPanel({ onSelectConversation }: ConversationPanelProps) {
  const [selectedTab, setSelectedTab] = useState<'Tất cả' | 'Chưa đọc'>('Tất cả');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = localStorage.getItem('userId') ?? '1';

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get<ConversationApiResponse[]>('http://localhost:5130/api/conversations', {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        });
        const fetchedConversations: Conversation[] = response.data.map((conv: ConversationApiResponse) => ({
          id: conv.conversationId.toString(),
          name: conv.name,
          preview: conv.preview,
          time: new Date(conv.time).toLocaleTimeString('vi-VN'),
          unread: conv.unreadCount,
          online: false, // Sẽ xử lý bằng SignalR sau
          avatarUrl: conv.avatarUrl ?? 'https://s120-ava-talk.zadn.vn/2/0/3/8/3/120/122e957f96878f6a59f77aec2f6b7c09.jpg',
        }));
        setConversations(fetchedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = selectedTab === 'Tất cả'
    ? conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations.filter((conv) => conv.unread > 0);

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    const selectedConv = conversations.find((conv) => conv.id === convId);
    if (selectedConv) {
      onSelectConversation(selectedConv);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddFriend = async () => {
    const friendId = prompt('Nhập ID người dùng để thêm bạn');
    if (!friendId) return;
    try {
      await axios.post(
        'http://localhost:5130/api/contacts',
        { userId, friendId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
      );
      alert('Yêu cầu kết bạn đã được gửi!');
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const handleCreateGroup = async () => {
    const groupName = prompt('Nhập tên nhóm:');
    const participantIdsInput = prompt('Nhập danh sách userId (cách nhau bởi dấu phẩy):');
    if (!groupName || !participantIdsInput) return;
    const participantIds = participantIdsInput.split(',').map(Number).filter(id => !isNaN(id));
    try {
      await axios.post(
        'http://localhost:5130/api/conversations',
        { conversationName: groupName, isGroup: true, participantIds },
        { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
      );
      alert('Nhóm đã được tạo!');
      const response = await axios.get<ConversationApiResponse[]>('http://localhost:5130/api/conversations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
      });
      setConversations(response.data.map((conv: ConversationApiResponse) => ({
        id: conv.conversationId.toString(),
        name: conv.name,
        preview: conv.preview,
        time: new Date(conv.time).toLocaleTimeString('vi-VN'),
        unread: conv.unreadCount,
        online: false,
        avatarUrl: conv.avatarUrl ?? 'https://s120-ava-talk.zadn.vn/2/0/3/8/3/120/122e957f96878f6a59f77aec2f6b7c09.jpg',
      })));
    } catch (error) {
      console.error('Error creating group:', error);
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
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <button className="input-btn" title="Thêm bạn" onClick={handleAddFriend}>
          <FaUserPlus />
        </button>
        <button className="input-btn" title="Tạo nhóm" onClick={handleCreateGroup}>
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
                src={conv.avatarUrl}
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