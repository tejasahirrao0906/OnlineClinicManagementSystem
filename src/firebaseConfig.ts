import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDd-d4zmSsoXqYMq3nRWr9ErR3xS5eOodg",
  authDomain: "clinic-management-system-19338.firebaseapp.com",
  projectId: "clinic-management-system-19338",
  storageBucket: "clinic-management-system-19338.firebasestorage.app",
  messagingSenderId: "699384984400",
  appId: "1:699384984400:web:55ba960ede41d44da33255",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);