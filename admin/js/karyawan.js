// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, update, child, onValue, push, remove  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
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
let currentPage2 = 1;
const itemsPerPage2 = 10;

let currentPage3 = 1;
const itemsPerPage3 = 10;

//KETIKA WEB TERBUKA
window.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("view-karyawan.html")) {
    fetchData();
  }

  if (window.location.pathname.endsWith("karyawan-absent-working.html")) {
    fetchDataWorking();
  }

  if (window.location.pathname.endsWith("karyawan-absent-closing.html")) {
    fetchDataClosing();
  }


  const urlParams = new URLSearchParams(window.location.search);
  umkm_uid = urlParams.get('uid');

  //======= PASS DATA UNTUK KE UPDATE-KARYAWAN START
  const urlParams2 = new URLSearchParams(window.location.search);
  const empNikParam = urlParams2.get('emp_nik');

  const emp_nik_update = document.getElementById("emp_nik_update");
  const emp_name_update = document.getElementById("emp_name_update");
  const emp_hp_update = document.getElementById("emp_hp_update");
  const emp_password_update = document.getElementById("emp_password_update");
  const emp_salary_update = document.getElementById("emp_salary_update");
  const emp_address_update = document.getElementById("emp_address_update");

  if (emp_nik_update) {
    emp_nik_update.value = empNikParam;
  }
  //======= PASS DATA EMP_NIK UNTUK KE UPDATE-KARYAWAN END

  if (window.location.pathname.endsWith("update-karyawan.html")) {
    SelectData();
  }

  if (window.location.pathname.endsWith("karyawan-absent-working.html")) {
    const nextPageButton = document.getElementById("nextPageButton2");
    const prevPageButton = document.getElementById("prevPageButton2");
    const tbody = document.getElementById("tbody1");

    if (nextPageButton && prevPageButton && tbody) {
        nextPageButton.addEventListener("click", () => {
            console.log("Next page button clicked.");
            currentPage2++;
            console.log(`Fetching page ${currentPage2}`);
            fetchDataWorking();
        });

        prevPageButton.addEventListener("click", () => {
            console.log("Previous page button clicked.");
            if (currentPage2 > 1) {
                currentPage2--;
                console.log(`Fetching page ${currentPage2}`);
                fetchDataWorking();
            }
        });
    }
  }

  if (window.location.pathname.endsWith("karyawan-absent-closing.html")) {
    const nextPageButton = document.getElementById("nextPageButton3");
    const prevPageButton = document.getElementById("prevPageButton3");
    const tbody = document.getElementById("tbody1");

    if (nextPageButton && prevPageButton && tbody) {
        nextPageButton.addEventListener("click", () => {
            console.log("Next page button clicked.");
            currentPage3++;
            console.log(`Fetching page ${currentPage2}`);
            fetchDataClosing();
        });

        prevPageButton.addEventListener("click", () => {
            console.log("Previous page button clicked.");
            if (currentPage3 > 1) {
                currentPage3--;
                console.log(`Fetching page ${currentPage3}`);
                fetchDataClosing();
            }
        });
    }
  }

  if (window.location.pathname.endsWith("izin-karyawan.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    umkm_uid = urlParams.get('uid');
    console.log("UMKM UID:", umkm_uid); // Log UMKM UID for debugging
    document.getElementById("filterMonthYear").addEventListener("change", showLeaves);

    if (!umkm_uid) {
      console.error("UMKM UID not found in URL parameters.");
      return;
    }

    populateEmployeeNames();
    setupAddLeaveButton();
  }
});

// ============================================================================== TAMBAH KARYAWAN START

