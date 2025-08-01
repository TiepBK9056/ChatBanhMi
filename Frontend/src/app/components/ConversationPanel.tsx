import { FaSearch, FaUserPlus, FaUserFriends } from 'react-icons/fa';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import AddFriendModal from './AddFriendModal';
import CreateGroupModal from './CreateGroupModal'; // Import modal tạo nhóm
import toast from 'react-hot-toast';
import { initializeSignalRConnection, getSignalRConnection } from '../service/signalRService';

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
  time: string;
  unreadCount: number;
  avatarUrl?: string;
}

interface Message {
  messageId: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: Date;
  isRead: boolean;
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
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false); // State cho modal tạo nhóm
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  // Hàm fetchConversations
  const fetchConversations = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No access token found');

      console.log('[ConversationPanel] Fetching conversations for user:', user?.userId);
      const response = await axios.get<ConversationApiResponse[]>('http://localhost:5130/api/conversations/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log('[ConversationPanel] API response:', response.data);
      const fetchedConversations: Conversation[] = response.data.map((conv: ConversationApiResponse) => ({
        id: conv.conversationId.toString(),
        name: conv.name,
        preview: conv.preview || 'No messages yet',
        time: new Date(conv.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        unread: conv.unreadCount || 0,
        online: false,
        avatarUrl: conv.avatarUrl ?? 'https://s120-ava-talk.zadn.vn/2/0/3/8/3/120/122e957f96878f6a59f77aec2f6b7c09.jpg',
      }));

      console.log('[ConversationPanel] Conversations fetched:', fetchedConversations);
      setConversations(fetchedConversations.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      console.error('[ConversationPanel] Error fetching conversations:', errorMessage);
      toast.error(`Không thể tải danh sách hội thoại: ${errorMessage}`);
    }
  }, [user]);

  // Kết nối SignalR và xử lý conversations
  useEffect(() => {
    console.log('[ConversationPanel] Auth state:', { isLoggedIn, user });
    if (!isLoggedIn || !user) {
      console.log('[ConversationPanel] User not logged in or user data missing');
      router.push('/auth/login');
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    console.log('[ConversationPanel] Access token:', accessToken?.substring(0, 10) + '...');
    if (!accessToken) {
      console.log('[ConversationPanel] No access token found in localStorage');
      toast.error('Chưa đăng nhập');
      router.push('/auth/login');
      return;
    }

    // Gọi fetchConversations ngay lập tức
    fetchConversations();

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

    const conn = getSignalRConnection();
    if (conn) {
      conn.on('ReceiveMessage', (message: Message) => {
        console.log('[ConversationPanel] Received message:', message);
        setConversations(prev =>
          prev.map(conv =>
            conv.id === message.conversationId.toString()
              ? {
                  ...conv,
                  preview: message.content,
                  time: new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  unread: message.senderId !== user?.userId && conv.id !== selectedConversationId ? conv.unread + 1 : conv.unread
                }
              : conv
          ).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        );
      });

      conn.on('MessageRead', () => {
        console.log('[ConversationPanel] Message read event received');
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversationId ? { ...conv, unread: 0 } : conv
          )
        );
      });
    }

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, user, router, fetchConversations]);

  // Tham gia conversations khi có danh sách conversations
  useEffect(() => {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected || !conversations.length) {
      console.log('[ConversationPanel] Skipping join conversations:', {
        connection: !!connection,
        connectionState: connection?.state,
        conversationsLength: conversations.length,
      });
      return;
    }

    const joinConversations = async () => {
      for (const conv of conversations) {
        try {
          console.log('[ConversationPanel] Joining conversation:', conv.id);
          await connection.invoke('JoinConversation', parseInt(conv.id));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
          console.error('[ConversationPanel] JoinConversation Error:', errorMessage);
        }
      }
    };

    joinConversations();
  }, [connection, conversations]);

  const filteredConversations = selectedTab === 'Tất cả'
    ? conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations.filter((conv) => conv.unread > 0);

  const handleSelectConversation = (convId: string) => {
    console.log('[ConversationPanel] Selecting conversation:', convId);
    setSelectedConversationId(convId);
    const selectedConv = conversations.find((conv) => conv.id === convId);
    if (selectedConv) {
      setConversations(prev =>
        prev.map(conv => (conv.id === convId ? { ...conv, unread: 0 } : conv))
      );
      onSelectConversation(selectedConv);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[ConversationPanel] Search query:', e.target.value);
    setSearchQuery(e.target.value);
  };

  const handleAddFriend = async (friendId: number) => {
    if (!isLoggedIn || !user) {
      console.log('[ConversationPanel] Cannot add friend: User not logged in');
      router.push('/auth/login');
      return;
    }
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No access token found');

      console.log('[ConversationPanel] Adding friend:', friendId);
      await axios.post(
        'http://localhost:5130/api/contacts',
        { userId: user.userId, friendId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success('Yêu cầu kết bạn đã được gửi!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      console.error('[ConversationPanel] Error adding friend:', errorMessage);
      toast.error('Không thể gửi yêu cầu kết bạn');
    }
  };

  const handleStartChat = async (convId: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('No access token found');

      console.log('[ConversationPanel] Starting chat for conversation:', convId);
      await fetchConversations();
      const selectedConv = conversations.find((conv) => conv.id === convId.toString());
      if (selectedConv) {
        setSelectedConversationId(convId.toString());
        onSelectConversation(selectedConv);
      } else {
        console.log('[ConversationPanel] Fetching conversation details:', convId);
        const response = await axios.get<ConversationApiResponse>(`http://localhost:5130/api/conversations/${convId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const newConv: Conversation = {
          id: response.data.conversationId.toString(),
          name: response.data.name,
          preview: response.data.preview || 'No messages yet',
          time: new Date(response.data.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          unread: response.data.unreadCount || 0,
          online: false,
          avatarUrl: response.data.avatarUrl ?? 'https://s120-ava-talk.zadn.vn/2/0/3/8/3/120/122e957f96878f6a59f77aec2f6b7c09.jpg',
        };
        console.log('[ConversationPanel] New conversation added:', newConv);
        setConversations([...conversations, newConv].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
        setSelectedConversationId(convId.toString());
        onSelectConversation(newConv);
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
          console.log('[ConversationPanel] Joining new conversation:', convId);
          connection.invoke('JoinConversation', convId).catch(err => {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
            console.error('[ConversationPanel] JoinConversation Error:', errorMessage);
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      console.error('[ConversationPanel] Error handling start chat:', errorMessage);
      toast.error('Không thể chọn cuộc hội thoại');
    }
  };

  console.log('[ConversationPanel] Rendering conversations:', conversations);

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
        <button
          className="input-btn"
          title="Tạo nhóm"
          onClick={() => setIsCreateGroupModalOpen(true)} // Mở modal tạo nhóm
        >
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
        {filteredConversations.length === 0 ? (
          <div className="text-center text-gray-500">Không có cuộc hội thoại nào</div>
        ) : (
          filteredConversations.map((conv) => (
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
          ))
        )}
      </div>
      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        onAddFriend={handleAddFriend}
        onStartChat={handleStartChat}
      />
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)} 
        onCreateGroup={async (groupName: string, selectedMemberIds: number[]) => {
          if (!isLoggedIn || !user) {
            console.log('[ConversationPanel] Cannot create group: User not logged in');
            router.push('/auth/login');
            return;
          }
          try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error('No access token found');

            console.log('[ConversationPanel] Creating group:', { groupName, selectedMemberIds });
            await axios.post(
              'http://localhost:5130/api/conversations',
              { conversationName: groupName, isGroup: true, participantIds: [...selectedMemberIds, user.userId] },
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            await fetchConversations();
            toast.success('Nhóm đã được tạo!');
            setIsCreateGroupModalOpen(false); // Đóng modal sau khi tạo thành công
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
            console.error('[ConversationPanel] Error creating group:', errorMessage);
            toast.error('Không thể tạo nhóm');
          }
        }} // Callback để xử lý tạo nhóm
      />
    </div>
  );
}