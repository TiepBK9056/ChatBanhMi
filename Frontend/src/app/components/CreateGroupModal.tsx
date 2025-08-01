"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaTimes, FaCamera, FaSearch } from "react-icons/fa";

// Định nghĩa kiểu props
interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string, selectedMemberIds: number[]) => Promise<void>;
}

export default function CreateGroupModal({ isOpen, onClose, onCreateGroup }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  const handleCreateGroup = async () => {
    if (!groupName || selectedMembers.length < 1) {
      toast.error("Vui lòng nhập tên nhóm và chọn ít nhất một thành viên!");
      return;
    }
    try {
      await onCreateGroup(groupName, selectedMembers); // Gọi callback từ parent
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error);
      toast.error("Không thể tạo nhóm!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: "rgba(100, 100, 100, 0.5)" }}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-[450px] relative"> {/* Tăng chiều rộng lên 450px */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Tạo nhóm</h2>
        <hr className="border-t border-gray-300 mb-4" />

        {/* Cột icon máy ảnh và ô nhập tên nhóm */}
        <div className="mb-4 flex items-center">
          <div className="mr-4">
            <FaCamera className="text-gray-400 cursor-pointer hover:text-gray-600" size={24} />
          </div>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Nhập tên nhóm..."
            className="w-full p-2 border-b border-gray-300 focus:outline-none"
          />
        </div>

        {/* Ô tìm kiếm với icon bên trong, bo góc nhiều hơn */}
        <div className="mb-4 relative">
          <FaSearch className="absolute ml-5 transform -translate-x-1/2 top-1/2 -translate-y-1/2 text-gray-400" /> {/* Icon nằm giữa */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
            className="w-full p-2 pl-10 pr-10 border border-gray-300 focus:outline-none" 
            style={{borderRadius: '999px'}}
          />
        </div>

        {/* Nút lọc */}
        <div className="mb-4 flex">
          <button className="px-4 py-1 mr-3 bg-blue-500 text-white rounded">Tất cả</button>
          <button className="px-4 py-1 mr-3 text-gray-700 rounded" style={{ background: '#ccc' }}>Bạn bè</button>
          <button className="px-4 py-1 mr-3 text-gray-700 rounded" style={{ background: '#ccc' }}>Gia đình</button>
        </div>

        <hr className="border-t border-gray-300 mb-4" />

        {/* Trò chuyện gần đây */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Trò chuyện gần đây</h3>
          <div className="max-h-40 overflow-y-auto">
            {[
              { id: 1, name: "Nguyễn Hồng Phong", avatar: "https://via.placeholder.com/40" },
              { id: 2, name: "Mỹ Duyên", avatar: "https://via.placeholder.com/40" },
              { id: 3, name: "Điểm", avatar: "https://via.placeholder.com/40" },
              { id: 4, name: "Khoan", avatar: "https://via.placeholder.com/40" },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedMembers((prev) =>
                    prev.includes(item.id)
                      ? prev.filter((id) => id !== item.id)
                      : [...prev, item.id]
                  );
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(item.id)}
                  onChange={() => {}}
                  className="mr-2"
                />
                <img src={item.avatar} alt="Avatar" className="w-8 h-8 rounded-full mr-2" />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-t border-gray-300 mb-4" />

        {/* Nút Huỷ và Tạo nhóm */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="w-20 p-2 text-black rounded"
            style={{ backgroundColor: "rgba(100, 100, 100, 0.5)" }}
          >
            Huỷ
          </button>
          <button
            onClick={handleCreateGroup}
            className="w-20 p-2 bg-blue-500 text-white rounded"
            style={{ background: "#0068ff", minWidth: "100px" }}
          >
            Tạo nhóm
          </button>
        </div>
      </div>
    </div>
  );
}