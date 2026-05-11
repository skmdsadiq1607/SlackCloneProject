import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import { useChatStore } from '../store/chatStore';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const { connect, socket, disconnect } = useSocketStore();
  const { fetchChannels, fetchDms, addMessage, activeChannel, activeDm } = useChatStore();

  useEffect(() => {
    // Connect socket on mount
    connect(user);
    fetchChannels();
    fetchDms();

    return () => disconnect();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('message:new', (data) => {
      if (activeChannel && data.payload.channelId === activeChannel._id) {
        addMessage(data.payload);
      }
    });

    socket.on('dm:new', (data) => {
      if (activeDm && data.payload.conversationId === activeDm._id) {
        addMessage(data.payload);
      }
    });

    // Join rooms for active channels/dms
    if (activeChannel) socket.emit('channel:join', { channelId: activeChannel._id });
    if (activeDm) socket.emit('dm:join', { conversationId: activeDm._id });

    return () => {
      socket.off('message:new');
      socket.off('dm:new');
    };
  }, [socket, activeChannel, activeDm]);

  return (
    <div className="app-container">
      <Sidebar />
      <ChatArea />
    </div>
  );
};

export default Dashboard;
