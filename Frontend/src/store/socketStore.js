import { create } from 'zustand';
import { io } from 'socket.io-client';

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,

  connect: (user) => {
    if (get().socket) return;

    // In a real app, we might get token from cookie or local storage
    // But our backend check cookies, so socket.io-client will send them if withCredentials is true
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      auth: {
        // We can also pass token here if needed
        // token: getCookie('token')
      }
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      set({ connected: true });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ connected: false });
    });

    set({ socket: socketInstance });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  }
}));