window.addEventListener("DOMContentLoaded", (event) => {
  const buttonAddEmp = document.getElementById("button_add_emp");

  if (buttonAddEmp) {
    buttonAddEmp.addEventListener('click', InsertData);

    function InsertData(e){
      e.preventDefault();
      
      let emp_nik = document.getElementById("emp_nik").value;
      let emp_name = document.getElementById("emp_name").value;
      let emp_hp = document.getElementById("emp_hp").value;
      let emp_password = document.getElementById("emp_password").value;
      let emp_salary = document.getElementById("emp_salary").value;
      let emp_address = document.getElementById("emp_address").value;

      // Referensi ke data karyawan berdasarkan umkm_uid dan emp_nik
      const empRef = ref(database, `employee/${emp_nik}`);

      // Hitung jumlah karyawan yang aktif
      let activeEmployeeCount = 0;

      // Mendapatkan snapshot dari database
      onValue(empRef, (snapshot) => {
        if (snapshot.exists()) {
          const existingData = snapshot.val();
          if (existingData.emp_status === "active") {
            activeEmployeeCount++;
          }
        }

        // Jika jumlah karyawan aktif sudah mencapai 99, munculkan pesan gagal
        if (activeEmployeeCount >= 99) {
          alert("Tidak dapat menambahkan karyawan baru. Jumlah karyawan aktif sudah mencapai batas maksimum (99).");
          return;
        }

        // Jika karyawan belum terdaftar, simpan data baru
        set(empRef, {
          umkm_uid: umkm_uid,
          emp_nik: emp_nik,
          emp_name: emp_name,
          emp_hp: emp_hp,
          emp_password: emp_password,
          emp_salary: emp_salary,
          emp_address: emp_address,
          emp_status: "active"
        })
        .then(() => {
          alert("Data Berhasil Disimpan !");
          location.href = `view-karyawan.html?uid=${umkm_uid}`;
        })
        .catch((error) => {
          alert("Data Gagal Disimpan ! " + error);
        });
      }, {
        onlyOnce: true // Mendapatkan snapshot hanya sekali
      });
    }
  }
});

// ============================================================================== TAMBAH KARYAWAN END


// ============================================================================== UPDATE KARYAWAN START
  function SelectData(){ //digunakan di DOM
    const databaseref = ref(database);

    get(child(databaseref,"employee/"+ emp_nik_update.value)).then((snapshot)=>{
      if(snapshot.exists()){
        emp_name_update.value = snapshot.val().emp_name;
        emp_hp_update.value = snapshot.val().emp_hp;
        emp_password_update.value = snapshot.val().emp_password;
        emp_salary_update.value = snapshot.val().emp_salary;
        emp_address_update.value = snapshot.val().emp_address;
      }
      else{
        alert("Data tidak ditemukan !")
      }
    })
  }

  window.addEventListener("DOMContentLoaded", (event) => {
    const buttonUpdateEmp = document.getElementById("button_update_emp");
    
    if (buttonUpdateEmp) {
      buttonUpdateEmp.addEventListener('click', UpdateData);

      function UpdateData(e){
        e.preventDefault();

        let emp_nik_update = document.getElementById("emp_nik_update").value;
        let emp_name_update = document.getElementById("emp_name_update").value;
        let emp_hp_update = document.getElementById("emp_hp_update").value;
        let emp_password_update = document.getElementById("emp_password_update").value;
        let emp_salary_update = document.getElementById("emp_salary_update").value;
        let emp_address_update = document.getElementById("emp_address_update").value;

        update(ref(database, "employee/"+ emp_nik_update),{
          emp_nik: emp_nik_update,
          emp_name: emp_name_update,
          emp_hp: emp_hp_update,
          emp_password: emp_password_update,
          emp_salary: emp_salary_update,
          emp_address: emp_address_update
        })
        .then(()=>{
          alert("Data Berhasil Diubah !")
          location.href = `view-karyawan.html?uid=${umkm_uid}`;
        })
        .catch((error)=>{
          alert("Data Gagal Diubah !", +error)
        })
      } 
    }
  })
// ============================================================================== UPDATE KARYAWAN END


// ============================================================================== UPDATE KARYAWAN STATUS START
window.addEventListener("DOMContentLoaded", (event) => {
  const tbody = document.getElementById("tbody1");

  // handle click button inactive karyawan
  tbody.addEventListener("click", (e) => {
    if (e.target && e.target.id === "button_inactive_emp") {
      const row = e.target.closest("tr");
      if (row) {
        const empNikToUpdate = row.querySelector("td:nth-child(2)").textContent;
        updateEmployeeStatus(empNikToUpdate);
      }
    }
  });
});

