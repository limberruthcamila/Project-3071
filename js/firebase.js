/* ============================================
   Firebase Configuration
   ============================================ */

const firebaseConfig = {
  apiKey: "AIzaSyBG_DjQQfroIKY3Fta2PgsfE9ArRYfqrh0",
  authDomain: "project-3081-limber.firebaseapp.com",
  projectId: "project-3081-limber",
  storageBucket: "project-3081-limber.firebasestorage.app",
  messagingSenderId: "174564084979",
  appId: "1:174564084979:web:d141d7ee968595f1d4bb86",
  measurementId: "G-K99Q5PX8W2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Services
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();
