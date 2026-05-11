import React, { useEffect, useState } from 'react';
import api from '../api';
import { X, User, Circle } from 'lucide-react';

const MembersList = ({ channel, onClose }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get(`/channels/${channel._id}/members`);
        setMembers(res.data.payload);
      } catch (err) {
        console.error('Failed to fetch members');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [channel._id]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Members in #{channel.name}</h2>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <div style={styles.list}>
          {loading ? <div>Loading...</div> : members.map((member) => (
            <div key={member._id} style={styles.memberItem}>
              <div style={styles.avatar}>
                {member.username?.[0].toUpperCase()}
              </div>
              <div style={styles.info}>
                <span style={styles.name}>{member.username}</span>
                <div style={styles.status}>
                   <div style={{...styles.dot, backgroundColor: member.status === 'online' ? '#2bac76' : '#717171'}} />
                   {member.status === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1500,
  },
  modal: {
    width: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
  },
  closeBtn: {
    color: '#616061',
  },
  list: {
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  memberItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    fontSize: '15px',
    fontWeight: '700',
  },
  status: {
    fontSize: '12px',
    color: '#616061',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  }
};

export default MembersList;
