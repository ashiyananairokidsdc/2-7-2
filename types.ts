
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role?: 'staff' | 'doctor' | 'admin';
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  timestamp: number;
  isImportant: boolean;
  readBy: string[]; // List of user UIDs who have read the message
}

export interface ChatState {
  user: UserProfile | null;
  loading: boolean;
  messages: Message[];
}
