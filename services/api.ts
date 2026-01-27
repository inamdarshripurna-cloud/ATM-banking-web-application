
import { API_BASE } from '../constants';
import { User, Transaction, ChatMessage } from '../types';

export const api = {
  async login(mobile: string, password: string) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, password }),
    });
    return res.json();
  },

  async getUser(mobile: string) {
    const res = await fetch(`${API_BASE}/user/${mobile}`);
    return res.json();
  },

  async register(userData: Partial<User>) {
    const res = await fetch(`${API_BASE}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  async adminLogin(username: string, password: string) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async getTransactions(mobile: string, sessionId: string) {
    const res = await fetch(`${API_BASE}/transactions/${mobile}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
    return res.json();
  },

  async transfer(fromMobile: string, sessionId: string, receiver: string, amount: number) {
    const res = await fetch(`${API_BASE}/transfer/${fromMobile}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, receiver, amount }),
    });
    return res.json();
  },

  async deposit(mobile: string, sessionId: string, amount: number) {
    const res = await fetch(`${API_BASE}/deposit/${mobile}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, amount }),
    });
    return res.json();
  },

  async withdraw(mobile: string, sessionId: string, amount: number) {
    const res = await fetch(`${API_BASE}/withdraw/${mobile}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, amount }),
    });
    return res.json();
  },

  async updateProfile(mobile: string, sessionId: string, userData: Partial<User>) {
    const res = await fetch(`${API_BASE}/update/${mobile}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, session_id: sessionId }),
    });
    return res.json();
  },

  async getMessages() {
    const res = await fetch(`${API_BASE}/all_messages`);
    return res.json();
  },

  async sendMessage(to: string, from: string, message: string) {
    const res = await fetch(`${API_BASE}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ To_: to, From_: from, Message: message }),
    });
    return res.json();
  },

  // Admin APIs
  async getAllUsers() {
    const res = await fetch(`${API_BASE}/admin/users`);
    return res.json();
  },

  async getAllTransactions() {
    const res = await fetch(`${API_BASE}/admin/transactions`);
    return res.json();
  },

  async deleteUser(mobile: string) {
    const res = await fetch(`${API_BASE}/admin/user/delete/${mobile}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async adjustBalance(mobile: string, amount: number, operation: 'deposit' | 'withdraw') {
    const res = await fetch(`${API_BASE}/admin/user/balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, amount, operation }),
    });
    return res.json();
  },

  async getTransactionsByMobile(mobile: string) {
    const res = await fetch(`${API_BASE}/admin/user/transactions/${mobile}`);
    return res.json();
  }
};
