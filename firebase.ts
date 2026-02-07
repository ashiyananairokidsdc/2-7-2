
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile, Message } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyBCc3W18DI5zL1-S168_Chyw_VHgkDjgV8",
  authDomain: "chat1-2982f.firebaseapp.com",
  projectId: "chat1-2982f",
  storageBucket: "chat1-2982f.firebasestorage.app",
  messagingSenderId: "795065388212",
  appId: "1:795065388212:web:b9ffc735670378260b1be1",
  measurementId: "G-66V9N5QWR4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async (): Promise<UserProfile> => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  if (!user) throw new Error("ログイン失敗");

  const profile: UserProfile = {
    uid: user.uid,
    displayName: user.displayName || "スタッフ",
    email: user.email || "",
    photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'S')}&background=random`,
  };

  await setDoc(doc(db, 'users', user.uid), profile);
  return profile;
};

export const logout = () => signOut(auth);

export const subscribeMessages = (callback: (messages: Message[]) => void) => {
  const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(docSnapshot => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as Message));
    callback(messages);
  });
};

export const sendMessage = async (user: UserProfile, text: string, isImportant: boolean) => {
  if (!text.trim()) return;
  await addDoc(collection(db, 'messages'), {
    text,
    senderId: user.uid,
    senderName: user.displayName,
    senderPhoto: user.photoURL,
    timestamp: Date.now(),
    isImportant,
    readBy: [user.uid]
  });
};

export const markAsRead = async (messageId: string, userId: string) => {
  const messageRef = doc(db, 'messages', messageId);
  await updateDoc(messageRef, {
    readBy: arrayUnion(userId)
  });
};
