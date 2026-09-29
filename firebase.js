import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBmH1zAxA53A3KSum2XdW6L_yOsv2SRgk",
  authDomain: "smart-plant-care-system-cb00c.firebaseapp.com",
  projectId: "smart-plant-care-system-cb00c",
  storageBucket: "smart-plant-care-system-cb00c.firebasestorage.app",
  messagingSenderId: "853903678745",
  appId: "1:853903678745:web:bcdb4d06acdcfe24fdb988",
  measurementId: "G-SN9X6JS3NR"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;