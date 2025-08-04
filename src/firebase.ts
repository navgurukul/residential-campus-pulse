// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAoicxv9z4O4v-_yeW7_06g4KCl8HAVlIU",
  authDomain: "navgurukul-campus-pulse.firebaseapp.com",
  projectId: "navgurukul-campus-pulse",
  storageBucket: "navgurukul-campus-pulse.firebasestorage.app",
  messagingSenderId: "712788892088",
  appId: "1:712788892088:web:000e0b7ba96e9eca10d74d",
  measurementId: "G-EWZ81V0LNJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
