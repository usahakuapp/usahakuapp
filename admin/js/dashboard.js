import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

window.addEventListener("DOMContentLoaded", (event) => {
    const modalLoading = document.getElementById("modalLoading");
    modalLoading.style.display = "block";

    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (window.location.pathname.endsWith("dashboard.html")) {
                displayUmkmName(user.uid);
                generateQrCode(user.uid);
                updateAndDisplayEmployeeCount(user.uid);
                displayUmkmOperational(user.uid)
                displayCurrentDate();
                setTimeout(() => {
                    modalLoading.style.display = "none";
                }, 1500);
            }
            
            const dashboardLink = document.querySelector("#dashboard-link");
            dashboardLink.href = `dashboard.html?uid=${user.uid}`;

            const dashboardLinkSidebar = document.querySelector("#dashboard-link-sidebar");
            dashboardLinkSidebar.href = `dashboard.html?uid=${user.uid}`;

            const dashboardLinkFooter = document.querySelector("#dashboard-link-footer");
            dashboardLinkFooter.href = `dashboard.html?uid=${user.uid}`;

            const addKaryawanLink = document.querySelector("#add-karyawan-link");
            addKaryawanLink.href = `add-karyawan.html?uid=${user.uid}`;

            const viewKaryawanLink = document.querySelector("#view-karyawan-link");
            viewKaryawanLink.href = `view-karyawan.html?uid=${user.uid}`;

            const karyawanabsentworkingLink = document.querySelector("#karyawan-absent-working");
            karyawanabsentworkingLink.href = `karyawan-absent-working.html?uid=${user.uid}`;

            const karyawanabsentclosingLink = document.querySelector("#karyawan-absent-closing");
            karyawanabsentclosingLink.href = `karyawan-absent-closing.html?uid=${user.uid}`;

            const umkmOperationalLink = document.querySelector("#umkm-operational-link");
            umkmOperationalLink.href = `umkm-operational.html?uid=${user.uid}`;

            const umkmSalarycutLink = document.querySelector("#umkm-salarycut-link");
            umkmSalarycutLink.href = `umkm-salarycut.html?uid=${user.uid}`;
            
            const reportAbsentWorkingLink = document.querySelector("#report-absent-working-link");
            reportAbsentWorkingLink.href = `report-absent-working.html?uid=${user.uid}`;

            const reportAllSalaryLink = document.querySelector("#report-allsalary-link");
            reportAllSalaryLink.href = `report-allsalary.html?uid=${user.uid}`;

            const reportSalaryLink = document.querySelector("#report-salary-link");
            reportSalaryLink.href = `report-salary.html?uid=${user.uid}`;
        } else {
            console.log("Admin belum login !");
        }
    });

    const userLoggedIn = localStorage.getItem('userLoggedIn');
    if (!userLoggedIn) {
        // Jika tidak ada informasi login, arahkan kembali ke halaman login
        alert("Anda belum login. Anda akan dialihkan ke halaman login.");
        location.href = "../login.html";
    }else{
    }

    // Pastikan halaman tidak disimpan dalam cache browser
    window.onload = function() {
        if (window.location.href.indexOf("login.html") === -1) {
            if (window.history.state != "login") {
                window.history.pushState("login", null, null);
                window.onpopstate = function() {
                    window.history.pushState('login', null, null);
                    // Tambahkan kode di sini untuk mengarahkan kembali pengguna ke halaman login
                    location.href = "../login.html";
                };
            }
        }
    }

    setTimeout(() => {
        modalLoading.style.display = "none";
    }, 1500);
});

// Saat tombol logout ditekan
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
  logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    // Lakukan proses logout
    signOut(auth).then(() => {
      // Hapus informasi login dari localStorage
      localStorage.removeItem('userLoggedIn');
      // Redirect ke halaman login
      location.href = "../login.html";
    }).catch((error) => {
      // Handle error
      console.error('Error signing out:', error);
    });
  });
}

//================================================================================= DISPLAY & QR START

function displayUmkmName(uid) {
    const umkmRef = ref(database, `umkm/${uid}/umkm_name`);

    onValue(umkmRef, (snapshot) => {
        const umkmName = snapshot.val();
        if (umkmName) {
            const umkmNameElement = document.getElementById("umkmName");
            if (umkmNameElement) {
                umkmNameElement.textContent = umkmName;
            }
        }
    });
}

function displayUmkmOperational(uid) {
    const umkmOperationalRef = ref(database, `umkm_operational/${uid}`);

    onValue(umkmOperationalRef, (snapshot) => {
        const umkmData = snapshot.val();
        if (umkmData) {
            const umkm_working_hour = umkmData.umkm_working_hour;
            const umkm_closing_hour = umkmData.umkm_closing_hour;

            const umkmWorkingHourElement = document.getElementById("working_hour");
            const umkmClosingHourElement = document.getElementById("closing_hour");

            if (umkmWorkingHourElement && umkmClosingHourElement) {
                umkmWorkingHourElement.textContent = `${umkm_working_hour}`;
                umkmClosingHourElement.textContent = `${umkm_closing_hour}`;
            }
        }
    });
}

function updateAndDisplayEmployeeCount(uid) {
    const employeeRef = ref(database, "employee");

    onValue(employeeRef, (snapshot) => {
        const employeesData = snapshot.val();
        let employeeCount = 0;

        if (employeesData) {
            // loop setiap data karyawan
            for (const empNik in employeesData) {
                const employee = employeesData[empNik];

                // cek kecocokan data umkm
                if (employee.umkm_uid === uid) {
                    employeeCount++;
                }
            }
        }

        // display jumlah karyawan
        const empCountElement = document.getElementById("empCount");
        if (empCountElement) {
            empCountElement.textContent = employeeCount;
        }
    });
}

