import React, { useEffect, useRef, useState } from 'react';
import { useSocketStore } from '../store/socketStore';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize, Minimize } from 'lucide-react';

const CallModal = ({ callData, onEnd }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, ringing, active
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socket = useSocketStore((state) => state.socket);

  useEffect(() => {
    // Start local stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setCallStatus('ringing');
      })
      .catch((err) => console.error('Failed to get media', err));

    return () => {
      // Cleanup streams
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleEndCall = () => {
    socket.emit('call:end', { callId: callData.callId });
    onEnd();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.callInfo}>
            <h2 style={styles.callerName}>{callData.callerName || 'Voice/Video Call'}</h2>
            <p style={styles.status}>{callStatus}...</p>
          </div>
        </div>

        <div style={styles.videoGrid}>
          <div style={styles.remoteVideoContainer}>
             <video ref={remoteVideoRef} autoPlay playsInline style={styles.remoteVideo} />
             <div style={styles.remotePlaceholder}>
                <span>Remote User</span>
             </div>
          </div>
          <div style={styles.localVideoContainer}>
             <video ref={localVideoRef} autoPlay playsInline muted style={styles.localVideo} />
          </div>
        </div>

        <div style={styles.controls}>
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            style={{...styles.controlBtn, backgroundColor: isMuted ? '#e01e5a' : '#444444'}}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button 
            onClick={() => setIsCameraOff(!isCameraOff)} 
            style={{...styles.controlBtn, backgroundColor: isCameraOff ? '#e01e5a' : '#444444'}}
          >
            {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
          <button onClick={handleEndCall} style={styles.endBtn}>
            <PhoneOff size={24} />
          </button>
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
    backgroundColor: 'rgba(0,0,0,0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  container: {
    width: '90%',
    maxWidth: '1000px',
    height: '80vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  header: {
    padding: '20px',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  callerName: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '800',
  },
  status: {
    color: '#cfc3cf',
    fontSize: '14px',
  },
  videoGrid: {
    flexGrow: 1,
    display: 'flex',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
  },
  remoteVideoContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  remotePlaceholder: {
    position: 'absolute',
    color: '#ffffff',
    fontSize: '18px',
    opacity: 0.5,
  },
  localVideoContainer: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    width: '240px',
    height: '180px',
    backgroundColor: '#000000',
    borderRadius: '8px',
    border: '2px solid #ffffff',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  },
  localVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    padding: '24px',
  },
  controlBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtn: {
    width: '64px',
    height: '48px',
    backgroundColor: '#e01e5a',
    borderRadius: '24px',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default CallModal;
