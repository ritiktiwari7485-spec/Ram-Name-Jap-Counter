// firebase-config.js

const firebaseConfig = {
    apiKey: "AIzaSyD7kZ-KLmSxf4qroMS8M9pIz4UVnrkxP2M",
    authDomain: "ram---name---jap.firebaseapp.com",
    projectId: "ram---name---jap",
    storageBucket: "ram---name---jap.firebasestorage.app",
    messagingSenderId: "282422439192",
    appId: "1:282422439192:web:f4f6ae88115e7d8d89826d"
};

// Firebase start karo aur 'db' ko puri website ke liye global bana do
firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();

console.log("🔥 Firebase Config File se connect ho gaya!");