function updateEmployeeStatus(empNikToUpdate) {
  console.log("Updating employee status for empNik:", empNikToUpdate); // Tambahkan log ini untuk memeriksa nilai empNikToUpdate

  const confirmUpdate = confirm("Apakah anda ingin mengubah status karyawan menjadi nonaktif?");
  if (confirmUpdate) {
    // update status karyawan menjadi inactive di database
    const employeeRef = ref(database, `employee/${empNikToUpdate}`);
    update(employeeRef, { emp_status: "inactive" })
      .then(() => {
        console.log("Employee status successfully updated to 'inactive'"); // Tambahkan log ini untuk memastikan update berhasil
        alert("Status karyawan berhasil diubah!");
        fetchData(); // fetch ulang setelah update
      })
      .catch((error) => {
        console.error("Error updating employee status:", error);
        alert("Error updating employee status: " + error);
      });
  }
}
// ============================================================================== UPDATE KARYAWAN STATUS END


// ============================================================================== FETCH KARYAWAN START

let currentPage = 1;
const itemsPerPage = 10;

// event listener buat halaman selanjutnya
document.getElementById("nextPageButton").addEventListener("click", () => {
    currentPage++;
    console.log(`Mengambil halaman ${currentPage}`);
    fetchData();
});

document.getElementById("prevPageButton").addEventListener("click", () => {
  if (currentPage > 1) {
      currentPage--;
      console.log(`Mengambil halaman ${currentPage}`);
      fetchData();
  }
});

function fetchData() {
    console.log("Mengambil data...");
    const tbody = document.getElementById("tbody1");

    // Bersihkan baris tabel yang sudah ada
    tbody.innerHTML = "";

    // Referensi ke node "employee" di database
    const employeesRef = ref(database, "employee");

    // Ambil data saat nilai berubah di node "employee"
    onValue(employeesRef, (snapshot) => {
        const employeesData = snapshot.val();

        if (employeesData) {
            let count = 1;
            let startIndex = (currentPage - 1) * itemsPerPage;

            // Sesuaikan startIndex untuk halaman kedua dan seterusnya
            if (currentPage > 1) {
                startIndex += 1; // Atur indeks awal untuk halaman kedua
            }

            // Loop untuk setiap karyawan dalam data
            for (const empNik in employeesData) {
                const employee = employeesData[empNik];

                // Periksa apakah umkm_uid cocok dengan umkm_uid saat ini dan status adalah "active"
                if (employee.umkm_uid === umkm_uid && employee.emp_status === "active") {
                    // Konversi gaji ke format mata uang
                    const formattedSalary = Number(employee.emp_salary).toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                    });

                    // Jika count melebihi item pada halaman saat ini, hentikan loop
                    if (count >= startIndex && count <= currentPage * itemsPerPage) { // Sesuaikan kondisi
                        // Periksa apakah baris sudah ada
                        const existingRow = document.getElementById(`row-${employee.emp_nik}`);

                        if (existingRow) {
                            // Perbarui baris yang sudah ada dengan data baru
                            existingRow.innerHTML = `
                                <th scope="row">${count}</th>
                                <td>${employee.emp_nik}</td>
                                <td>${employee.emp_name}</td>
                                <td>${formattedSalary}</td>
                                <td>
                                    <div class="d-flex">
                                        <a href="update-karyawan.html?emp_nik=${employee.emp_nik}&uid=${umkm_uid}" class="btn btn-info btn-sm me-1">Edit</a>
                                        <button type="button" class="btn btn-danger btn-sm me-1" id="button_inactive_emp">Nonaktif</button>
                                    </div>
                                </td>
                            `;
                        } else {
                            // Jika belum ada, buat baris baru
                            const newRow = document.createElement("tr");
                            newRow.id = `row-${employee.emp_nik}`;
                            newRow.innerHTML = `
                                <th scope="row">${count}</th>
                                <td>${employee.emp_nik}</td>
                                <td>${employee.emp_name}</td>
                                <td>${formattedSalary}</td>
                                <td>
                                    <div class="d-flex justify-content-between">
                                        <a href="update-karyawan.html?emp_nik=${employee.emp_nik}&uid=${umkm_uid}" class="btn btn-info btn-sm">Edit</a>
                                        <button type="button" class="btn btn-danger btn-sm me-1" id="button_inactive_emp">Nonaktif</button>
                                    </div>
                                </td>
                            `;
                            // Sisipkan baris ke dalam tabel
                            tbody.appendChild(newRow);
                        } 
                    }

                    count++;
                }
            }

            console.log(`Pengambilan data selesai. Jumlah: ${count}, StartIndex: ${startIndex}, Halaman Saat Ini: ${currentPage}`);
        }
    });
}

