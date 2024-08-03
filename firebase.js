// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4v3G1_eENhtyb2tAGmOK9-ajRK7YX8f4",
  authDomain: "inventory-management-41635.firebaseapp.com",
  projectId: "inventory-management-41635",
  storageBucket: "inventory-management-41635.appspot.com",
  messagingSenderId: "914056453598",
  appId: "1:914056453598:web:c0d878ad19485d05add14f",
  measurementId: "G-RF23453VMT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };