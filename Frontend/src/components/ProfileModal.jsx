import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api';
import { X, Camera, Smile } from 'lucide-react';

const ProfileModal = ({ onClose }) => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [status, setStatus] = useState(user?.customStatus || '');
  const [emoji, setEmoji] = useState(user?.statusEmoji || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/user/profile', { 
        customStatus: status, 
        statusEmoji: emoji 
      });
      setUser(res.data.payload);
      onClose();
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Edit your profile</h2>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        <div style={styles.content}>
          <div style={styles.avatarSection}>
            <div style={styles.largeAvatar}>
              {user?.username?.[0].toUpperCase()}
              <button style={styles.cameraBtn}><Camera size={14} /></button>
            </div>
            <div style={styles.info}>
              <h3 style={styles.name}>{user?.username}</h3>
              <p style={styles.email}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Set a status</label>
              <div style={styles.statusInput}>
                <span style={styles.emojiBtn}><Smile size={18} /></span>
                <input 
                  type="text" 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="What's your status?"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.footer}>
              <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
              <button type="submit" style={styles.saveBtn} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
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
    zIndex: 1000,
  },
  modal: {
    width: '440px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
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
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
  },
  largeAvatar: {
    width: '72px',
    height: '72px',
    backgroundColor: '#1264a3',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '700',
    position: 'relative',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: '-8px',
    right: '-8px',
    backgroundColor: '#ffffff',
    border: '1px solid #dddddd',
    borderRadius: '50%',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  name: {
    fontSize: '18px',
    fontWeight: '800',
  },
  email: {
    fontSize: '14px',
    color: '#616061',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '700',
  },
  statusInput: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #bbbbbb',
    borderRadius: '4px',
    padding: '0 12px',
  },
  emojiBtn: {
    marginRight: '8px',
    color: '#616061',
  },
  input: {
    flexGrow: 1,
    padding: '10px 0',
    border: 'none',
    fontSize: '15px',
    outline: 'none',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
  },
  cancelBtn: {
    padding: '10px 20px',
    border: '1px solid #dddddd',
    borderRadius: '4px',
    fontSize: '15px',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#2bac76',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '4px',
    fontSize: '15px',
    fontWeight: '700',
  }
};

export default ProfileModal;