// Ambil data pertama kali saat halaman dimuat
fetchData();

// ============================================================================== FETCH KARYAWAN END


// ============================================================================== FETCH KARYAWAN INACTIVE START
// Fungsi untuk mengambil data karyawan tidak aktif
function fetchInactiveEmployees() {
  const list = document.getElementById("inactiveEmployeeList");

  // Kosongkan elemen daftar jika sudah ada
  list.innerHTML = "";

  // Referensi ke node "employee" di database
  const employeesRef = ref(database, "employee");

  // Ambil data saat nilai berubah di node "employee"
  onValue(employeesRef, (snapshot) => {
    const employeesData = snapshot.val();

    if (employeesData) {
      let count = 1;
      let activeEmployeeCount = 0; // Inisialisasi hitungan untuk karyawan aktif

      // Loop melalui setiap karyawan dalam data
      for (const empNik in employeesData) {
        const employee = employeesData[empNik];

        // Periksa apakah statusnya "inactive"
        if (employee.umkm_uid === umkm_uid && employee.emp_status === "inactive") {
          // Konversi gaji ke format mata uang
          const formattedSalary = Number(employee.emp_salary).toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
          });

          // Buat elemen daftar baru
          const listItem = document.createElement("li");
          listItem.className = "list-group-item";
          listItem.innerHTML = `
            ${count}. NIK: ${employee.emp_nik}, Nama: ${employee.emp_name}
            <button type="button" class="btn btn-success btn-sm activate-btn" data-emp-nik="${empNik}">Aktifkan</button>
          `;
          // Sisipkan elemen daftar ke dalam daftar
          list.appendChild(listItem);

          // Tambahkan hitungan untuk karyawan tidak aktif
          count++;

          // Periksa apakah karyawan aktif
          if (employee.emp_status === "active") {
            activeEmployeeCount++; // Tambahkan hitungan untuk karyawan aktif
          }
        }
      }

      console.log(`Data karyawan tidak aktif diambil. Hitungan: ${count}`);

      // Tambahkan event listener pada tombol "Aktifkan" hanya jika jumlah karyawan aktif kurang dari atau sama dengan 99
      if (activeEmployeeCount <= 99) {
        const activateBtns = document.querySelectorAll(".activate-btn");
        activateBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            const empNik = btn.getAttribute("data-emp-nik");
            activateEmployee(empNik);
          });
        });
      } else {
        console.log("Total karyawan aktif tidak boleh lebih dari 99. Tombol Aktifkan dinonaktifkan.");
        alert("Total karyawan aktif tidak boleh lebih dari 99. Tombol Aktifkan dinonaktifkan.");
      }
    }
  });
}

// Fungsi untuk mengaktifkan seorang karyawan
function activateEmployee(empNik) {
  // Referensi ke node karyawan spesifik di database
  const employeeRef = ref(database, `employee/${empNik}`);

  // Perbarui status karyawan menjadi "active"
  update(employeeRef, {
      emp_status: "active"
  }).then(() => {
      console.log(`Karyawan dengan NIK ${empNik} telah diaktifkan.`);
      // Perbarui daftar karyawan tidak aktif
      fetchInactiveEmployees();
      // Opsional, perbarui daftar karyawan aktif jika diperlukan
      fetchData();
  }).catch((error) => {
      console.error("Error activating employee:", error);
  });
}


// Tambahkan event listener untuk membuka modal dan mengambil data karyawan tidak aktif
document.querySelector("#showInactiveEmployeeModal").addEventListener("click", () => {
  fetchInactiveEmployees();
});

// ============================================================================== FETCH KARYAWAN INACTIVE END


// ============================================================================== FETCH ABSEN PULANG START

