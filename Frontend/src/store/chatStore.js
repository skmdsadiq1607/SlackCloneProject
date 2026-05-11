import { create } from 'zustand';
import api from '../api';

export const useChatStore = create((set, get) => ({
  channels: [],
  dms: [],
  activeChannel: null,
  activeDm: null,
  activeThread: null,
  messages: [],
  threadMessages: [],
  loading: false,

  fetchChannels: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/channels/mine');
      set({ channels: res.data.payload, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  createChannel: async (data) => {
    const res = await api.post('/channels', data);
    set((state) => ({ channels: [...state.channels, res.data.payload] }));
    return res.data;
  },

  fetchDms: async () => {
    try {
      const res = await api.get('/dms');
      set({ dms: res.data.payload });
    } catch (err) {}
  },

  setActiveChannel: (channel) => {
    set({ activeChannel: channel, activeDm: null, messages: [] });
    if (channel) get().fetchMessages('channel', channel._id);
  },

  setActiveDm: (dm) => {
    set({ activeDm: dm, activeChannel: null, messages: [] });
    if (dm) get().fetchMessages('dm', dm._id);
  },

  fetchMessages: async (type, id) => {
    set({ loading: true });
    try {
      const url = type === 'channel' ? `/messages/channel/${id}` : `/dm/${id}/messages`;
      const res = await api.get(url);
      set({ messages: res.data.payload, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  setActiveThread: (message) => {
    set({ activeThread: message, threadMessages: [] });
    if (message) get().fetchThreadReplies(message._id);
  },

  fetchThreadReplies: async (messageId) => {
    try {
      const res = await api.get(`/messages/${messageId}/thread`);
      set({ threadMessages: res.data.payload.replies });
    } catch (err) {}
  },

  addThreadReply: (reply) => {
    set((state) => ({ threadMessages: [...state.threadMessages, reply] }));
  }
}));
