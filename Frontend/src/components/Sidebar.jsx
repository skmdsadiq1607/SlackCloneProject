import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { Hash, MessageSquare, ChevronDown, Plus, LogOut, Settings, User } from 'lucide-react';

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { channels, dms, setActiveChannel, setActiveDm, activeChannel, activeDm } = useChatStore();

  return (
    <div style={styles.container} className="sidebar">
      {/* Workspace Header */}
      <div style={styles.header}>
        <div style={styles.workspaceInfo}>
          <h2 style={styles.workspaceName}>Slack Clone</h2>
          <ChevronDown size={16} />
        </div>
      </div>

      <div style={styles.scrollArea}>
        {/* Channels Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span>Channels</span>
            <button style={styles.addButton}><Plus size={14} /></button>
          </div>
          <div style={styles.list}>
            {channels.map((ch) => (
              <button 
                key={ch._id} 
                onClick={() => setActiveChannel(ch)}
                style={{
                  ...styles.listItem,
                  backgroundColor: activeChannel?._id === ch._id ? '#1164A3' : 'transparent',
                  color: activeChannel?._id === ch._id ? '#ffffff' : '#cfc3cf'
                }}
              >
                <Hash size={16} style={styles.icon} />
                <span>{ch.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DMs Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span>Direct Messages</span>
            <button style={styles.addButton}><Plus size={14} /></button>
          </div>
          <div style={styles.list}>
            {dms.map((dm) => {
              const otherUser = dm.participants.find(p => p._id !== user.id);
              return (
                <button 
                  key={dm._id} 
                  onClick={() => setActiveDm(dm)}
                  style={{
                    ...styles.listItem,
                    backgroundColor: activeDm?._id === dm._id ? '#1164A3' : 'transparent',
                    color: activeDm?._id === dm._id ? '#ffffff' : '#cfc3cf'
                  }}
                >
                  <div style={{...styles.statusDot, backgroundColor: otherUser?.status === 'online' ? '#2bac76' : '#717171'}} />
                  <span>{otherUser?.username || 'Unknown'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Profile / Footer */}
      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
             {user?.username?.[0].toUpperCase()}
          </div>
          <div style={styles.userDetails}>
            <span style={styles.userName}>{user?.username}</span>
            <div style={styles.userStatus}>
              <div style={styles.onlineDot} /> Online
            </div>
          </div>
        </div>
        <div style={styles.footerActions}>
          <button onClick={logout} style={styles.footerBtn} title="Logout"><LogOut size={18} /></button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #2d2a33',
  },
  header: {
    padding: '16px',
    borderBottom: '1px solid #2d2a33',
    marginBottom: '8px',
  },
  workspaceInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  workspaceName: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#ffffff',
  },
  scrollArea: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '0 8px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px 8px 8px',
    fontSize: '14px',
    fontWeight: '500',
    opacity: 0.7,
  },
  addButton: {
    padding: '4px',
    color: '#ffffff',
    opacity: 0.7,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '4px',
    textAlign: 'left',
    fontSize: '15px',
    width: '100%',
  },
  icon: {
    opacity: 0.6,
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginRight: '4px',
  },
  footer: {
    padding: '16px',
    backgroundColor: '#111014',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    backgroundColor: '#1264a3',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '700',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
  },
  userStatus: {
    fontSize: '12px',
    color: '#cfc3cf',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  onlineDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#2bac76',
    borderRadius: '50%',
  },
  footerActions: {
    display: 'flex',
    gap: '8px',
  },
  footerBtn: {
    color: '#cfc3cf',
    padding: '4px',
  }
};

export default Sidebar;
