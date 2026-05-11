import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import api from '../api';
import { Hash, Send, Paperclip, Info, Phone, Video, Search, MessageSquare, Plus } from 'lucide-react';

const ChatArea = () => {
  const { activeChannel, activeDm, messages, loading, setActiveThread } = useChatStore();
  const user = useAuthStore((state) => state.user);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      let fileData = {};
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('/upload', formData);
        fileData = { 
          fileUrl: uploadRes.data.payload.fileUrl, 
          fileName: uploadRes.data.payload.fileName 
        };
      }

      const type = activeChannel ? 'channel' : 'dm';
      const url = type === 'channel' ? '/messages/channel' : `/dm/${activeDm._id}/message`;
      const data = type === 'channel' 
        ? { content, channelId: activeChannel._id, ...fileData } 
        : { content, ...fileData };
      
      await api.post(url, data);
      setContent('');
      setFile(null);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  if (!activeChannel && !activeDm) {
    return (
      <div style={styles.empty}>
        <h2 style={styles.emptyTitle}>Select a channel or DM to start chatting</h2>
      </div>
    );
  }

  const title = activeChannel ? activeChannel.name : activeDm.participants.find(p => p._id !== user.id)?.username;

  return (
    <div className="main-content" style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          {activeChannel ? <Hash size={18} /> : <div style={styles.userDot} />}
          <h2 style={styles.title}>{title}</h2>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.headerBtn}><Phone size={18} /></button>
          <button style={styles.headerBtn}><Video size={18} /></button>
          <button style={styles.headerBtn}><Info size={18} /></button>
        </div>
      </header>

      {/* Message List */}
      <div style={styles.messageList} ref={scrollRef}>
        {loading && <div style={styles.loading}>Loading messages...</div>}
        {messages.map((msg) => (
          <div key={msg._id} style={styles.message}>
            <div style={styles.msgAvatar}>
              {msg.sender?.username?.[0].toUpperCase()}
            </div>
            <div style={styles.msgContent}>
              <div style={styles.msgHeader}>
                <span style={styles.msgUser}>{msg.sender?.username}</span>
                <span style={styles.msgTime}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <button 
                  onClick={() => setActiveThread(msg)}
                  style={styles.replyBtn}
                >
                  <MessageSquare size={14} /> Reply
                </button>
              </div>
              <p style={styles.msgText}>{msg.content}</p>
              {msg.fileUrl && (
                <div style={styles.fileAttachment}>
                  {msg.fileName.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img 
                      src={`http://localhost:5000${msg.fileUrl}`} 
                      alt={msg.fileName} 
                      style={styles.attachedImage} 
                    />
                  ) : (
                    <a 
                      href={`http://localhost:5000${msg.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={styles.fileLink}
                    >
                      📄 {msg.fileName}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div style={styles.inputArea}>
        {file && (
          <div style={styles.filePreview}>
            <span>📎 {file.name}</span>
            <button onClick={() => setFile(null)} style={styles.removeFile}>×</button>
          </div>
        )}
        <form onSubmit={handleSend} style={styles.inputForm}>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button 
            type="button" 
            style={styles.attachBtn}
            onClick={() => fileInputRef.current.click()}
          >
            <Plus size={20} />
          </button>
          <input 
            type="text" 
            placeholder={`Message ${activeChannel ? '#' + title : title}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.sendBtn} disabled={!content.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    padding: '12px 20px',
    borderBottom: '1px solid #eeeeee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '800',
  },
  headerRight: {
    display: 'flex',
    gap: '16px',
  },
  headerBtn: {
    color: '#616061',
  },
  messageList: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '20px 0',
  },
  message: {
    display: 'flex',
    padding: '8px 20px',
    gap: '12px',
    transition: 'background 0.1s',
  },
  msgAvatar: {
    width: '36px',
    height: '36px',
    backgroundColor: '#e2e2e2',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
  },
  msgContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  msgHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '2px',
  },
  msgUser: {
    fontWeight: '800',
    fontSize: '15px',
  },
  msgTime: {
    fontSize: '12px',
    color: '#616061',
  },
  replyBtn: {
    fontSize: '12px',
    color: '#1264a3',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginLeft: '12px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  msgText: {
    fontSize: '15px',
    lineHeight: '1.4',
    color: '#1d1c1d',
  },
  filePreview: {
    padding: '8px 12px',
    backgroundColor: '#f8f8f8',
    border: '1px solid #eeeeee',
    borderBottom: 'none',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
  },
  fileAttachment: {
    marginTop: '10px',
    padding: '8px',
    backgroundColor: '#f8f8f8',
    borderRadius: '4px',
    border: '1px solid #eeeeee',
    display: 'inline-block',
  },
  attachedImage: {
    maxWidth: '300px',
    maxHeight: '300px',
    borderRadius: '4px',
  },
  fileLink: {
    color: '#1264a3',
    fontWeight: '600',
    fontSize: '14px',
  },
  removeFile: {
    color: '#e01e5a',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  inputArea: {
    padding: '0 20px 20px 20px',
  },
  inputForm: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #bbbbbb',
    borderRadius: '8px',
    padding: '4px 8px',
    backgroundColor: '#ffffff',
  },
  attachBtn: {
    padding: '8px',
    color: '#616061',
    borderRight: '1px solid #eeeeee',
    marginRight: '8px',
  },
  input: {
    flexGrow: 1,
    padding: '10px',
    border: 'none',
    fontSize: '15px',
  },
  sendBtn: {
    padding: '8px',
    color: '#1264a3',
  },
  empty: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#616061',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '500',
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#616061',
  },
  userDot: {
    width: '12px',
    height: '12px',
    backgroundColor: '#2bac76',
    borderRadius: '50%',
  }
};

export default ChatArea;
