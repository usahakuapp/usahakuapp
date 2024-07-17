// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, child, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const auth = getAuth(app);
const database = getDatabase(app);

let umkm_uid;
let umkm_name = '';

// Ensure the script is loaded
console.log("Script loaded.");

window.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event fired.");

    const urlParams = new URLSearchParams(window.location.search);
    umkm_uid = urlParams.get('uid');

    console.log("UMKM UID:", umkm_uid);

    if (window.location.pathname.endsWith("report-absent-working.html")) {
        console.log("On the correct page: report-absent-working.html");

        // Retrieve umkm_name
        getUmkmName(umkm_uid);

        // Populate the employee dropdown
        populateEmployees(umkm_uid);

        // Add event listener to the button
        const exportButton = document.getElementById('button_export_pdf');
        exportButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default form submission behavior

            const dateFrom = new Date(document.getElementById('date_from').value);
            const dateTo = new Date(document.getElementById('date_to').value);

            // Check if the date range exceeds 31 days
            const timeDiff = dateTo - dateFrom;
            const dayDiff = timeDiff / (1000 * 3600 * 24);
            if (dayDiff > 31) {
                alert('Data presensi tidak dapat menampilkan lebih dari 31 hari.');
            } else {
                generatePDFReport(dateFrom, dateTo);
            }
        });
    } else {
        console.log("Not on the report-absent-working.html page");
    }
});

// Function to retrieve umkm_name
function getUmkmName(umkm_uid) {
    const umkmRef = ref(database, 'umkm/' + umkm_uid);

    console.log("Fetching UMKM name...");

    onValue(umkmRef, (snapshot) => {
        if (snapshot.exists()) {
            const umkmData = snapshot.val();
            umkm_name = umkmData.umkm_name || 'Bintang ATK';
            console.log("UMKM name:", umkm_name);
        } else {
            console.log("No UMKM found.");
        }
    }, {
        onlyOnce: true
    });
}

// Function to populate the employee dropdown
function populateEmployees(umkm_uid) {
    const employeeSelect = document.getElementById('employee');
    const employeeRef = ref(database, 'employee');

    console.log("Fetching employees...");

    onValue(employeeRef, (snapshot) => {
        if (snapshot.exists()) {
            const employees = snapshot.val();
            console.log("Employees found:", employees);
            for (const key in employees) {
                if (employees[key].umkm_uid === umkm_uid) {
                    console.log("Matching employee:", employees[key]);
                    const option = document.createElement('option');
                    option.value = employees[key].emp_nik;
                    option.textContent = employees[key].emp_name;
                    employeeSelect.appendChild(option);
                }
            }
        } else {
            console.log("No employees found.");
        }
    }, {
        onlyOnce: true
    });
}

// Function to generate the PDF report
async function generatePDFReport(dateFrom, dateTo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", format: 'legal' });

    const employeeSelect = document.getElementById('employee');
    const selectedEmployee = employeeSelect.value;
    const employeeRef = ref(database, 'employee');
    const holidaysRef = ref(database, `umkm_holiday/${umkm_uid}`);
    const workingRef = ref(database, 'employee_absent_working');
    const closingRef = ref(database, 'employee_absent_closing');
    const permitsRef = ref(database, 'emp_permit');

    const holidaysSnapshot = await get(holidaysRef);
    const holidays = holidaysSnapshot.exists() ? holidaysSnapshot.val() : {};

    // Convert holiday values to an array of dates for easier checking
    const holidayDates = Object.values(holidays).map(date => new Date(date).toISOString().split('T')[0]);

    const employeesSnapshot = await get(employeeRef);
    const employees = employeesSnapshot.exists() ? employeesSnapshot.val() : {};

    const workingSnapshot = await get(workingRef);
    const working = workingSnapshot.exists() ? workingSnapshot.val() : {};

    const closingSnapshot = await get(closingRef);
    const closing = closingSnapshot.exists() ? closingSnapshot.val() : {};

    const permitsSnapshot = await get(permitsRef);
    const permits = permitsSnapshot.exists() ? permitsSnapshot.val() : {};

    let tableColumns = ["No", "Nama Karyawan"];
    let currentDate = new Date(dateFrom);

    // Prepare column headers for each date (only the day part)
    while (currentDate <= dateTo) {
        const day = currentDate.getDate(); // Get only the day part of the date
        tableColumns.push(day);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    let reportData = [];
    let index = 1;

    for (let empKey in employees) {
        if (selectedEmployee === 'all' || selectedEmployee === employees[empKey].emp_nik) {
            let row = [index++, employees[empKey].emp_name];
            currentDate = new Date(dateFrom);

            while (currentDate <= dateTo) {
                const dateString = currentDate.toISOString().split('T')[0];

                let cellContent = '';

                if (holidayDates.includes(dateString)) {
                    cellContent = "Libur";
                } else {
                    const workKey = Object.keys(working).find(key => working[key].emp_nik === employees[empKey].emp_nik && working[key].absent_date === dateString);
                    const closeKey = Object.keys(closing).find(key => closing[key].emp_nik === employees[empKey].emp_nik && closing[key].absent_date === dateString);
                    const permitKey = Object.keys(permits).find(key => permits[key].emp_nik === employees[empKey].emp_nik && permits[key].leave_date === dateString);

                    if (permitKey) {
                        cellContent = `(${permits[permitKey].leave_reason})`;
                    }

                    if (workKey) {
                        cellContent += (cellContent ? "\n" : "") + (working[workKey].absent_time || 'x');
                    }

                    if (closeKey) {
                        cellContent += (cellContent ? "\n" : "") + (closing[closeKey].absent_time || 'x');
                    }

                    if (!workKey && !closeKey && !permitKey) {
                        cellContent = 'x';
                    }
                }

                row.push(cellContent);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            reportData.push(row);
        }
    }

    // Add report header
    const formattedDateFrom = dateFrom.toLocaleDateString('en-GB').split('/').join('-');
    const formattedDateTo = dateTo.toLocaleDateString('en-GB').split('/').join('-');
    doc.setFontSize(14);
    doc.text('LAPORAN PRESENSI', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Periode ${formattedDateFrom} - ${formattedDateTo}`, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
    doc.text(umkm_name, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

    // Generate PDF content with table
    doc.autoTable({
        head: [tableColumns],
        body: reportData,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.25, halign: 'center' },
        styles: { cellPadding: 2, fontSize: 7, halign: 'center', overflow: 'linebreak' },
        columnStyles: {
            0: { cellWidth: 8 }, // Fixed width for the "No" column
            1: { cellWidth: 20 }, // Fixed width for the "Nama Karyawan" column
        }
    });

    // Add "Mengetahui" and owner's name
    const finalY = doc.autoTable.previous.finalY; // Get the y-coordinate after the table
    doc.setFontSize(12);
    doc.text('Mengetahui', doc.internal.pageSize.getWidth() - 50, finalY + 20, { align: 'center' });
    doc.text(`Pemilik ${umkm_name}`, doc.internal.pageSize.getWidth() - 50, finalY + 40, { align: 'center' });

    // Preview the PDF in a new window
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
}
