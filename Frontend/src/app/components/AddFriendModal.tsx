"use client";
import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface UserSearchResult {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
  friendshipStatus: 'accepted' | 'pending' | 'none';
}

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (friendId: number) => Promise<void>;
}

export default function AddFriendModal({ isOpen, onClose, onAddFriend }: AddFriendModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setPhoneNumber('');
      setSearchResults([]);
      setError(null);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!isLoggedIn || !user) {
      toast.error('Vui lòng đăng nhập để tìm kiếm');
      setError('Vui lòng đăng nhập để tìm kiếm');
      return;
    }
    if (!phoneNumber) {
      toast.error('Vui lòng nhập số điện thoại');
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }
      const response = await axios.get<UserSearchResult[]>('http://localhost:5130/api/users/search', {
        params: { phoneNumber },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const filteredResults = response.data.filter((result) => result.id !== user.userId);
      if (filteredResults.length === 0) {
        toast.error('Số điện thoại không tồn tại');
        setError('Số điện thoại không tồn tại');
      } else {
        setSearchResults(filteredResults);
        setError(null);
      }
    } catch {
      const errorMessage = 'Không tìm thấy người dùng hoặc có lỗi xảy ra';
      toast.error(errorMessage);
      setError(errorMessage);
      setSearchResults([]);
    }
  };

  const handleAddFriendClick = async (friendId: number) => {
    try {
      await onAddFriend(friendId);
      toast.success('Yêu cầu kết bạn đã được gửi!', {
        style: {
          border: '1px solid #10B981',
          padding: '16px',
          color: '#10B981',
          background: '#D1FAE5',
        },
        iconTheme: {
          primary: '#10B981',
          secondary: '#FFFFFF',
        },
      });
      onClose();
    } catch  {
      const errorMessage = 'Không thể gửi yêu cầu kết bạn';
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: "rgba(100, 100, 100, 0.5)" }}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-90 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Thêm bạn</h2>
        <hr className="border-t border-gray-300 mb-4" />
        <div className="mb-4">
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Số điện thoại"
            className="w-full p-2 border rounded"
            style={{border: "1px solid rgb(141 139 154)"}}
          />
        </div>
        {error && (
          <p className="text-red-500 mb-4 text-center">{error}</p>
        )}
        {searchResults.length > 0 && (
          <div className="max-h-60 overflow-y-auto mb-4">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-2"
              >
                <div className="flex items-center">
                  <img
                    src={result.avatarUrl || 'https://s120-ava-talk.zadn.vn/2/0/3/8/3/120/122e957f96878f6a59f77aec2f6b7c09.jpg'}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <div>
                    <p className="font-semibold">{result.name}</p>
                    <p className="text-sm text-gray-500">{result.phoneNumber}</p>
                  </div>
                </div>
                {result.friendshipStatus === 'accepted' ? (
                  <p className="text-sm text-gray-500">Đã là bạn bè</p>
                ) : result.friendshipStatus === 'pending' ? (
                  <p className="text-sm text-blue-500">Đang chờ đồng ý</p>
                ) : (
                  <button
                    onClick={() => handleAddFriendClick(result.id)}
                    className="p-2 bg-green-500 text-white rounded"
                  >
                    Kết bạn
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-auto">
            <hr className="border-t border-gray-300 mb-4" />
            <div className="flex justify-end gap-2">
                <button
                onClick={onClose}
                className="w-20 p-2 text-black rounded"
                style={{ backgroundColor: "rgba(100, 100, 100, 0.5)" }}
                >
                Hủy
                </button>
                <button
                onClick={handleSearch}
                className="w-20 p-2 bg-primary text-white rounded"
                style={{ background: "#0068ff", minWidth: "100px"}}
                >
                Tìm kiếm
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}