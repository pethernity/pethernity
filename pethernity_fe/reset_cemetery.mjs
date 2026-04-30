import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5p224UMGY3q225-P44Fpp4npzEHPIpBE",
  authDomain: "pixelmeadow-9cf1a.firebaseapp.com",
  projectId: "pixelmeadow-9cf1a",
  storageBucket: "pixelmeadow-9cf1a.firebasestorage.app",
  messagingSenderId: "447283321975",
  appId: "1:447283321975:web:d57be095f123dc72a33a72",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("⏳ Azzeramento cimitero in corso...");

const worldRef = doc(db, "world", "cemetery_main");
await setDoc(worldRef, {
  initialized: true,
  graves: {},
  population: 0
});

console.log("✅ Cimitero azzerato! Tutte le tombe sono state rimosse.");
console.log("   - graves: {} (vuoto)");
console.log("   - population: 0");
process.exit(0);
