import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBSwG2hrSVvU2pEaGaAlUu1xWBar1Pb-to",
  authDomain: "lunar-hexagon-whl8x.firebaseapp.com",
  projectId: "lunar-hexagon-whl8x",
  storageBucket: "lunar-hexagon-whl8x.firebasestorage.app",
  messagingSenderId: "701871986449",
  appId: "1:701871986449:web:8b3c8b0e1ad61f59375eb0"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-shivanigraphicsq-02588996-4c36-43ac-9504-131650b16d2f");
