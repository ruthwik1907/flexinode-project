import firebase from "firebase/compat/app";
import "firebase/compat/auth";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyCNHggBIvcQslB4eNXy8l2AcBX1P0pQwZA",
    authDomain: "flexinode-197ed.firebaseapp.com",
    projectId: "flexinode-197ed",
    storageBucket: "flexinode-197ed.firebasestorage.app",
    messagingSenderId: "880012501094",
    appId: "1:880012501094:web:9925734d2ee1d1dc684da7",
    measurementId: "G-02VN27TCRX",
  });
}

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
