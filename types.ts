
export interface User {
  name: string;
  mobile: string;
  email?: string;
  city?: string;
  balance: number;
  password?: string;
}

export interface Transaction {
  type: 'deposit' | 'withdraw' | 'send' | 'receive' | 'admin_deposit' | 'admin_withdraw';
  amount: number;
  Date: string;
  mobile: string;
  Send_to?: string;
  Receive_from?: string;
}

export interface ChatMessage {
  To_: string;
  From_: string;
  Message: string;
  DateTime: string;
}

export type ViewType = 'dashboard' | 'transfer' | 'deposit' | 'withdraw' | 'history' | 'profile' | 'chat';
export type AdminViewType = 'admin-dashboard' | 'admin-users' | 'admin-transactions' | 'admin-chat' | 'admin-settings';

export interface AuthState {
  user: User | null;
  sessionId: string | null;
  isAdmin: boolean;
}
