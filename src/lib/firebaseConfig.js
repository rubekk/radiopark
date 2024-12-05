import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, onDisconnect, child } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDFr8EauEaruwfAnuYEa4W2GTwg6_yIb1M",
  authDomain: "radiopark-28f93.firebaseapp.com",
  projectId: "radiopark-28f93",
  storageBucket: "radiopark-28f93.firebasestorage.app",
  messagingSenderId: "878978678158",
  appId: "1:878978678158:web:4469d7c2e90cba208b78df"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase();
