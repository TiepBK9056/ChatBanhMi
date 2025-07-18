import { FaComment, FaAddressBook, FaUsers, FaCog, FaMoon } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <nav id="sidebarNav" className="flex flex-col bg-sidebar transition-all duration-300">
      <div className="flex flex-col items-center p-4">
        <div className="zavatar-container cursor-pointer" title="Nguyễn Ngọc Tiệp">
          <img
            alt="User Avatar"
            src="https://s120-ava-talk.zadn.vn/2/0/3/8/3/120/122e957f96878f6a59f77aec2f6b7c09.jpg"
            className="zavatar"
          />
        </div>
      </div>
      <div className="nav-tabs flex-1 flex flex-col justify-between" style={{padding: "10px 0px 50px 0px"}}>
        <div className="nav-tabs-top">
          <div className="sidebar-tab selected">
            <FaComment className="text-xl text-primary" />
            <span className="tab-title">Chat</span>
          </div>
          <div className="sidebar-tab">
            <FaAddressBook className="text-xl text-primary" />
            <span className="tab-title">Danh bạ</span>
          </div>
          <div className="sidebar-tab">
            <FaUsers className="text-xl text-primary" />
            <span className="tab-title">Nhóm</span>
          </div>
        </div>
        <div className="nav-tabs-bottom pb-10">
          <div className="sidebar-tab">
            <FaCog className="text-xl text-primary" />
            <span className="tab-title">Cài đặt</span>
          </div>
          <div className="sidebar-tab theme-toggle">
            <FaMoon className="text-xl text-primary" />
            <span className="tab-title">Theme</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
