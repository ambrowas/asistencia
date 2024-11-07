// firebaseFunctions.js
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const firebaseConfig = {
    apiKey: "AIzaSyD32cqEuZx-ZAEnk6BCpxxneTzJvwK48dE",
    authDomain: "asistncia-b2394.firebaseapp.com",
    projectId: "asistncia-b2394",
    storageBucket: "asistncia-b2394.appspot.com",
    messagingSenderId: "523215954194",
    appId: "1:523215954194:web:039c5425f0984526a8d3cb",
    measurementId: "G-T7MDR9CEVT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

async function createUser(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

async function signIn(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

async function uploadFile(filePath, file) {
    const storageRef = ref(storage, filePath);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}

// Add other Firebase functions here...

module.exports = {
    createUser, // Already defined
    signIn,
    uploadFile,
    // Add other functions as necessary
};
