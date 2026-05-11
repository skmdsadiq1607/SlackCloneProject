import React, { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { X, Lock, Globe } from 'lucide-react';

const CreateChannelModal = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const createChannel = useChatStore((state) => state.createChannel);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createChannel({ name, description, isPrivate });
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create a channel</h2>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>
        <p style={styles.subtitle}>Channels are where your team communicates. They’re best when organized around a topic — #marketing, for example.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputPrefix}>#</span>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="e.g. plan-budget"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description <span>(optional)</span></label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.input}
            />
            <p style={styles.hint}>What’s this channel about?</p>
          </div>

          <div style={styles.toggleGroup}>
            <div style={styles.toggleInfo}>
              <label style={styles.label}>Make private</label>
              <p style={styles.hint}>When a channel is set to private, it can only be viewed or joined by invitation.</p>
            </div>
            <button 
              type="button" 
              onClick={() => setIsPrivate(!isPrivate)}
              style={{...styles.toggle, backgroundColor: isPrivate ? '#2bac76' : '#dddddd'}}
            >
              <div style={{...styles.toggleCircle, transform: isPrivate ? 'translateX(20px)' : 'translateX(0)'}} />
            </button>
          </div>

          <div style={styles.footer}>
            <button type="submit" style={styles.submitBtn} disabled={loading || !name}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
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
    width: '520px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '28px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#1d1c1d',
  },
  closeBtn: {
    color: '#616061',
  },
  subtitle: {
    fontSize: '15px',
    color: '#616061',
    lineHeight: '1.4',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1d1c1d',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #bbbbbb',
    borderRadius: '4px',
    padding: '0 12px',
  },
  inputPrefix: {
    color: '#616061',
    fontSize: '18px',
    marginRight: '4px',
  },
  input: {
    flexGrow: 1,
    padding: '10px 0',
    border: 'none',
    fontSize: '16px',
    outline: 'none',
  },
  hint: {
    fontSize: '13px',
    color: '#616061',
  },
  toggleGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  toggleInfo: {
    maxWidth: '80%',
  },
  toggle: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    padding: '2px',
    position: 'relative',
    transition: 'background 0.2s',
  },
  toggleCircle: {
    width: '20px',
    height: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    transition: 'transform 0.2s',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '12px',
  },
  submitBtn: {
    backgroundColor: '#2bac76',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '4px',
    fontSize: '15px',
    fontWeight: '700',
  }
};

export default CreateChannelModal;
