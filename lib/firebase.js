import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDAJ4z61qr9Yp1LSFNqtELHBHjVQYVg8HY",
  authDomain: "sariledger.firebaseapp.com",
  projectId: "sariledger",
  storageBucket: "sariledger.firebasestorage.app",
  messagingSenderId: "732201982853",
  appId: "1:732201982853:web:0a5adc3adf154f73a482ec",
  measurementId: "G-7MZ6EHT5L3"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
