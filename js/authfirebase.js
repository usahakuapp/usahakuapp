// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

window.addEventListener("DOMContentLoaded", (event) => {
  if (buttonSignUp) {
    buttonSignUp.addEventListener("click", (e) => {
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
  
          const tempUserData = {
            umkm_name: umkm_name,
            owner_name: owner_name,
            no_hp: no_hp,
            email: email,
            address: address,
            umkm_uid: user.uid,
            // Never store plain text passwords in the database. It's here for demonstration purposes only.
            password: password 
          };
  
          // Store temporary user data
          const tempRef = ref(database, "temp_umkm/" + user.uid);
          set(tempRef, tempUserData);
  
          return sendEmailVerification(user);
        })
        .then(() => {
          console.log("Verification email sent");
          alert("Email verifikasi telah dikirim. Silakan periksa email Anda untuk memverifikasi akun.");
          auth.signOut(); // Sign out the user to prevent them from accessing the application until they verify their email
        })
        .catch((error) => {
          console.error('Error creating user or sending verification email:', error);
          alert(error.message);
        });
    });
  }

  if (buttonSignIn) {
    buttonSignIn.addEventListener("click", (e) => {
        e.preventDefault();

        let email_signin = document.getElementById("email_signin").value;
        let password_signin = document.getElementById("password_signin").value;

        signInWithEmailAndPassword(auth, email_signin, password_signin)
            .then((userCredential) => {
                const user = userCredential.user;

                if (!user.emailVerified) {
                    sendEmailVerification(user)
                        .then(() => {
                            alert("Email verifikasi telah dikirim. Silakan periksa email Anda untuk memverifikasi akun.");
                            auth.signOut(); // Sign out the user to prevent access without verification
                        })
                        .catch((error) => {
                            console.error('Error sending verification email:', error);
                            alert("Pendaftaran akun belum terverifikasi !");
                        });
                } else {
                    // Check if the user data is in the temporary location
                    const tempRef = ref(database, "temp_umkm/" + user.uid);
                    get(tempRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            const userData = snapshot.val();
                            const umkmRef = ref(database, "umkm/" + user.uid);
                            set(umkmRef, userData)
                                .then(() => {
                                    // Remove temporary data
                                    remove(tempRef);

                                    alert("User Berhasil Login");
                                    // Simpan informasi login di localStorage
                                    localStorage.setItem('userLoggedIn', JSON.stringify(user));
                                    location.href = `admin/dashboard.html?uid=${user.uid}`;
                                })
                                .catch((error) => {
                                    console.error('Error moving user data:', error);
                                    alert("Gagal memindahkan data user. Silakan coba lagi.");
                                });
                        } else {
                            // If user data is not in the temporary location, check the final location
                            const umkmRef = ref(database, "umkm/" + user.uid);
                            get(umkmRef).then((snapshot) => {
                                if (snapshot.exists()) {
                                    alert("User Berhasil Login");
                                    // Simpan informasi login di localStorage
                                    localStorage.setItem('userLoggedIn', JSON.stringify(user));
                                    location.href = `admin/dashboard.html?uid=${user.uid}`;
                                } else {
                                    alert("Data user tidak ditemukan.");
                                }
                            }).catch((error) => {
                                console.error('Error getting user data from umkm node:', error);
                                alert("Gagal mendapatkan data user.");
                            });
                        }
                    }).catch((error) => {
                        console.error('Error getting temporary user data:', error);
                        alert("Gagal mendapatkan data user sementara.");
                    });
                }
            })
            .catch((error) => {
                console.error('Sign-in error:', error); // Log the error for better debugging
                alert("Email atau Password Salah");
            });
    });
}


  if (resetPasswordForm) {
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
  }
});
