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

        //========================================================================================== INSERT DATA END

    //========================================================================================== HARI LIBUR MULAI
const addDateButton = document.getElementById("add_date_button");
const holidayList = document.getElementById("holiday_list");
const buttonAddHolidays = document.getElementById("button_add_holidays");
const holidayDatesContainer = document.getElementById("holiday_dates_container");
const filterMonthYear = document.getElementById("filterMonthYear");
const holidayListContent = document.getElementById("holidayListContent");

let holidayDates = [];

if (addDateButton) {
  addDateButton.addEventListener("click", () => {
    const holidayInputWrapper = document.createElement("div");
    holidayInputWrapper.className = "input-group mb-2";

    const holidayInput = document.createElement("input");
    holidayInput.type = "date";
    holidayInput.className = "form-control";
    holidayInput.required = true;

    const removeButton = document.createElement("button");
    removeButton.className = "btn btn-danger";
    removeButton.textContent = "X";
    removeButton.type = "button";
    removeButton.addEventListener("click", () => {
      holidayInputWrapper.remove();
    });

    holidayInputWrapper.appendChild(holidayInput);
    holidayInputWrapper.appendChild(removeButton);

    holidayDatesContainer.appendChild(holidayInputWrapper);
  });
}

if (buttonAddHolidays) {
  buttonAddHolidays.addEventListener("click", (e) => {
    e.preventDefault();

    holidayDates = [];
    const holidayInputs = holidayDatesContainer.querySelectorAll("input[type='date']");
    holidayInputs.forEach(input => {
      if (input.value) {
        holidayDates.push(input.value);
      }
    });

    if (holidayDates.length === 0) {
      alert("Tambahkan tanggal hari libur terlebih dahulu.");
      return;
    }

    if (!umkm_uid) {
      alert("User tidak ditemukan. Silakan login ulang.");
      return;
    }

    const holidaysData = {};
    holidayDates.forEach((date, index) => {
      holidaysData[`holiday${index}`] = date;
    });

    const holidaysRef = ref(database, `umkm_holiday/${umkm_uid}`);
    set(holidaysRef, holidaysData).then(() => {
      alert("Hari libur berhasil disimpan.");
      holidayDates = [];
      holidayList.innerHTML = "";
      holidayDatesContainer.innerHTML = '<div class="input-group mb-2"><input class="form-control" required="" type="date" id="holiday_dates"><button class="btn btn-danger" type="button">X</button></div>';
    }).catch((error) => {
      console.error('Error saving holidays:', error);
      alert("Gagal menyimpan hari libur. Silakan coba lagi.");
    });
  });
}

function showHolidays() {
  const selectedMonthYear = filterMonthYear.value;
  if (!selectedMonthYear) {
    alert("Pilih bulan dan tahun terlebih dahulu.");
    return;
  }

  const [selectedYear, selectedMonth] = selectedMonthYear.split("-");
  const holidaysRef = ref(database, `umkm_holiday/${umkm_uid}`);

  onValue(holidaysRef, (snapshot) => {
    const holidaysData = snapshot.val();
    holidayListContent.innerHTML = "";

    if (holidaysData) {
      for (const key in holidaysData) {
        const holidayDate = holidaysData[key];
        const holiday = new Date(holidayDate);
        const holidayYear = holiday.getFullYear().toString();
        const holidayMonth = (holiday.getMonth() + 1).toString().padStart(2, "0");

        if (holidayYear === selectedYear && holidayMonth === selectedMonth) {
          const listItem = document.createElement("li");
          listItem.className = "list-group-item d-flex justify-content-between align-items-center";
          listItem.textContent = holidayDate;

          const removeButton = document.createElement("button");
          removeButton.className = "btn btn-danger btn-sm";
          removeButton.textContent = "X";
          removeButton.addEventListener("click", () => {
            removeHoliday(key);
          });

          listItem.appendChild(removeButton);
          holidayListContent.appendChild(listItem);
        }
      }
    } else {
      const listItem = document.createElement("li");
      listItem.className = "list-group-item";
      listItem.textContent = "No holidays found for the selected month and year.";
      holidayListContent.appendChild(listItem);
    }
  });
}

function removeHoliday(key) {
  const holidayRef = ref(database, `umkm_holiday/${umkm_uid}/${key}`);
  remove(holidayRef).then(() => {
    alert("Hari libur berhasil dihapus.");
    showHolidays(); // Refresh the list
  }).catch((error) => {
    console.error('Error removing holiday:', error);
    alert("Gagal menghapus hari libur. Silakan coba lagi.");
  });
}

filterMonthYear.addEventListener("change", showHolidays);

//========================================================================================== HARI LIBUR SELESAI

    })

