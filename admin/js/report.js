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

//KETIKA WEB TERBUKA
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    umkm_uid = urlParams.get('uid');

    if (window.location.pathname.endsWith("report-absent-working.html")) {
        const exportButton = document.getElementById('button_export_excel');
        exportButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default form submission behavior
            exportToExcel();
        });
    }
});

//===================================================================================== LAPORAN ABSEN MASUK START

const exportToExcel = async () => {
    try {
        const selectedMonth = document.getElementById('month').value;
        const selectedYear = document.getElementById('year').value;

        // Dapatkan jumlah hari dalam bulan yang dipilih
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

        // Buat workbook baru dan tambahkan worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Absensi');

        // Tambahkan judul ke worksheet
        const titleRow = worksheet.addRow(['Absensi Presensi ' + selectedMonth + '-' + selectedYear]);
        titleRow.font = { bold: true };
        titleRow.alignment = { vertical: 'middle', horizontal: 'left' };

        // Tambahkan header ke worksheet
        const headers = [
            'No',
            'Nama Karyawan',
            ...Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                return day.toString().padStart(2, '0'); // Tampilkan hanya hari
            })
        ];
        worksheet.addRow(headers);

        console.log('umkm_uid:', umkm_uid);

        // Ambil data karyawan untuk memetakan emp_nik ke emp_name
        const employeeDataRef = ref(database, 'employee');
        const employeeDataSnapshot = await get(employeeDataRef);
        const employeeData = employeeDataSnapshot.val();

        // Filter karyawan hanya untuk yang memiliki emp_status: "active"
        const activeEmployees = Object.values(employeeData).filter(employee => employee.emp_status === "active");

        // Buat map untuk pencarian cepat detail karyawan berdasarkan emp_nik
        const employeeMap = activeEmployees.reduce((acc, employee) => {
            acc[employee.emp_nik] = employee;
            return acc;
        }, {});

        // Ambil data dari Firebase di mana umkm_uid sesuai dengan yang dari URL untuk employee_absent_working
        const dataRef = ref(database, 'employee_absent_working');
        const dataSnapshot = await get(dataRef);

        // Ambil data dari Firebase di mana umkm_uid sesuai dengan yang dari URL untuk employee_absent_closing
        const closingDataRef = ref(database, 'employee_absent_closing');
        const closingDataSnapshot = await get(closingDataRef);

        // Buat objek untuk melacak baris berdasarkan nilai emp_nik unik
        const empNikRows = {};
        let rowIndex = 1; // Mulai penomoran dari 1

        // Proses data employee_absent_closing ke dalam format yang sesuai
        const closingData = {};
        closingDataSnapshot.forEach((closingSnapshot) => {
            const closingRecord = closingSnapshot.val();
            const empNik = closingRecord.emp_nik;
            const absentDate = closingRecord.absent_date;

            if (!closingData[empNik]) {
                closingData[empNik] = {};
            }

            if (!closingData[empNik][absentDate]) {
                closingData[empNik][absentDate] = [];
            }

            closingData[empNik][absentDate].push(closingRecord);
        });

        // Loop melalui data dari employee_absent_working dan perbarui baris di worksheet
        dataSnapshot.forEach((umkmSnapshot) => {
            const umkmData = umkmSnapshot.val();

            if (umkmData.umkm_uid === umkm_uid) {
                const empNik = umkmData.emp_nik;

                // Hanya proses jika karyawan aktif
                if (employeeMap[empNik]) {
                    const employeeDetails = employeeMap[empNik];

                    // Jika emp_nik tidak ada dalam objek, tambahkan dengan array kosong
                    if (!empNikRows[empNik]) {
                        empNikRows[empNik] = Array.from({ length: daysInMonth + 2 }, () => '');
                        empNikRows[empNik][0] = rowIndex++; // Set kolom 'No'
                        empNikRows[empNik][1] = employeeDetails.emp_name; // Set kolom 'emp_name'
                    }

                    // Periksa apakah absent_date dan umkm_uid cocok dengan bulan dan tahun yang dipilih
                    if (
                        umkmData.absent_date &&
                        umkmData.umkm_uid &&
                        umkmData.umkm_uid === umkm_uid &&
                        umkmData.absent_date.substring(0, 7) === `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`
                    ) {
                        // Dapatkan indeks kolom untuk tanggal
                        const dateColumnIndex = parseInt(umkmData.absent_date.substring(8, 10)) + 1;

                        // Gunakan absent_time jika tersedia di kolom tanggal
                        empNikRows[empNik][dateColumnIndex] = umkmData.absent_time || '✓'; // Gunakan '✓' jika absent_time tidak tersedia
                    }
                }
            }
        });

        // Loop melalui data dari employee_absent_closing dan perbarui baris di worksheet
        closingDataSnapshot.forEach((closingSnapshot) => {
            const closingData = closingSnapshot.val();
            const empNik = closingData.emp_nik;
            const absentDate = closingData.absent_date;

            if (
                empNikRows[empNik] &&
                absentDate &&
                closingData.umkm_uid &&
                closingData.umkm_uid === umkm_uid &&
                absentDate.substring(0, 7) === `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`
            ) {
                const dateColumnIndex = parseInt(absentDate.substring(8, 10)) + 1;

                // Periksa apakah absent_time tersedia di closingData
                if (closingData.absent_time) {
                    // Jika sudah ada konten, tambahkan spasi dan kemudian absent_time
                    if (empNikRows[empNik][dateColumnIndex]) {
                        empNikRows[empNik][dateColumnIndex] += " -" + ` ${closingData.absent_time}`;
                    } else {
                        // Jika sel kosong, cukup atur absent_time
                        empNikRows[empNik][dateColumnIndex] = closingData.absent_time;
                    }
                }
            }
        });

        // Tambahkan baris dari objek ke worksheet
        Object.values(empNikRows).forEach((row) => {
            worksheet.addRow(row);
        });

        // Simpan workbook ke buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Buat Blob dari buffer
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Buat tautan unduhan dan mulai unduhan
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'absensi_masuk.xlsx';
        link.click();
    } catch (error) {
        console.error('Export to Excel failed:', error);
    }
};

//===================================================================================== LAPORAN ABSEN MASUK END
