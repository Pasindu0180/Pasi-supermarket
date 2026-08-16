import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-qR3yZZLkdNmB0kQQhz1KQTyQH7us8Iw",
  authDomain: "supermarket-billing-syst-17aae.firebaseapp.com",
  projectId: "supermarket-billing-syst-17aae",
  storageBucket: "supermarket-billing-syst-17aae.firebasestorage.app",
  messagingSenderId: "217106122920",
  appId: "1:217106122920:web:54d958368cfbb5e10f5a9d"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };