// firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
// PENTING: Import initializeAuth dan getReactNativePersistence untuk React Native
import {
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  getAuth // Tetap diimport untuk tipe data jika perlu
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  CollectionReference,
  DocumentData,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadString,
} from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyBluswJmF2cF7MeNdJMwngrvyzZzvjAoDg",
  authDomain: "chatapp2-e78a0.firebaseapp.com",
  projectId: "chatapp2-e78a0",
  storageBucket: "chatapp2-e78a0.firebasestorage.app",
  messagingSenderId: "35759223938",
  appId: "1:35759223938:web:ccb0baada88788e796709b",
  measurementId: "G-XXV50H52NB",
};

// 1. Inisialisasi App (Cegah inisialisasi ganda)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Inisialisasi Auth dengan AsyncStorage (KHUSUS REACT NATIVE)
// Jika pakai getAuth(app) biasa, user akan logout tiap aplikasi direstart
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// 3. Inisialisasi Service lain
const db = getFirestore(app);
const storage = getStorage(app);

// 4. Helper Collection
export const messagesCollection = collection(db, "messages") as CollectionReference<DocumentData>;

// 5. Export semuanya agar bisa dipakai di screen lain
export {
  auth,
  db,
  storage,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadString,
};