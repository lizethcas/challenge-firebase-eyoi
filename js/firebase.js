// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { getFirestore} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js"
/* import { getFirestore} from "https://www.gstatic.com/firebasejs/9.17.0/firebase-firestore.js" */
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTg_QN08UwojTJc_4jUP8uH9UPGlneHr0",
  authDomain: "enyoi-2d664.firebaseapp.com",
  projectId: "enyoi-2d664",
  storageBucket: "enyoi-2d664.appspot.com",
  messagingSenderId: "698241228133",
  appId: "1:698241228133:web:4241eb5ec54b4148f5d58c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();// inicializar la base de datos

export { auth,db };
