"use client";
import Sidebar from '@/app/components/Sidebar';
import ConversationPanel from '@/app/components/ConversationPanel';
import ChatArea from '@/app/components/ChatArea';
import { useState } from 'react';

// Định nghĩa kiểu cho Conversation
type Conversation = {
  id: string;
  name: string;
  online: boolean;
};

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>({
    id: 'conv1',
    name: 'Nguyễn Văn A',
    online: true,
  });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ConversationPanel onSelectConversation={setSelectedConversation} />
      <ChatArea selectedConversation={selectedConversation} />
    </div>
  );
}