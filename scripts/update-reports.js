const fs = require('fs');
const path = require('path');
const jsPath = path.join(__dirname, '..', 'public', 'js', 'reports.js');
let js = fs.readFileSync(jsPath, 'utf8');

// Replace the generateReports function
const oldPattern = /\/\/ Reports: generate report stats[\s\S]*?periodLabel = 'ថ្ងៃនេះ';[\s\S]*?\}/;

const newFunction = `// Reports: generate report stats + top products chart

CoffeePOS.prototype.generateReports = async function () {
    // Get dates from date inputs
    const startDateInput = document.getElementById('reportStartDate').value;
    const endDateInput = document.getElementById('reportEndDate').value;

    let startDate, endDate, periodLabel;

    if (startDateInput && endDateInput) {
        // Use custom date range
        startDate = new Date(startDateInput);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(endDateInput);
        endDate.setHours(23, 59, 59, 999);
        periodLabel = startDateInput + ' ដល់ ' + endDateInput;
    } else if (startDateInput) {
        // Only start date - use single day
        startDate = new Date(startDateInput);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDateInput);
        endDate.setHours(23, 59, 59, 999);
        periodLabel = startDateInput;
    } else {
        // Default to today
        const now = new Date();
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        periodLabel = 'ថ្ងៃនេះ';
    }`;

js = js.replace(oldPattern, newFunction);

// Also update the event listeners for the new inputs
const oldEvents = /document\.getElementById\('reportPeriod'\)\.addEventListener[\s\S]*?this\.generateReports\(\);[\s\S]*?\};/;

const newEvents = `document.getElementById('reportStartDate').addEventListener('change', () => this.generateReports());
        document.getElementById('reportEndDate').addEventListener('change', () => this.generateReports());`;

js = js.replace(oldEvents, newEvents);

fs.writeFileSync('reports.js', js);
console.log('✅ Updated reports.js!');
