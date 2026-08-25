import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBFYMSZtSSoKCycpCkZ_Hn6F_zLnZz68Fo",
  authDomain: "petdx-7ff28.firebaseapp.com",
  projectId: "petdx-7ff28",
  storageBucket: "petdx-7ff28.firebasestorage.app",
  messagingSenderId: "850892310019",
  appId: "1:850892310019:web:ebcf6c66f5514deb00b036"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;