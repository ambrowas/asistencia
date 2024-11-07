const { contextBridge } = require('electron');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { ipcRenderer } = require('electron');
const firebase = require('firebase/app');
console.log(firebase); // Test if firebase is accessible



console.log('Preload script is executing...');
const firebaseConfig = {
    apiKey: "AIzaSyD32cqEuZx-ZAEnk6BCpxxneTzJvwK48dE",
    authDomain: "asistncia-b2394.firebaseapp.com",
    projectId: "asistncia-b2394",
    storageBucket: "asistncia-b2394.appspot.com",
    messagingSenderId: "523215954194",
    appId: "1:523215954194:web:039c5425f0984526a8d3cb",
    measurementId: "G-T7MDR9CEVT"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

async function loadFirebase() {
    const firebase = await import('firebase/app');
    console.log(firebase);
  }
  
  loadFirebase();
  

// Expose the Firebase functions and IPC communication method to the renderer process
contextBridge.exposeInMainWorld('electronFirebase', {
    
    getFirestoreData: async (collection) => {
        // Example function to get data from Firestore
    },
    createUser: async (email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    },
    signIn: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Error signing in:", error);
            throw error;
        }
    },
    uploadFile: async (filePath, file) => {
        const storageRef = ref(storage, filePath);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            return await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    },
    bringToFront: () => ipcRenderer.send('bringToFront'),
    getFirestore: () => getFirestore, 
});