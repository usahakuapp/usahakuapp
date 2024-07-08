// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAHXvYRB71qQINDAkWHNjUxupHkwDlYEvM",
  authDomain: "presensi-usahaku.firebaseapp.com",
  databaseURL: "https://presensi-usahaku-default-rtdb.firebaseio.com",
  projectId: "presensi-usahaku",
  storageBucket: "presensi-usahaku.appspot.com",
  messagingSenderId: "526464379600",
  appId: "1:526464379600:web:78eb52350ef1ff8291ccd5",
  measurementId: "G-YYJQ8W8E2R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

const buttonSignUp = document.getElementById("button_signup");
const buttonSignIn = document.getElementById("button_signin");

const resetPasswordForm = document.getElementById("resetPasswordForm");
const resetPasswordButton = document.getElementById("resetPasswordButton");

window.addEventListener("DOMContentLoaded", (event) => {
if (buttonSignUp) {
  buttonSignUp.addEventListener("click", (e)=>{
    e.preventDefault();

    let umkm_name = document.getElementById("umkm_name").value;
    let owner_name = document.getElementById("owner_name").value;
    let no_hp = document.getElementById("no_hp").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let address = document.getElementById("address").value;

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User created:", user.uid);

      console.log("Data yang akan disimpan:", {
        umkm_name: umkm_name,
        owner_name: owner_name,
        no_hp: no_hp,
        email: email,
        address: address,
      });

      return set(ref(database, "umkm/" + user.uid), {
        umkm_name: umkm_name,
        owner_name: owner_name,
        no_hp: no_hp,
        email: email,
        address: address,
      });
    })
    .then(() => {
      console.log("Data berhasil ditambahkan ke database");
      alert("User Telah Ditambahkan");
      location.href = "login.html";
    })
    .catch((error) => {
      console.error('Error creating user or adding data to database:', error);
      alert(error.message);
    });
  })
}

if (buttonSignIn){
  buttonSignIn.addEventListener("click",(e)=>{
    e.preventDefault();

    let email_signin = document.getElementById("email_signin").value;
    let password_signin = document.getElementById("password_signin").value;

    // Setelah user berhasil login
    signInWithEmailAndPassword(auth, email_signin, password_signin)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      alert("User Berhasil Login");
      // Simpan informasi login di localStorage
      localStorage.setItem('userLoggedIn', JSON.stringify(user));
      location.href = `admin/dashboard.html?uid=${user.uid}`;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(error.message);
    });
  })
}

resetPasswordForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const resetEmail = document.getElementById("resetEmail").value;

  // Kirim email reset password
  sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
          // Email reset password berhasil dikirim
          alert("Email untuk reset password telah dikirim. Silakan periksa kotak masuk email Anda.");
      })
      .catch((error) => {
          // Handle error
          console.error('Error sending reset password email:', error);
          alert("Email tidak ditemukan.");
      });
});
})