    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getDatabase, ref, get, set, update, child, onValue, remove  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

    let umkm_uid;

    window.addEventListener("DOMContentLoaded", (event) => {
        const urlParams = new URLSearchParams(window.location.search);
        umkm_uid = urlParams.get('uid');

        //========================================================================================== DISPLAY DATA START

        if (window.location.pathname.endsWith("umkm-salarycut.html")) {
            const umkmSalarycutRef = ref(database, "umkm_salarycut/" + umkm_uid);

            // cek apakah data ada
            get(umkmSalarycutRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        // kalau ada
                        document.getElementById("umkm_late_cut").value = snapshot.val().umkm_late_cut;
                        modalLoading.style.display = "none";
                    }
                })
                .catch((error) => {
                    console.error("Error checking data existence: ", error);
                });
        }

        if (window.location.pathname.endsWith("umkm-operational.html")) {
            const umkmOperationalRef = ref(database, "umkm_operational/" + umkm_uid);
    
            // cek apakah data ada
            get(umkmOperationalRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        // data ada
                        document.getElementById("working_hour").value = snapshot.val().umkm_working_hour;
                        document.getElementById("closing_hour").value = snapshot.val().umkm_closing_hour;
                        modalLoading.style.display = "none";
                    }
                })
                .catch((error) => {
                    console.error("Error checking data existence: ", error);
                });
        }

        //========================================================================================== DISPLAY DATA END


        //========================================================================================== INSERT DATA START
        
        const buttonOperational = document.getElementById("button_operational");
        const buttonSalarycut = document.getElementById("button_salarycut");

        if (buttonOperational) {
            buttonOperational.addEventListener('click', InsertData);
    
            function InsertData(e) {
                e.preventDefault();
    
                let umkm_working_hour = document.getElementById("working_hour").value;
                let umkm_closing_hour = document.getElementById("closing_hour").value;
    
                const umkmOperationalRef = ref(database, "umkm_operational/" + umkm_uid);
    
                // cEK APAKAH DATANYA ADA
                get(umkmOperationalRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            // KALAU ADA, UPDATE
                            update(umkmOperationalRef, {
                                umkm_working_hour: umkm_working_hour,
                                umkm_closing_hour: umkm_closing_hour
                            })
                                .then(() => {
                                    alert("Data Berhasil Diperbarui!");
                                    location.href = `dashboard.html?uid=${umkm_uid}`;
                                })
                                .catch((error) => {
                                    alert("Gagal memperbarui data: " + error);
                                });
                        } else {
                            // KALAU TAK ADA, TAMBAH BARU
                            set(umkmOperationalRef, {
                                umkm_uid: umkm_uid,
                                umkm_working_hour: umkm_working_hour,
                                umkm_closing_hour: umkm_closing_hour
                            })
                                .then(() => {
                                    alert("Data Berhasil Disimpan!");
                                    location.href = `dashboard.html?uid=${umkm_uid}`;
                                })
                                .catch((error) => {
                                    alert("Gagal menyimpan data: " + error);
                                });
                        }
                    })
                    .catch((error) => {
                        console.error("Error checking data existence: ", error);
                    });
            }
        }

        if (buttonSalarycut) {
            buttonSalarycut.addEventListener('click', InsertData);
    
            function InsertData(e) {
                e.preventDefault();
    
                let umkm_late_cut = document.getElementById("umkm_late_cut").value;
    
                const umkmSalarycutRef = ref(database, "umkm_salarycut/" + umkm_uid);
    
                // cEK APAKAH DATANYA ADA
                get(umkmSalarycutRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            // KALAU ADA, UPDATE
                            update(umkmSalarycutRef, {
                                umkm_late_cut: umkm_late_cut,
                            })
                                .then(() => {
                                    alert("Data Berhasil Diperbarui!");
                                    location.href = `dashboard.html?uid=${umkm_uid}`;
                                })
                                .catch((error) => {
                                    alert("Gagal memperbarui data: " + error);
                                });
                        } else {
                            // KALAU TAK ADA, TAMBAH BARU
                            set(umkmSalarycutRef, {
                                umkm_uid: umkm_uid,
                                umkm_late_cut: umkm_late_cut
                            })
                                .then(() => {
                                    alert("Data Berhasil Disimpan!");
                                    location.href = `dashboard.html?uid=${umkm_uid}`;
                                })
                                .catch((error) => {
                                    alert("Gagal menyimpan data: " + error);
                                });
                        }
                    })
                    .catch((error) => {
                        console.error("Error checking data existence: ", error);
                    });
            }
        }

        //========================================================================================== INSERT DATA END
    })
