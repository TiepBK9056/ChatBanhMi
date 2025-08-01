"use client";

import { FaComment, FaAddressBook, FaUsers, FaCog, FaMoon } from 'react-icons/fa';
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext'; 

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useAuth(); // Sử dụng useAuth để lấy hàm logout

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLogout = async () => {
    await logout(); // Gọi hàm logout từ AuthContext
    closeModal(); // Đóng modal sau khi đăng xuất
  };

  return (
    <nav id="sidebarNav" className="flex flex-col bg-sidebar transition-all duration-300 relative" style={{background: "#015ae0"}}>
      <div className="flex flex-col items-center p-6">
        <div className="zavatar-container cursor-pointer" title="Nguyễn Ngọc Tiệp" style={{border: "1px solid #fff"}}>
          <img
            alt="User Avatar"
            src="https://s120-ava-talk.zadn.vn/2/0/3/8/3/120/122e957f96878f6a59f77aec2f6b7c09.jpg"
            className="zavatar"
          />
        </div>
      </div>
      <div className="nav-tabs flex-1 flex flex-col justify-between" style={{padding: "10px 0px 50px 0px"}}>
        <div className="nav-tabs-top">
          <div className="group">
            <div className="sidebar-tab selected  flex items-center p-2  transition duration-200">
              <FaComment className="text-xl" style={{color: '#fff'}}/>
              <span className="tab-title ml-2" style={{color: '#fff'}}>Chat</span>
            </div>
          </div>
          <div className="group">
            <div className="sidebar-tab flex items-center p-2  transition duration-200">
              <FaAddressBook className="text-xl" style={{color: '#fff'}} />
              <span className="tab-title ml-2" style={{color: '#fff'}}>Danh bạ</span>
            </div>
          </div>
          <div className="group">
            <div className="sidebar-tab flex items-center p-2  transition duration-200">
              <FaUsers className="text-xl" style={{color: '#fff'}} />
              <span className="tab-title ml-2" style={{color: '#fff'}}>Nhóm</span>
            </div>
          </div>
        </div>
        <div className="nav-tabs-bottom pb-10 relative">
          <div className="group">
            <div className="sidebar-tab flex items-center p-2  transition duration-200" onClick={openModal}>
              <FaCog className="text-xl" style={{color: '#fff'}} />
              <span className="tab-title ml-2" style={{color: '#fff'}}>Cài đặt</span>
            </div>
          </div>
          <div className="group">
            <div className="sidebar-tab theme-toggle flex items-center p-2  transition duration-200">
              <FaMoon className="text-xl" style={{color: '#fff'}} />
              <span className="tab-title ml-2" style={{color: '#fff'}}>Theme</span>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-start z-50" style={{ paddingLeft: '50px', marginTop: '632px' }} onClick={closeModal}>
          <div className="bg-white rounded-lg w-55 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col space-y-2" style={{border: '1px solid #ccc', borderRadius: '10px'}}>
              <div className="flex items-center cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition duration-200" onClick={closeModal}>
                <span className="ml-2">Thông tin tài khoản</span>
              </div>
              <hr className="border-t border-gray-300" />
              <div className="flex items-center cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition duration-200" onClick={closeModal}>
                <span className="ml-2">Cài đặt</span>
              </div>
              <hr className="border-t border-gray-300" />
              <div className="flex items-center cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition duration-200" onClick={closeModal}>
                <span className="ml-2">Dữ liệu</span>
              </div>
              <hr className="border-t border-gray-300" />
              <div className="flex items-center cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition duration-200" onClick={closeModal}>
                <span className="ml-2">Ngôn ngữ</span>
              </div>
              <hr className="border-t border-gray-300" />
              <div className="flex items-center cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition duration-200" onClick={closeModal}>
                <span className="ml-2">Hỗ trợ</span>
              </div>
              <hr className="border-t border-gray-300" />
              <div className="flex items-center cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition duration-200 text-red-500" onClick={handleLogout}>
                <span className="ml-2">Đăng xuất</span>
              </div>
              <div className="flex items-center cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition duration-200" onClick={closeModal}>
                <span className="ml-2">Thoát</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}