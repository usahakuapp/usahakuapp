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
const database = getDatabase(app);

let umkm_uid;
let month;
let year;
let emp_nik;
let emp_name;
let totalAttendance;
let singleAttendance;

if (window.location.pathname.includes("report-salary.html")) {
    window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    umkm_uid = urlParams.get('uid');

    // fungsi untuk populate nama karyawan di field
    populateEmployeeNames();

    window.jsPDF = window.jspdf.jsPDF;
    });
}

if (window.location.pathname.includes("report-salary-detail.html")) {
    window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    umkm_uid = urlParams.get('uid');
    month = urlParams.get('month');
    year = urlParams.get('year');
    emp_nik = urlParams.get('emp_nik');

    document.getElementById('emp_salary').addEventListener('input', updateFinalSalary);
    document.getElementById('absent_late_cut').addEventListener('input', updateFinalSalary);
    document.getElementById('salarycut_one').addEventListener('input', updateFinalSalary);
    document.getElementById('salarycut_two').addEventListener('input', updateFinalSalary);
    document.getElementById('salaryadd_one').addEventListener('input', updateFinalSalary);
    document.getElementById('salaryadd_two').addEventListener('input', updateFinalSalary);

    // Memeriksa apakah data payroll telah terdaftar
    checkPayrollData(emp_nik, umkm_uid, year, month);
    window.jsPDF = window.jspdf.jsPDF;
    });
}

//================================================================================SALARY
function populateEmployeeNames() {
    // Ambil umkm_uid dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const umkm_uid = urlParams.get('uid');

    // Referensi ke data karyawan di database
    const employeeRef = ref(database, `employee`);

    // Kosongkan opsi yang sudah ada di dropdown
    const employeeNameSelect = document.getElementById('employeeName');
    employeeNameSelect.innerHTML = '';

    // Ambil nama-nama karyawan berdasarkan umkm_uid
    onValue(employeeRef, (snapshot) => {
        const employeesData = snapshot.val();

        // Periksa jika snapshot memiliki nilai
        if (employeesData) {
            // Filter dan urutkan employeesData berdasarkan emp_name untuk umkm_uid tertentu dan emp_status "active"
            const employeesForUid = Object.entries(employeesData)
                .filter(([_, employee]) => employee.umkm_uid === umkm_uid && employee.emp_status === "active")
                .map(([_, employee]) => employee)
                .sort((a, b) => a.emp_name.localeCompare(b.emp_name));

            // Isi dropdown dengan nama-nama karyawan yang diurutkan untuk umkm_uid tertentu
            employeesForUid.forEach((employee) => {
                const option = document.createElement('option');
                option.value = employee.emp_nik;
                option.text = employee.emp_name;
                employeeNameSelect.add(option);
            });

            // Event listener untuk tombol "Next"
            document.getElementById('button_next').addEventListener('click', () => {
                // Ambil emp_nik yang dipilih
                const emp_nik = employeeNameSelect.value;
                const month = document.getElementById('month').value;
                const year = document.getElementById('year').value;

                // Redirect ke halaman "report-salary-detail.html" dengan emp_nik dan umkm_uid di URL
                window.location.href = `report-salary-detail.html?uid=${umkm_uid}&emp_nik=${emp_nik}&month=${month}&year=${year}`;
            });
        } else {
            console.error('Tidak ada data karyawan yang ditemukan untuk umkm_uid yang spesifik.');
        }
    }, (error) => {
        console.error('Error fetching employee data:', error.message);
    });
}


//================================================================================SALARY

function updateFinalSalary() {
    // Ambil nilai dari setiap textbox
    const emp_salary = parseFloat(document.getElementById('emp_salary').value) || 0;
    const absent_late_cut = parseFloat(document.getElementById('absent_late_cut').value) || 0;
    const salarycut_one = parseFloat(document.getElementById('salarycut_one').value) || 0;
    const salarycut_two = parseFloat(document.getElementById('salarycut_two').value) || 0;
    const salaryadd_one = parseFloat(document.getElementById('salaryadd_one').value) || 0;
    const salaryadd_two = parseFloat(document.getElementById('salaryadd_two').value) || 0;

    // Hitung kembali nilai final_salary sesuai rumus
    const final_salary = emp_salary - absent_late_cut - salarycut_one - salarycut_two + salaryadd_one + salaryadd_two;

    // Tampilkan nilai final_salary pada textbox
    document.getElementById('final_salary').value = final_salary;
}

