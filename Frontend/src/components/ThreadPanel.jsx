import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import api from '../api';
import { X, Send } from 'lucide-react';

const ThreadPanel = () => {
  const { activeThread, threadMessages, setActiveThread } = useChatStore();
  const user = useAuthStore((state) => state.user);
  const [content, setContent] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [threadMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await api.post(`/messages/${activeThread._id}/thread`, { 
        content, 
        channelId: activeThread.channelId 
      });
      setContent('');
    } catch (err) {
      console.error('Failed to send reply', err);
    }
  };

  if (!activeThread) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Thread</h3>
          <p style={styles.subtitle}>in #{activeThread.channelName || 'channel'}</p>
        </div>
        <button onClick={() => setActiveThread(null)} style={styles.closeBtn}><X size={20} /></button>
      </div>

      <div style={styles.scrollArea} ref={scrollRef}>
        {/* Parent Message */}
        <div style={styles.parentMsg}>
          <div style={styles.avatar}>{activeThread.sender?.username?.[0].toUpperCase()}</div>
          <div>
            <div style={styles.msgHeader}>
              <span style={styles.msgUser}>{activeThread.sender?.username}</span>
              <span style={styles.msgTime}>{new Date(activeThread.createdAt).toLocaleTimeString()}</span>
            </div>
            <p style={styles.msgText}>{activeThread.content}</p>
          </div>
        </div>

        <div style={styles.divider}>
          <span>{threadMessages.length} replies</span>
          <div style={styles.line} />
        </div>

        {/* Replies */}
        {threadMessages.map((msg) => (
          <div key={msg._id} style={styles.reply}>
            <div style={styles.smallAvatar}>{msg.sender?.username?.[0].toUpperCase()}</div>
            <div>
              <div style={styles.msgHeader}>
                <span style={styles.msgUser}>{msg.sender?.username}</span>
                <span style={styles.msgTime}>{new Date(msg.createdAt).toLocaleTimeString()}</span>
              </div>
              <p style={styles.msgText}>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.inputArea}>
        <form onSubmit={handleSend} style={styles.inputForm}>
          <input 
            type="text" 
            placeholder="Reply..."
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
    width: '400px',
    height: '100%',
    backgroundColor: '#ffffff',
    borderLeft: '1px solid #eeeeee',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #eeeeee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: '13px',
    color: '#616061',
  },
  closeBtn: {
    color: '#616061',
  },
  scrollArea: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '20px 0',
  },
  parentMsg: {
    display: 'flex',
    padding: '0 20px 20px 20px',
    gap: '12px',
    borderBottom: '1px solid #eeeeee',
    marginBottom: '20px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    backgroundColor: '#e2e2e2',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    flexShrink: 0,
  },
  smallAvatar: {
    width: '28px',
    height: '28px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '12px',
    flexShrink: 0,
  },
  msgHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  msgUser: {
    fontWeight: '800',
    fontSize: '14px',
  },
  msgTime: {
    fontSize: '11px',
    color: '#616061',
  },
  msgText: {
    fontSize: '14px',
    color: '#1d1c1d',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 20px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#616061',
  },
  line: {
    flexGrow: 1,
    height: '1px',
    backgroundColor: '#eeeeee',
  },
  reply: {
    display: 'flex',
    padding: '8px 20px',
    gap: '12px',
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
  },
  input: {
    flexGrow: 1,
    padding: '10px',
    border: 'none',
    fontSize: '14px',
  },
  sendBtn: {
    padding: '8px',
    color: '#1264a3',
  }
};

export default ThreadPanel;
