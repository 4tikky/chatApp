// firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
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

//const storage = getStorage(app);

const firebaseConfig = {
  apiKey: "AIzaSyBluswJmF2cF7MeNdJMwngrvyzZzvjAoDg",
  authDomain: "chatapp2-e78a0.firebaseapp.com",
  projectId: "chatapp2-e78a0",
  storageBucket: "chatapp2-e78a0.firebasestorage.app",
  messagingSenderId: "35759223938",
  appId: "1:35759223938:web:ccb0baada88788e796709b",
  measurementId: "G-XXV50H52NB",
};

// Hindari duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export const messagesCollection =
  collection(db, "messages") as CollectionReference<DocumentData>;

export {
  auth,
  db,
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