//========================================================================= PROSES PENGGAJIAN MULAI
async function checkPayrollData(emp_nik, umkm_uid, year, month) {
    const uniqueCode = `${emp_nik}${year}${month}`;
    const payrollRef = ref(database, `payroll/${uniqueCode}`);

    try {
        const snapshot = await get(payrollRef);
        const payrollData = snapshot.val();

        if (payrollData) {
            // Jika data payroll telah terdaftar, melemparkan data tersebut ke input box HTML
            document.getElementById('emp_salary').value = payrollData.emp_salary;
            document.getElementById('absent_late_cut').value = payrollData.absent_late_cut;
            document.getElementById('present_days').value = payrollData.present_days;
            document.getElementById('salarycut_one').value = payrollData.salarycut_one;
            document.getElementById('salarycut_one_info').value = payrollData.salarycut_one_info;
            document.getElementById('salarycut_two').value = payrollData.salarycut_two;
            document.getElementById('salarycut_two_info').value = payrollData.salarycut_two_info;
            document.getElementById('salaryadd_one').value = payrollData.salaryadd_one;
            document.getElementById('salaryadd_one_info').value = payrollData.salaryadd_one_info;
            document.getElementById('salaryadd_two').value = payrollData.salaryadd_two;
            document.getElementById('salaryadd_two_info').value = payrollData.salaryadd_two_info;
            document.getElementById('final_salary').value = payrollData.final_salary;
        } else {
            console.log('Data payroll belum terdaftar.');

            // Ambil data gaji pokok karyawan
            getEmployeeSalary(emp_nik);

            // Panggil fungsi untuk mengambil data potongan keterlambatan
            getTotalLateCut(emp_nik, umkm_uid, year, month);

            // Panggil fungsi untuk menghitung total kehadiran
            getTotalAttendance(emp_nik, umkm_uid, year, month);
        }
    } catch (error) {
        console.error('Error fetching payroll data:', error.message);
    }
}

function getTotalLateCut(emp_nik, umkm_uid, year, month) {
    const lateCutRef = ref(database, 'employee_absent_working');
    onValue(lateCutRef, (snapshot) => {
        const absentData = snapshot.val();
        if (absentData) {
            let totalLateCut = 0;
            Object.values(absentData).forEach(entry => {
                if (entry.emp_nik === emp_nik && entry.umkm_uid === umkm_uid && entry.absent_date.slice(0, 7) === `${year}-${month}`) {
                    totalLateCut += parseInt(entry.absent_late_cut);
                }
            });
            console.log('Total late cut amount:', totalLateCut);
            
            document.getElementById('absent_late_cut').value = totalLateCut;
        } else {
            console.error('No late cut data found.');
        }
    }, (error) => {
        console.error('Error fetching late cut data:', error.message);
    });
}

function getEmployeeSalary(emp_nik) {
    const employeeRef = ref(database, `employee/${emp_nik}`);
    onValue(employeeRef, (snapshot) => {
        const employeeData = snapshot.val();
        if (employeeData) {
            const emp_salary = employeeData.emp_salary;
            console.log('Employee data found:', employeeData);
            console.log('Year:', year);
            console.log('Month:', month); // log

            document.getElementById('emp_salary').value = emp_salary;
            document.getElementById('final_salary').value = emp_salary;
        } else {
            console.error('Employee data not found for the specified emp_nik.');
        }
    }, (error) => {
        console.error('Error fetching employee data:', error.message);
    });
}

async function getTotalAttendance(emp_nik, umkm_uid, year, month) {
    const workingRef = ref(database, 'employee_absent_working');
    const closingRef = ref(database, 'employee_absent_closing');

    // Objek untuk mencatat kehadiran karyawan
    let attendanceRecord = {};

    // Ambil data dari working database
    const workingSnapshot = await get(workingRef);
    const workingData = workingSnapshot.val() || {};

    // Ambil data dari closing database
    const closingSnapshot = await get(closingRef);
    const closingData = closingSnapshot.val() || {};

    // Iterasi melalui setiap entri dalam data working
    Object.values(workingData).forEach(workingEntry => {
        const currentDate = workingEntry.absent_date.slice(0, 10); // Ambil tanggal (YYYY-MM-DD)
        if (workingEntry.emp_nik === emp_nik && workingEntry.umkm_uid === umkm_uid && currentDate.startsWith(`${year}-${month}`)) {
            if (!attendanceRecord[currentDate]) {
                attendanceRecord[currentDate] = 'working'; // Tandai kehadiran pada tanggal ini sebagai 'working'
            }
        }
    });

    // Iterasi melalui setiap entri dalam data closing
    Object.values(closingData).forEach(closingEntry => {
        const currentDate = closingEntry.absent_date.slice(0, 10);
        if (closingEntry.emp_nik === emp_nik && closingEntry.umkm_uid === umkm_uid && currentDate.startsWith(`${year}-${month}`)) {
            if (!attendanceRecord[currentDate]) {
                attendanceRecord[currentDate] = 'closing'; // Tandai kehadiran pada tanggal ini sebagai 'closing'
            } else if (attendanceRecord[currentDate] === 'working') {
                attendanceRecord[currentDate] = 'both'; // Jika sudah absen di 'working', tandai sebagai 'both'
            }
        }
    });

    // Hitung total kehadiran
    totalAttendance = Object.keys(attendanceRecord).length;

    // Hitung kehadiran tunggal
    singleAttendance = 0;
    Object.values(attendanceRecord).forEach(status => {
        if (status === 'working') {
            singleAttendance++;
        }
    });

    console.log('Total attendance:', totalAttendance);
    console.log('Single attendance:', singleAttendance);

    document.getElementById('present_days').value = totalAttendance;
}

async function saveEmployeeSalary(emp_nik, umkm_uid, year, month, emp_salary, absent_late_cut, present_days, salarycut_one, salarycut_one_info, salarycut_two, salarycut_two_info, salaryadd_one, salaryadd_one_info, salaryadd_two, salaryadd_two_info, final_salary) {
    const salaryDate = year + "-" + month;
    const uniqueCode = `${emp_nik}${year}${month}`;
    
    const salaryData = {
        emp_nik: emp_nik,
        umkm_uid: umkm_uid,
        salary_date: salaryDate,
        emp_salary: emp_salary,
        absent_late_cut: absent_late_cut,
        present_days: present_days,
        salarycut_one: salarycut_one,
        salarycut_one_info: salarycut_one_info,
        salarycut_two: salarycut_two,
        salarycut_two_info: salarycut_two_info,
        salaryadd_one: salaryadd_one,
        salaryadd_one_info: salaryadd_one_info,
        salaryadd_two: salaryadd_two,
        salaryadd_two_info: salaryadd_two_info,
        final_salary: final_salary
    };

    try {
        await set(ref(database, `payroll/${uniqueCode}`), salaryData);
        console.log('Employee payroll data saved successfully.');
    } catch (error) {
        console.error('Error saving employee salary data:', error.message);
    }

    // EXPORT PDF
    // ambil nama karyawan dari dropdown
    const emp_name = await getEmployeeName(emp_nik);
    await exportToPDF(emp_nik, emp_name, emp_salary, absent_late_cut, present_days, salarycut_one, salarycut_one_info, salarycut_two, salarycut_two_info, salaryadd_one, salaryadd_one_info, salaryadd_two, salaryadd_two_info, final_salary);
}

// Event listener for the form submission
document.getElementById('button_export_pdf').addEventListener('click', async (event) => {
    event.preventDefault();

    // mengambil value dari field
    const emp_salary = parseFloat(document.getElementById('emp_salary').value);
    const absent_late_cut = parseFloat(document.getElementById('absent_late_cut').value);
    const present_days = parseFloat(document.getElementById('present_days').value);
    const salarycut_one = parseFloat(document.getElementById('salarycut_one').value);
    const salarycut_one_info = document.getElementById('salarycut_one_info').value;
    const salarycut_two = parseFloat(document.getElementById('salarycut_two').value);
    const salarycut_two_info = document.getElementById('salarycut_two_info').value;
    const salaryadd_one = parseFloat(document.getElementById('salaryadd_one').value);
    const salaryadd_one_info = document.getElementById('salaryadd_one_info').value;
    const salaryadd_two = parseFloat(document.getElementById('salaryadd_two').value);
    const salaryadd_two_info = document.getElementById('salaryadd_two_info').value;
    const final_salary = parseFloat(document.getElementById('final_salary').value);

    // fungsi untuk save salary
    await saveEmployeeSalary(emp_nik, umkm_uid, year, month, emp_salary, absent_late_cut, present_days, salarycut_one, salarycut_one_info, salarycut_two, salarycut_two_info, salaryadd_one, salaryadd_one_info, salaryadd_two, salaryadd_two_info, final_salary);
});
//========================================================================= PROSES PENGGAJIAN SELESAI


