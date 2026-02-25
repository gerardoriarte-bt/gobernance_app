
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const allowedAppDomains = ['lobueno.co', 'buentipo.com', 'hermano.com', 'localhost', '127.0.0.1'];
const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
const isAllowedDomain = allowedAppDomains.some(d => currentDomain === d || currentDomain.endsWith(`.${d}`));

let app: any;
let auth: any;
let db: any;
let googleProvider: any;

import { setPersistence, browserLocalPersistence } from 'firebase/auth';

if (isAllowedDomain) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Ensure persistence is enabled immediately
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Firebase persistence error:", error);
  });

  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} else {
  console.warn(`Conexión a Firebase restringida. El dominio ${currentDomain} no está autorizado.`);
}

export { app, auth, db, googleProvider };
