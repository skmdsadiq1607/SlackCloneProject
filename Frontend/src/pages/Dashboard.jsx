import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import { useChatStore } from '../store/chatStore';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import ThreadPanel from '../components/ThreadPanel';
import CallModal from '../components/CallModal';

const Dashboard = () => {
  const [activeCall, setActiveCall] = React.useState(null);
  const user = useAuthStore((state) => state.user);
  const { connect, socket, disconnect } = useSocketStore();
  const { fetchChannels, fetchDms, addMessage, addThreadReply, activeChannel, activeDm, activeThread } = useChatStore();

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

    socket.on('thread:new_reply', (data) => {
      if (activeThread && data.payload.threadId === activeThread.threadId) {
        addThreadReply(data.payload);
      }
    });

    socket.on('call:incoming', (data) => {
      setActiveCall({
        callId: data.callId,
        callerId: data.from,
        callerName: data.callerName || 'Unknown User'
      });
    });

    socket.on('call:ended', () => {
      setActiveCall(null);
    });

    // Join rooms for active channels/dms
    if (activeChannel) socket.emit('channel:join', { channelId: activeChannel._id });
    if (activeDm) socket.emit('dm:join', { conversationId: activeDm._id });
    if (activeThread) socket.emit('thread:join', { threadId: activeThread.threadId });

    return () => {
      socket.off('message:new');
      socket.off('dm:new');
      socket.off('thread:new_reply');
      socket.off('call:incoming');
      socket.off('call:ended');
    };
  }, [socket, activeChannel, activeDm, activeThread]);

  return (
    <div className="app-container">
      <Sidebar />
      <ChatArea onStartCall={(data) => setActiveCall(data)} />
      {activeThread && <ThreadPanel />}
      {activeCall && (
        <CallModal 
          callData={activeCall} 
          onEnd={() => setActiveCall(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
