// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, update, child, onValue, remove  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
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

if (window.location.pathname.includes("report-allsalary.html")) {
    window.addEventListener("DOMContentLoaded", () => {
        const urlParams = new URLSearchParams(window.location.search);
        umkm_uid = urlParams.get('uid');
    });
}

// button click exporttoexcel
document.getElementById('button_export_excel').addEventListener('click', exportToExcel);

async function exportToExcel() {
    const month = document.getElementById('month').value;
    const year = document.getElementById('year').value;
    const month2 = document.getElementById('month2').value;
    const year2 = document.getElementById('year2').value;

    // Format tanggal
    const startDate = `${year}-${month}`;
    const endDate = `${year2}-${month2}`;

    const [payrollData, employeeData] = await Promise.all([
        fetchPayrollData(umkm_uid, startDate, endDate),
        fetchEmployeeData(umkm_uid)
    ]);

    generateExcel(payrollData, employeeData, startDate, endDate);
}

async function fetchPayrollData(umkmUid, startDate, endDate) {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `payroll`));
    const payrollData = [];

    if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
            const payroll = data[key];
            if (payroll.umkm_uid === umkmUid && payroll.salary_date >= startDate && payroll.salary_date <= endDate) {
                payrollData.push(payroll);
            }
        });
    }

    // Log the payroll data found
    console.log('Payroll data after filtering:', payrollData);

    return payrollData;
}

async function fetchEmployeeData(umkmUid) {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `employee`));
    const employeeData = {};

    if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
            const employee = data[key];
            if (employee.umkm_uid === umkmUid && employee.emp_status === "active") {
                employeeData[employee.emp_nik] = employee.emp_name;
            }
        });
    }

    // log karyawan
    console.log('Employee data:', employeeData);

    return employeeData;
}   

function generateExcel(payrollData, employeeData, startDate, endDate) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Penggajian');

    // generate semua bulan
    const months = getAllMonths(startDate, endDate);
    console.log('Full list of months:', months);

    // tambahkan baris judul
    const title = `Laporan penggajian periode ${startDate} sampai ${endDate}`;
    const titleRow = worksheet.addRow([title]);
    titleRow.font = { bold: true };
    worksheet.mergeCells(`A1:${String.fromCharCode(65 + 2 + months.length - 1)}1`); // Merge cells for the title

    // tambah baris header
    const header = ['No', 'Nama Karyawan', ...months];
    worksheet.addRow(header);

    // baris data
    const groupedData = groupByEmployee(payrollData);
    console.log('Grouped data by employee:', groupedData); // Log grouped data

    let no = 1;
    for (const [emp_nik, records] of Object.entries(groupedData)) {
        const emp_name = employeeData[emp_nik] || 'Unknown';
        const row = [no++, emp_name, ...months.map(month => {
            const record = records.find(r => r.salary_date === month);
            return record ? record.final_salary : '';
        })];
        worksheet.addRow(row);
    }

    // save excel
    workbook.xlsx.writeBuffer().then(buffer => {
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), 'Laporan_Penggajian.xlsx');
    });
}

function groupByEmployee(data) {
    return data.reduce((acc, item) => {
        if (!acc[item.emp_nik]) {
            acc[item.emp_nik] = [];
        }
        acc[item.emp_nik].push(item);
        return acc;
    }, {});
}

function getAllMonths(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = [];

    while (start <= end) {
        const year = start.getFullYear();
        const month = (start.getMonth() + 1).toString().padStart(2, '0');
        months.push(`${year}-${month}`);
        start.setMonth(start.getMonth() + 1);
    }

    return months;
}