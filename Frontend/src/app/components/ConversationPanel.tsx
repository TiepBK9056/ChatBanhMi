"use client";
import { FaSearch, FaUserPlus, FaUserFriends } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import AddFriendModal from './AddFriendModal';

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
  time: string; // Chuỗi ISO 8601
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
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  const fetchConversations = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }
      const response = await axios.get<ConversationApiResponse[]>('http://localhost:5130/api/conversations/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const fetchedConversations: Conversation[] = response.data.map((conv: ConversationApiResponse) => ({
        id: conv.conversationId.toString(),
        name: conv.name,
        preview: conv.preview,
        time: new Date(conv.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        unread: conv.unreadCount,
        online: false,
        avatarUrl: conv.avatarUrl ?? 'https://s120-ava-talk.zadn.vn/2/0/3/8/3/120/122e957f96878f6a59f77aec2f6b7c09.jpg',
      }));
      setConversations(fetchedConversations.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.push('/auth/login');
      return;
    }
    fetchConversations();
  }, [isLoggedIn, user, router]);

  const filteredConversations = selectedTab === 'Tất cả'
    ? conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleAddFriend = async (friendId: number) => {
    if (!isLoggedIn || !user) {
      router.push('/auth/login');
      return;
    }
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }
      await axios.post(
        'http://localhost:5130/api/contacts',
        { userId: user.userId, friendId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert('Yêu cầu kết bạn đã được gửi!');
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  };

  const handleCreateGroup = async () => {
    if (!isLoggedIn || !user) {
      router.push('/auth/login');
      return;
    }
    const groupName = prompt('Nhập tên nhóm:');
    const participantIdsInput = prompt('Nhập danh sách userId (cách nhau bởi dấu phẩy):');
    if (!groupName || !participantIdsInput) return;
    const participantIds = participantIdsInput.split(',').map(Number).filter(id => !isNaN(id));
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }
      await axios.post(
        'http://localhost:5130/api/conversations',
        { conversationName: groupName, isGroup: true, participantIds: [...participantIds, user.userId] },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert('Nhóm đã được tạo!');
      await fetchConversations();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleStartChat = async (convId: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }
      // Fetch the updated conversation list
      await fetchConversations();
      // Select the new conversation
      const selectedConv = conversations.find((conv) => conv.id === convId.toString());
      if (selectedConv) {
        setSelectedConversationId(convId.toString());
        onSelectConversation(selectedConv);
      } else {
        // If the conversation is not in the list yet, fetch it explicitly
        const response = await axios.get<ConversationApiResponse>(`http://localhost:5130/api/conversations/${convId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const newConv: Conversation = {
          id: response.data.conversationId.toString(),
          name: response.data.name,
          preview: response.data.preview,
          time: new Date(response.data.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          unread: response.data.unreadCount,
          online: false,
          avatarUrl: response.data.avatarUrl ?? 'https://s120-ava-talk.zadn.vn/2/0/3/8/3/120/122e957f96878f6a59f77aec2f6b7c09.jpg',
        };
        setConversations([...conversations, newConv].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
        setSelectedConversationId(convId.toString());
        onSelectConversation(newConv);
      }
    } catch {
      
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
        <button
          className="input-btn"
          title="Thêm bạn"
          onClick={() => setIsAddFriendModalOpen(true)}
        >
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
      <div className="conv-list flex-1 overflow-y-auto">
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
      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        onAddFriend={handleAddFriend}
        onStartChat={handleStartChat}
      />
    </div>
  );
}