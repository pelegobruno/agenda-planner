import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// USE ESTAS CREDENCIAIS NOVAS (O projeto agora tem o sufixo -8a6eb)
const firebaseConfig = {
  apiKey: "AIzaSyCfFhCreaPJfCWh2r-vfA-Gyjo7vJ6445Y",
  authDomain: "certa-banco-de-dados-8a6eb.firebaseapp.com",
  projectId: "certa-banco-de-dados-8a6eb",
  storageBucket: "certa-banco-de-dados-8a6eb.firebasestorage.app",
  messagingSenderId: "1091430350092",
  appId: "1:1091430350092:web:b78dfcda2060b2cd1e5d29",
  measurementId: "G-VQJFDKRS6Z"
};

// Inicialização segura para Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };