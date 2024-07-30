import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_dUxbZq2jl0CbGrI18KvISGmp8PDxwbg",
  authDomain: "amazingpantry-fe221.firebaseapp.com",
  projectId: "amazingpantry-fe221",
  storageBucket: "amazingpantry-fe221.appspot.com",
  messagingSenderId: "402662038551",
  appId: "1:402662038551:web:0772155c1e7f6fe6fa5052"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export {app, firestore}