function displayCurrentDate() {
    const currentDateElement = document.getElementById("currentDate");
    if (currentDateElement) {
        const currentDate = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('id-ID', options);
        currentDateElement.textContent = formattedDate;
    }
}

function generateQrCode(uid) {
    // size gambar qr
    const displaySize = 128;

    // membuat kode QR
    const qrCode = new QRCode(document.getElementById("qrcode"), {
        text: uid,
        width: displaySize,
        height: displaySize,
    });

    // Opsional, bisa ditambahkan style untuk kode QR
    document.querySelector("#qrcode canvas").style.border = "2px solid #000";

    // size dari gambar kode qr
    const downloadSize = 512;
    const downloadCanvas = document.createElement("canvas");
    downloadCanvas.width = downloadSize;
    downloadCanvas.height = downloadSize;

    // ambil isi dari canvass
    const downloadContext = downloadCanvas.getContext("2d");

    // masukkan kode qr di canvas
    downloadContext.drawImage(qrCode._el.firstChild, 0, 0, downloadSize, downloadSize);

    // buat link downloadnya
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadCanvas.toDataURL("image/png");
    downloadLink.download = "qr_code.png";

    // tambah event listener untuk download
    const downloadQrCodeLink = document.getElementById("downloadQrCode");
    downloadQrCodeLink.addEventListener("click", () => {
        event.preventDefault();
        downloadLink.click();
    });
}

//================================================================================= DISPLAY& QR END

//================================================================================= SIDEBAR AND FOOTER START

const sidebarToggle = document.querySelector("#sidebar-toggle");
sidebarToggle.addEventListener("click",function(){
    document.querySelector("#sidebar").classList.toggle("collapsed");
});

class SideBar extends HTMLElement{
    connectedCallback() {
        this.innerHTML = `
        <aside id="sidebar" class="js-sidebar">
            <!-- Content For Sidebar -->
            <div class="h-100">     
                <div class="sidebar-logo">
                    <a id="dashboard-link">USAHAKU</a>
                </div>
                <div id="modalLoading" class="modalLoading">
                    <div class="modal-contentLoading">
                        <div class="loader"></div>
                    </div>
                </div>
                <ul class="sidebar-nav">
                    <li class="sidebar-header">
                        Admin Elements
                    </li>
                    <li class="sidebar-item">
                        <a id="dashboard-link-sidebar" class="sidebar-link">
                            <i class="fa-solid fa-list pe-2"></i>
                            Dashboard
                        </a>
                    </li>
                    <li class="sidebar-item">
                        <a href="#" class="sidebar-link collapsed" data-bs-target="#umkm" data-bs-toggle="collapse"
                            aria-expanded="false"><i class="fa-solid fa-sliders pe-2"></i>
                        Pengaturan UMKM
                        </a>
                        <ul id="umkm" class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
                            <li class="sidebar-item">
                                <a id="umkm-operational-link" class="sidebar-link">Jam Operasional</a>
                            </li>
                            <li class="sidebar-item">
                                <a id="umkm-salarycut-link" class="sidebar-link">Potongan Gaji Karyawan</a>
                            </li>
                        </ul>
                    </li>
                    <li class="sidebar-item">
                        <a href="#" class="sidebar-link collapsed" data-bs-target="#karyawan" data-bs-toggle="collapse"
                            aria-expanded="false"><i class="fa-solid fa-user pe-2"></i>
                            Karyawan
                        </a>
                        <ul id="karyawan" class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
                            <li class="sidebar-item">
                                <a id="view-karyawan-link" class="sidebar-link">List Karyawan</a>
                            </li>
                            <li class="sidebar-item">
                                <a id="add-karyawan-link" class="sidebar-link">Tambah Karyawan</a>
                            </li>
                            <li class="sidebar-item">
                                <a id="karyawan-absent-working" class="sidebar-link">Log Absen Masuk</a>
                            </li>
                            <li class="sidebar-item">
                                <a id="karyawan-absent-closing" class="sidebar-link">Log Absen Pulang</a>
                            </li>
                        </ul>
                    </li>
                    <li class="sidebar-item">
                        <a href="#" class="sidebar-link collapsed" data-bs-target="#laporan" data-bs-toggle="collapse"
                            aria-expanded="false"><i class="fa-solid fa-file-lines pe-2"></i>
                            Laporan Bulanan
                        </a>
                        <ul id="laporan" class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
                            <li class="sidebar-item">
                                <a id="report-absent-working-link" class="sidebar-link">Presensi Karyawan</a>
                            </li>
                            <li class="sidebar-item">
                                <a id="report-allsalary-link" class="sidebar-link">Penggajian</a>
                            </li>
                            <li class="sidebar-item">
                                <a id="report-salary-link" class="sidebar-link">Slip Gaji Bulanan</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </aside>
        `;
    }
}

customElements.define('side-bar', SideBar)

class MyFooter extends HTMLElement{
    connectedCallback() {
        this.innerHTML = `
        <footer class="footer">
                <div class="container-fluid">
                    <div class="row text-muted">
                        <div class="col-6 text-start">
                            <p class="mb-0">
                                <a id="dashboard-link-footer" class="text-muted">
                                    <strong>Usahaku</strong>
                                </a>
                            </p>
                        </div>
                        <div class="col-6 text-end">
                            <ul class="list-inline">
                                <li class="list-inline-item">
                                    <i class="fa-brands fa-whatsapp"></i><a href="https://wa.me/628987533189" class="text-muted"> Support</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}


customElements.define('my-footer', MyFooter)
//================================================================================= SIDEBAR AND FOOTER END