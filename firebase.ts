import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  CollectionReference,
  DocumentData,
} from "firebase/firestore";

import {
  getAuth,
  initializeAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getReactNativePersistence
} from "firebase/auth";

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBluswJmF2cF7MeNdJMwngrvyzZzvjAoDg",
  authDomain: "chatapp2-e78a0.firebaseapp.com",
  projectId: "chatapp2-e78a0",
  storageBucket: "chatapp2-e78a0.firebasestorage.app",
  messagingSenderId: "35759223938",
  appId: "1:35759223938:web:ccb0baada88788e796709b",
  measurementId: "G-XXV50H52NB",
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence managed by React Native (AsyncStorage)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export const messagesCollection = collection(db, "messages") as CollectionReference<DocumentData>;

export {
  auth,
  db,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};