//========================================================================= EKSPOR PDF MULAI
async function exportToPDF(emp_nik, emp_name, emp_salary, absent_late_cut, present_days, salarycut_one, salarycut_one_info, salarycut_two, salarycut_two_info, salaryadd_one, salaryadd_one_info, salaryadd_two, salaryadd_two_info, final_salary) {
    // Buat dokumen PDF baru
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [100, 210], // Ukuran A4
    });
    pdf.rect(5, 5, 200, 90); // x, y, lebar, tinggi

    // Ambil nama UMKM dari Firebase menggunakan umkm_uid
    const umkmName = await getUMKMName(umkm_uid);

    // Tambahkan informasi header
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold"); // Set font ke Helvetica dan tebal
    pdf.text('SLIP GAJI KARYAWAN', 105, 10, { align: 'center' });
    pdf.text(umkmName, 105, 16, { align: 'center' }); // Tambahkan nama UMKM di pojok kiri atas
    pdf.setFont("helvetica", "normal"); // Reset font ke normal (opsional)

    // Tambahkan bagian "Data Karyawan"
    pdf.setFontSize(12);
    pdf.textWithLink('DATA KARYAWAN', 10, 25, { url: '' });
    pdf.setFontSize(10);
    pdf.text(`NIK`, 10, 30);
    pdf.text(`: ${emp_nik}`, 45, 30);
    pdf.text(`Nama Karyawan`, 10, 34);
    pdf.text(`: ${emp_name}`, 45, 34);
    pdf.text(`Total Kehadiran`, 10, 38); 
    pdf.text(`: ${present_days} hari`, 45, 38);
    pdf.text(`Periode ${month}-${year}`, 170, 38); 

    // Tambahkan garis di atas "Penerimaan"
    pdf.setLineWidth(0.5);
    pdf.line(10, 43, 200, 43);

    // Tambahkan judul "Penerimaan" dan "Potongan"
    pdf.setFontSize(12);
    pdf.text('PENERIMAAN', 10, 50);
    pdf.text('POTONGAN', 120, 50);
    pdf.setFontSize(10);

    // Sisi kiri (Penghasilan)
    pdf.text(`1. Gaji Pokok`, 10, 55);
    pdf.text(`: Rp. ${emp_salary.toLocaleString('id-ID')},00`, 45, 55);
    pdf.text(`2. ${salaryadd_one_info !== '' ? salaryadd_one_info : '-'}`, 10, 60);
    pdf.text(`: Rp. ${salaryadd_one.toLocaleString('id-ID')},00`, 45, 60);
    pdf.text(`3. ${salaryadd_two_info !== '' ? salaryadd_two_info : '-'}`, 10, 65);
    pdf.text(`: Rp. ${salaryadd_two.toLocaleString('id-ID')},00`, 45, 65);

    // Sisi kanan (Potongan)
    pdf.text(`1. Keterlambatan`, 120, 55);
    pdf.text(`: Rp. ${absent_late_cut.toLocaleString('id-ID')},00`, 155, 55);
    pdf.text(`2. ${salarycut_one_info !== '' ? salarycut_one_info : '-'}`, 120, 60);
    pdf.text(`: Rp. ${salarycut_one.toLocaleString('id-ID')},00`, 155, 60);
    pdf.text(`3. ${salarycut_two_info !== '' ? salarycut_two_info : '-'}`, 120, 65);
    pdf.text(`: Rp. ${salarycut_two.toLocaleString('id-ID')},00`, 155, 65);

    // Total Penghasilan
    const totalPenghasilan = emp_salary + salaryadd_one + salaryadd_two;
    pdf.setFont("helvetica", "bold"); // Set font ke Helvetica dan tebal
    pdf.text(`Total Penerimaan`, 10, 72);
    pdf.text(`: Rp. ${totalPenghasilan.toLocaleString('id-ID')},00`, 45, 72);

    // Total Potongan
    const totalPotongan = absent_late_cut + salarycut_one + salarycut_two;
    pdf.text(`Total Potongan`, 120, 72);
    pdf.text(`: Rp. ${totalPotongan.toLocaleString('id-ID')},00`, 155, 72);

    // Tambahkan garis setelah "Penghasilan"
    pdf.setLineWidth(0.5);
    pdf.line(10, 77, 200, 77);

    // Total
    pdf.setFont("helvetica", "bold"); // Set font ke Helvetica dan tebal
    pdf.setFontSize(12); // Set ukuran font sedikit lebih besar untuk total
    pdf.text(`Total Diterima        : Rp. ${final_salary.toLocaleString('id-ID')},00`, 10, 84);

    // Simpan PDF
    pdf.save('payslip.pdf');
}

async function getUMKMName(umkm_uid) {
    try {
        const snapshot = await get(ref(database, `umkm/${umkm_uid}`));
        const umkmData = snapshot.val();
        return umkmData.umkm_name;
    } catch (error) {
        console.error('Error fetching UMKM data:', error.message);
        return '';
    }
}

async function getEmployeeName(emp_nik) {
    try {
        const snapshot = await get(ref(database, `employee/${emp_nik}`));
        const employeeData = snapshot.val();
        return employeeData.emp_name;
    } catch (error) {
        console.error('Error fetching employee data:', error.message);
        return ''; 
    }
}
//========================================================================= EKSPOR PDF SELESAI