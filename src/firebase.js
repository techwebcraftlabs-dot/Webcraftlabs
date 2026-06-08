import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDT17lAEJtdcDVltf7Wf8xKttBvuXloM5M",
  authDomain: "zonal-project.firebaseapp.com",
  projectId: "zonal-project",
  storageBucket: "zonal-project.firebasestorage.app",
  messagingSenderId: "524581590483",
  appId: "1:524581590483:web:cde9d404d0d9df226f8b26",
  measurementId: "G-N5WE2882WH",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const analytics = getAnalytics(app);