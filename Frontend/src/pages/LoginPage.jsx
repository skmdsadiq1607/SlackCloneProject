import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <LogIn size={32} color="#1264a3" />
          </div>
          <h1 style={styles.title}>Sign in to Slack Clone</h1>
          <p style={styles.subtitle}>Enter your email and password to continue.</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@work-email.com"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.button}>Sign In</button>
        </form>

        <div style={styles.footer}>
          New to Slack Clone? <Link to="/signup" style={styles.link}>Create an account</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f8f8',
  },
  card: {
    width: '400px',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #eeeeee',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1d1c1d',
    marginBottom: '8px',
  },
  subtitle: {
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
    fontWeight: '600',
    color: '#1d1c1d',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #dddddd',
    fontSize: '16px',
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#1264a3',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    marginTop: '10px',
  },
  error: {
    backgroundColor: '#fff1f0',
    color: '#e01e5a',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid #ffa39e',
    textAlign: 'center',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#616061',
  },
  link: {
    color: '#1264a3',
    fontWeight: '600',
  }
};

export default LoginPage;
