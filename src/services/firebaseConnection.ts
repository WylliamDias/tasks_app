import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY as string,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_PROJECTID as string,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID as string,
  appId: process.env.NEXT_PUBLIC_APPID as string
};

const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);