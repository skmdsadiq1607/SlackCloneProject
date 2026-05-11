import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserPlus } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <UserPlus size={32} color="#1264a3" />
          </div>
          <h1 style={styles.title}>Join Slack Clone</h1>
          <p style={styles.subtitle}>Create your account to start collaborating.</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input 
              name="username"
              type="text" 
              value={formData.username}
              onChange={handleChange}
              placeholder="John Doe"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="name@work-email.com"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              style={styles.input}
              required
              minLength={6}
            />
          </div>
          <button type="submit" style={styles.button}>Create Account</button>
        </form>

        <div style={styles.footer}>
          Already using Slack Clone? <Link to="/login" style={styles.link}>Sign in instead</Link>
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

export default SignupPage;