// Fungsi untuk menangani pembagian halaman
async function handlePagination2(dataArray, tbody) {
  const startIndex = (currentPage3 - 1) * itemsPerPage3;
  const endIndex = startIndex + itemsPerPage3;

  const promises = [];
  const employeeRef = ref(database, "employee"); // Tentukan employeeRef di sini

  // Loop melalui entri yang diurutkan dengan entri terbaru pertama
  for (let i = startIndex; i < dataArray.length && i < endIndex; i++) {
    const employee_absent_closing = dataArray[i];

    // Periksa apakah umkm_uid cocok
    if (employee_absent_closing.umkm_uid === umkm_uid) {
      // Ambil data karyawan yang sesuai menggunakan emp_nik
      const sanitizedKey = employee_absent_closing.emp_nik.replace(/[\.\#\$\[\]]/g, '_');
      const employeeRefByKey = child(employeeRef, sanitizedKey);

      // Buat promise untuk setiap operasi ambil
      const promise = get(employeeRefByKey).then((employeeSnapshot) => {
        const employee = employeeSnapshot.val();

        // Buat pengenal unik untuk setiap baris
        const rowIdentifier = `${employee_absent_closing.emp_nik}-${employee_absent_closing.absent_date}`;

        const formattedSalaryCut = Number(employee_absent_closing.absent_late_cut).toLocaleString('id-ID', {
          style: 'currency',
          currency: 'IDR',
        });

        // Buat baris baru
        const newRow = document.createElement("tr");
        newRow.id = `row-${rowIdentifier}`;
        newRow.innerHTML = `
          <td>${employee.emp_name}</td>
          <td>${employee_absent_closing.absent_date}</td>
          <td>${employee_absent_closing.absent_time}</td>
          <td>${parseFloat(employee_absent_closing.longitude).toFixed(7)} & ${parseFloat(employee_absent_closing.latitude).toFixed(7)}</td>
        `;

        return newRow;
      }).catch(error => {
        console.error("Error fetching employee data:", error);
        return null;
      });

      // Tambahkan promise ke dalam array
      promises.push(promise);
    }
  }

  // Gunakan Promise.all untuk menunggu semua promise selesai
  const rows = await Promise.all(promises);

  // Perbarui antarmuka pengguna dengan data yang diambil
  updateUI2(rows, tbody);

  // Nonaktifkan/Aktifkan tombol "Next" dan "Previous" berdasarkan halaman saat ini
  const totalItems = dataArray.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage3);
  const nextButton = document.getElementById("nextPageButton3");
  const prevButton = document.getElementById("prevPageButton3");

  if (currentPage3 === totalPages) {
      // Jika di halaman terakhir, nonaktifkan tombol "Next"
      nextButton.disabled = true;
  } else {
      // Jika tidak, aktifkan tombol "Next"
      nextButton.disabled = false;
  }

  if (currentPage3 === 1) {
      // Jika di halaman pertama, nonaktifkan tombol "Previous"
      prevButton.disabled = true;
  } else {
      // Jika tidak, aktifkan tombol "Previous"
      prevButton.disabled = false;
  }
}

// Fungsi untuk memperbarui antarmuka pengguna dengan baris yang diambil
function updateUI2(rows, tbody) {
  // Pastikan elemen tbody tersedia
  if (tbody) {
    // Bersihkan konten tbody yang sudah ada
    tbody.innerHTML = '';

    // Tambahkan baris-baris ke dalam tbody
    rows.forEach((row) => {
      if (row) {
        tbody.appendChild(row);
      }
    });
  }
}

// Fungsi untuk mengambil data secara awal dan menangani pembagian halaman untuk penutupan
function fetchDataClosing() {
  const tbody = document.getElementById("tbody1");
  const filterDateInput = document.getElementById("filterDateInput");
  const clearFilterButton = document.getElementById("clearFilterButton");

  // Referensi ke node "employee_absent_closing" di database
  const absentclosingRef = ref(database, "employee_absent_closing");
  const employeeRef = ref(database, "employee");

  // Ambil data saat nilai berubah di node "employee_absent_closing"
  onValue(absentclosingRef, (snapshot) => {
    const absentclosingData = snapshot.val();

    if (absentclosingData) {
      // Konversi data menjadi array untuk disorting
      let dataArray = Object.values(absentclosingData);

      // Filter data berdasarkan tanggal yang dipilih
      const selectedDate = filterDateInput.value;
      if (selectedDate) {
        dataArray = dataArray.filter(entry => entry.absent_date === selectedDate);
      }

      // Urutkan array secara menurun berdasarkan tanggal dan waktu absen (terbaru dulu)
      dataArray.sort((a, b) => {
        const dateTimeA = new Date(`${a.absent_date} ${a.absent_time}`);
        const dateTimeB = new Date(`${b.absent_date} ${b.absent_time}`);
        return dateTimeB - dateTimeA;
      });

      // Tangani pembagian halaman dan perbarui antarmuka pengguna
      handlePagination2(dataArray, tbody);
    }
  });

  // Tambahkan event listener untuk memfilter berdasarkan tanggal
  filterDateInput.addEventListener('change', fetchDataClosing);

  // Tambahkan event listener untuk membersihkan filter
  clearFilterButton.addEventListener('click', () => {
    // Kosongkan input filter
    filterDateInput.value = '';
    // Ambil ulang data untuk menghapus filter
    fetchDataClosing();
  });
}

if (window.location.pathname.endsWith("karyawan-absent-closing.html")) {
  // Ambil data pertama kali saat halaman dimuat
  fetchDataClosing();
}


// ============================================================================== FETCH ABSEN PULANG END

// ============================================================================== FETCH ABSEN MASUK START
// Fungsi untuk menangani pembagian halaman
async function handlePagination(dataArray, tbody) {
  const startIndex = (currentPage2 - 1) * itemsPerPage2;
  const endIndex = startIndex + itemsPerPage2;

  const promises = [];
  const employeeRef = ref(database, "employee"); // Tentukan employeeRef di sini

  // Loop melalui entri yang diurutkan dengan entri terbaru pertama
  for (let i = startIndex; i < dataArray.length && i < endIndex; i++) {
    const employee_absent_working = dataArray[i];

    // Periksa apakah umkm_uid cocok
    if (employee_absent_working.umkm_uid === umkm_uid) {
      // Ambil data karyawan yang sesuai menggunakan emp_nik
      const sanitizedKey = employee_absent_working.emp_nik.replace(/[\.\#\$\[\]]/g, '_');
      const employeeRefByKey = child(employeeRef, sanitizedKey);

      // Buat promise untuk setiap operasi ambil
      const promise = get(employeeRefByKey).then((employeeSnapshot) => {
        const employee = employeeSnapshot.val();

        // Buat pengenal unik untuk setiap baris
        const rowIdentifier = `${employee_absent_working.emp_nik}-${employee_absent_working.absent_date}`;

        const formattedSalaryCut = Number(employee_absent_working.absent_late_cut).toLocaleString('id-ID', {
          style: 'currency',
          currency: 'IDR',
        });

        // Buat baris baru
        const newRow = document.createElement("tr");
        newRow.id = `row-${rowIdentifier}`;
        newRow.innerHTML = `
          <td>${employee.emp_name}</td>
          <td>${employee_absent_working.absent_date}</td>
          <td>${employee_absent_working.absent_time}</td>
          <td>${employee_absent_working.absent_late_cut}</td>
          <td>${parseFloat(employee_absent_working.longitude).toFixed(7)} & ${parseFloat(employee_absent_working.latitude).toFixed(7)}</td>
        `;

        return newRow;
      }).catch(error => {
        console.error("Error fetching employee data:", error);
        return null;
      });

      // Tambahkan promise ke dalam array
      promises.push(promise);
    }
  }

  // Gunakan Promise.all untuk menunggu semua promise selesai
  const rows = await Promise.all(promises);

  // Perbarui antarmuka pengguna dengan data yang diambil
  updateUI(rows, tbody);

  // Nonaktifkan/Aktifkan tombol "Next" dan "Previous" berdasarkan halaman saat ini
  const totalItems = dataArray.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage2);
  const nextButton = document.getElementById("nextPageButton2");
  const prevButton = document.getElementById("prevPageButton2");

  if (currentPage2 === totalPages) {
      // Jika di halaman terakhir, nonaktifkan tombol "Next"
      nextButton.disabled = true;
  } else {
      // Jika tidak, aktifkan tombol "Next"
      nextButton.disabled = false;
  }

  if (currentPage2 === 1) {
      // Jika di halaman pertama, nonaktifkan tombol "Previous"
      prevButton.disabled = true;
  } else {
      // Jika tidak, aktifkan tombol "Previous"
      prevButton.disabled = false;
  }
}

// Fungsi untuk memperbarui antarmuka pengguna dengan baris yang diambil
function updateUI(rows, tbody) {
  // Pastikan elemen tbody tersedia
  if (tbody) {
    // Bersihkan konten tbody yang sudah ada
    tbody.innerHTML = '';

    // Tambahkan baris-baris ke dalam tbody
    rows.forEach((row) => {
      if (row) {
        tbody.appendChild(row);
      }
    });
  }
}

// Fungsi untuk mengambil data secara awal dan menangani pembagian halaman
function fetchDataWorking() {
  const tbody = document.getElementById("tbody1");
  const filterDateInput = document.getElementById("filterDateInput");
  const clearFilterButton = document.getElementById("clearFilterButton");

  // Referensi ke node "employee_absent_working" di database
  const absentworkingRef = ref(database, "employee_absent_working");
  const employeeRef = ref(database, "employee");

  // Ambil data saat nilai berubah di node "employee_absent_working"
  onValue(absentworkingRef, (snapshot) => {
    const absentworkingData = snapshot.val();

    if (absentworkingData) {
      // Konversi data menjadi array untuk disorting
      let dataArray = Object.values(absentworkingData);

      // Filter data berdasarkan tanggal yang dipilih
      const selectedDate = filterDateInput.value;
      if (selectedDate) {
        dataArray = dataArray.filter(entry => entry.absent_date === selectedDate);
      }

      // Urutkan array secara menurun berdasarkan tanggal dan waktu absen (terbaru dulu)
      dataArray.sort((a, b) => {
        const dateTimeA = new Date(`${a.absent_date} ${a.absent_time}`);
        const dateTimeB = new Date(`${b.absent_date} ${b.absent_time}`);
        return dateTimeB - dateTimeA;
      });

      // Tangani pembagian halaman dan perbarui antarmuka pengguna
      handlePagination(dataArray, tbody);
    }
  });

  // Tambahkan event listener untuk memfilter berdasarkan tanggal
  filterDateInput.addEventListener('change', fetchDataWorking);

  // Tambahkan event listener untuk membersihkan filter
  clearFilterButton.addEventListener('click', () => {
    // Kosongkan input filter
    filterDateInput.value = '';
    // Ambil ulang data untuk menghapus filter
    fetchDataWorking();
  });
}

if (window.location.pathname.endsWith("karyawan-absent-working.html")) {
  // Ambil data pertama kali saat halaman dimuat
  fetchDataWorking();
}

// ============================================================================== FETCH ABSEN MASUK END

// ============================================================================== IZIN KARYAWAN START

function setupAddLeaveButton() {
  const buttonAddLeave = document.getElementById("button_add_leave");
  if (buttonAddLeave) {
    buttonAddLeave.addEventListener("click", InsertLeaveData);
  }
}

function InsertLeaveData(e) {
  e.preventDefault();

  const employeeSelect = document.getElementById("employee_name");
  const employeeNik = employeeSelect.options[employeeSelect.selectedIndex].value;
  const employeeName = employeeSelect.options[employeeSelect.selectedIndex].text;
  const leaveDate = document.getElementById("leave_date").value;
  const leaveReason = document.getElementById("leave_reason").value;

  if (!employeeNik || !leaveDate || !leaveReason) {
    alert("Semua field harus diisi!");
    return;
  }

  // Generate a unique key by removing all symbols from emp_nik and leave_date
  const sanitizedNik = employeeNik.replace(/[^a-zA-Z0-9]/g, '');
  const sanitizedDate = leaveDate.replace(/[^a-zA-Z0-9]/g, '');
  const leaveKey = `${sanitizedNik}${sanitizedDate}`;

  const leaveData = {
    emp_nik: employeeNik,
    emp_name: employeeName,
    leave_date: leaveDate,
    leave_reason: leaveReason,
    umkm_uid: umkm_uid
  };

  const leaveRef = ref(database, `emp_permit/${leaveKey}`);
  set(leaveRef, leaveData)
    .then(() => {
      alert("Izin berhasil disimpan.");
      document.getElementById("employee_name").value = "";
      document.getElementById("leave_date").value = "";
      document.getElementById("leave_reason").value = "";
    })
    .catch((error) => {
      console.error("Error saving leave:", error);
      alert("Gagal menyimpan izin. Silakan coba lagi.");
    });
}

function populateEmployeeNames() {
  const employeeSelect = document.getElementById("employee_name");
  const employeesRef = ref(database, "employee");

  onValue(employeesRef, (snapshot) => {
    const employeesData = snapshot.val();
    console.log("Fetched Employees Data:", employeesData); // Log fetched employee data for debugging
    employeeSelect.innerHTML = ""; // Clear existing options

    if (employeesData) {
      let hasActiveEmployees = false;
      for (const empNik in employeesData) {
        const employee = employeesData[empNik];
        console.log(`Checking employee: ${employee.emp_name}, umkm_uid: ${employee.umkm_uid}, emp_status: ${employee.emp_status}`); // Detailed log for each employee
        if (employee.umkm_uid === umkm_uid && employee.emp_status === "active") {
          hasActiveEmployees = true;
          const option = document.createElement("option");
          option.value = employee.emp_nik; // Use emp_nik as value
          option.textContent = employee.emp_name;
          employeeSelect.appendChild(option);
        }
      }
      if (!hasActiveEmployees) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No active employees found";
        employeeSelect.appendChild(option);
      }
    } else {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No employees data found";
      employeeSelect.appendChild(option);
    }
  }, (error) => {
    console.error("Error fetching employee data:", error.message);
  });
}

function showLeaves() {
  const selectedMonthYear = document.getElementById("filterMonthYear").value;
  console.log("Selected Month-Year:", selectedMonthYear); // Debug log

  if (!selectedMonthYear) {
    alert("Pilih bulan dan tahun terlebih dahulu.");
    return;
  }

  const [selectedYear, selectedMonth] = selectedMonthYear.split("-");
  const leavesRef = ref(database, "emp_permit");

  onValue(leavesRef, (snapshot) => {
    const leavesData = snapshot.val();
    const leaveListContent = document.getElementById("leaveListContent");
    leaveListContent.innerHTML = "";

    console.log("Leaves Data:", leavesData); // Debug log

    if (leavesData) {
      let hasLeaves = false;
      for (const key in leavesData) {
        const leave = leavesData[key];
        if (leave.umkm_uid === umkm_uid) {
          const leaveDate = new Date(leave.leave_date);
          const leaveYear = leaveDate.getFullYear().toString();
          const leaveMonth = (leaveDate.getMonth() + 1).toString().padStart(2, "0");

          if (leaveYear === selectedYear && leaveMonth === selectedMonth) {
            hasLeaves = true;
            const listItem = document.createElement("li");
            listItem.className = "list-group-item d-flex justify-content-between align-items-center";
            listItem.textContent = `${leave.emp_name}: ${leave.leave_date} - ${leave.leave_reason}`;

            const removeButton = document.createElement("button");
            removeButton.className = "btn btn-danger btn-sm";
            removeButton.textContent = "X";
            removeButton.addEventListener("click", () => {
              removeLeave(key);
            });

            listItem.appendChild(removeButton);
            leaveListContent.appendChild(listItem);
          }
        }
      }
      if (!hasLeaves) {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item";
        listItem.textContent = "Tidak ada izin/cuti pada bulan ini.";
        leaveListContent.appendChild(listItem);
      }
    } else {
      const listItem = document.createElement("li");
      listItem.className = "list-group-item";
      listItem.textContent = "Tidak ada izin/cuti pada bulan ini.";
      leaveListContent.appendChild(listItem);
    }
  });
}

function removeLeave(key) {
  const leaveRef = ref(database, `emp_permit/${key}`);
  remove(leaveRef).then(() => {
    alert("Izin berhasil dihapus.");
    showLeaves(); // Refresh the list
  }).catch((error) => {
    console.error('Error removing leave:', error);
    alert("Gagal menghapus izin. Silakan coba lagi.");
  });
}

// Ensure the modal button event is set up correctly
document.querySelector("#showInactiveEmployeeModal").addEventListener("click", () => {
  fetchInactiveEmployees();
  showLeaves(); // Also call showLeaves to ensure it updates when modal is opened
});

// ============================================================================== IZIN KARYAWAN END

