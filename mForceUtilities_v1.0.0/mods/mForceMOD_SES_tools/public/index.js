
// --- EMBEDDED DATA START ---
const INITIAL_CSV_DATA = `Account Name : Demand Dep
Account Number : 6007793
Date Range : 12/10/2025-01/28/2026
Transaction Number,Date,Description,Memo,Amount Debit,Amount Credit,Balance,Check Number
"20260123000000[-5:EST]*-67.66*1*3479*Check",01/23/2026,"Check","",-67.66,,162226.21,3479
"20260123000000[-5:EST]*-39.59*1*3482*Check",01/23/2026,"Check","",-39.59,,162293.87,3482
"20260121000000[-5:EST]*-466.00*10**NEW YORK CENTRAL/EFT DEBIT",01/21/2026,"NEW YORK CENTRAL/EFT DEBIT","JULIE M FRANCES",-466.00,,162333.46,
"20260121000000[-5:EST]*-400.00*1*3481*Check",01/21/2026,"Check","",-400.00,,162799.46,3481
"20260121000000[-5:EST]*-272.58*1*3484*Check",01/21/2026,"Check","",-272.58,,163199.46,3484
"20260121000000[-5:EST]*-241.21*1*3486*Check",01/21/2026,"Check","",-241.21,,163472.04,3486
"20260121000000[-5:EST]*-100.00*1*3485*Check",01/21/2026,"Check","",-100.00,,163713.25,3485
"20260120000000[-5:EST]*-136.68*1*3480*Teller Check",01/20/2026,"Teller Check","",-136.68,,163613.25,3480
"20260120000000[-5:EST]*-88.22*1*3483*Teller Check",01/20/2026,"Teller Check","",-88.22,,163749.93,3483
"20260120000000[-5:EST]*-53.23*1*3489*Teller Check",01/20/2026,"Teller Check","",-53.23,,163838.15,3489
"20260120000000[-5:EST]*-822.62*12**boat loan TO: DDXXXX3165",01/20/2026,"boat loan TO: DDXXXX3165","",-822.62,,163891.38,
"20260116000000[-5:EST]*-289.50*1*3488*Teller Check",01/16/2026,"Teller Check","",-289.50,,164214.00,3488
"20260116000000[-5:EST]*-148.68*10**NYS DTF WT/TAX PAYMNT",01/16/2026,"NYS DTF WT/TAX PAYMNT","WPWF2601159706456",-148.68,,164503.50,
"20260115000000[-5:EST]*-1989.00*10**IRS/USATAXPYMT LAW OFFICE OF",01/15/2026,"IRS/USATAXPYMT LAW OFFICE OF","JULIE M",-1989.00,,164652.18,
"20260115000000[-5:EST]*-425.80*10**IRS/USATAXPYMT LAW OFFICE OF",01/15/2026,"IRS/USATAXPYMT LAW OFFICE OF","JULIE M",-425.80,,166641.18,
"20260113000000[-5:EST]*-85.00*1*3475*Teller Check",01/13/2026,"Teller Check","",-85.00,,167066.98,3475
"20260112000000[-5:EST]*-376.00*10**AMEX EPAYMENT/ACH PMT JMF LAW",01/12/2026,"AMEX EPAYMENT/ACH PMT JMF LAW","PC Operating A",-376.00,,167151.98,
"20260108000000[-5:EST]*-137.00*10**NEW YORK CENTRAL/EFT DEBIT",01/08/2026,"NEW YORK CENTRAL/EFT DEBIT","JULIE M FRANCES",-137.00,,167527.98,
"20260108000000[-5:EST]*-87.91*10**HARTFORD LIFE AN/PREMRMB103",01/08/2026,"HARTFORD LIFE AN/PREMRMB103","RMR*IK*427202494825\\\\ THE LAW OFFICE OF JULI",-87.91,,167664.98,
"20260108000000[-5:EST]*-84.98*10**WBMASONCOMPANY/OFFICEPROD LAW",01/08/2026,"WBMASONCOMPANY/OFFICEPROD LAW","*OFFICEOFJULIEMFRA",-84.98,,167752.89,
"20260106000000[-5:EST]*-1278.00*1*3478*Teller Check",01/06/2026,"Teller Check","",-1278.00,,167837.87,3478
"20260106000000[-5:EST]*-330.00*1*3477*Teller Check",01/06/2026,"Teller Check","",-330.00,,169115.87,3477
"20260105000000[-5:EST]*-339.88*1*3473*Check",01/05/2026,"Check","",-339.88,,169445.87,3473
"20260105000000[-5:EST]*-250.00*10**EVOLVE IT, LLC/SALE JULIE M.",01/05/2026,"EVOLVE IT, LLC/SALE JULIE M.","FRANCES",-250.00,,169785.75,
"20260105000000[-5:EST]*-178.84*1*3474*Check",01/05/2026,"Check","",-178.84,,170035.75,3474
"20260105000000[-5:EST]*-32.18*10**AFFINIPAY/J2757 OOFF",01/05/2026,"AFFINIPAY/J2757 OOFF","TRN*1*CZ10000ME7F7C\\\\RMR*IK*AFFINIPAY\\\\ JULIE M FRANCES PC",-32.18,,170214.59,
"20260102000000[-5:EST]*-466.06*13**POS Purchase With PIN FRANKLIN",01/02/2026,"POS Purchase With PIN FRANKLIN","SQUARE 55 RAIL SARATOGA SPRI NY 99999999 *****9214 12/31 17:17",-466.06,,152746.77,
"20251231000000[-5:EST]*-290.00*10**SMITH EXECUTIVE/SALE JULIE M",12/31/2025,"SMITH EXECUTIVE/SALE JULIE M","FRANCES",-290.00,,152323.48,
"20251231000000[-5:EST]*-44.95*10**FIRSTLIGHT PMNT/BILLPAY LAW",12/31/2025,"FIRSTLIGHT PMNT/BILLPAY LAW","OFFICE OF JULIE M.",-44.95,,152613.48,
"20251229000000[-5:EST]*-1685.00*12**JMF life insurace TO: DDXXXX3165",12/29/2025,"JMF life insurace TO: DDXXXX3165","",-1685.00,,152355.56,
"20251226000000[-5:EST]*-288.13*13**POS Purchase Non-PIN TST*",12/26/2025,"POS Purchase Non-PIN TST*","FRANKLIN SQUARE MA SARATOGA SPRI NY 88451740 *****9214 12/25 09:43",-288.13,,149524.75,
"20251226000000[-5:EST]*-290.08*13**POS Purchase With PIN FRANKLIN",12/26/2025,"POS Purchase With PIN FRANKLIN","SQUARE 55 RAIL SARATOGA SPRI NY 99999999 *****9214 12/24 14:39",-290.08,,149812.88,
"20251223000000[-5:EST]*-309.01*13**POS Purchase Non-PIN",12/23/2025,"POS Purchase Non-PIN","CVS/PHARMACY #03379 WILTON NY INA500 *****9214 12/22 05:02",-309.01,,150102.96,
"20251223000000[-5:EST]*-106.38*13**POS Purchase Non-PIN PRIMO",12/23/2025,"POS Purchase Non-PIN PRIMO","PIZZA SARATOGA SPRI NY 03529273 *****9214 12/21 18:58",-106.38,,150411.97,
"20251223000000[-5:EST]*-373.43*13**POS Purchase With PIN FRANKLIN",12/23/2025,"POS Purchase With PIN FRANKLIN","SQUARE 55 RAIL SARATOGA SPRI NY 99999999 *****9214 12/22 16:09",-373.43,,150518.35,
"20251223000000[-5:EST]*-553.86*13**POS Purchase Non-PIN VERIZON",12/23/2025,"POS Purchase Non-PIN VERIZON","WRLS D0099-01 SARATOGA SPRI NY 70741952 *****9214 12/21 15:59",-553.86,,150891.78,
"20251222000000[-5:EST]*-365.69*1*3472*Check",12/22/2025,"Check","",-365.69,,151419.96,3472
"20251222000000[-5:EST]*-330.05*13**POS Purchase Non-PIN HOMEGOODS",12/22/2025,"POS Purchase Non-PIN HOMEGOODS","# 0734 SARATOGA SPRI NY INC800 *****9214 12/21 06:48",-330.05,,151785.65,
"20251222000000[-5:EST]*-207.51*13**POS Purchase Non-PIN BEST BUY",12/22/2025,"POS Purchase Non-PIN BEST BUY","00005413 SARATOGA SPRI NY 064 *****9214 12/21 06:48",-207.51,,152115.70,
"20251222000000[-5:EST]*-183.99*13**POS Purchase Non-PIN BEST BUY",12/22/2025,"POS Purchase Non-PIN BEST BUY","00005413 SARATOGA SPRI NY 064 *****9214 12/21 06:48",-183.99,,152323.21,
"20251222000000[-5:EST]*-6.99*13**POS Purchase Non-PIN MRS.",12/22/2025,"POS Purchase Non-PIN MRS.","LONDON\`S SARATOGA SARATOGA SPRI NY IN0800 *****9214 12/20 22:56",-6.99,,152507.20,
"20251222000000[-5:EST]*-150.00*13**POS Purchase Non-PIN TST*",12/22/2025,"POS Purchase Non-PIN TST*","SENECA RESTAURANT SARATOGA SPRI NY 25062427 *****9214 12/21 10:31",-150.00,,152514.19,
"20251222000000[-5:EST]*-279.56*13**POS Purchase Non-PIN SP LEX",12/22/2025,"POS Purchase Non-PIN SP LEX","CLEO 151-85870809 NY DVXPSRHW *****9214 12/20 04:23",-279.56,,152664.19,
"20251222000000[-5:EST]*-184.04*13**POS Purchase Non-PIN SP LEX",12/22/2025,"POS Purchase Non-PIN SP LEX","CLEO 151-85870809 NY DVXPSRHW *****9214 12/20 04:13",-184.04,,152943.75,
"20251222000000[-5:EST]*-1009.45*13**POS Purchase Non-PIN WISHING",12/22/2025,"POS Purchase Non-PIN WISHING","WELL GANSEVOORT NY 03493828 *****9214 12/20 15:06",-1009.45,,153127.79,
"20251222000000[-5:EST]*-163.22*13**POS Purchase Non-PIN THE CANDY",12/22/2025,"POS Purchase Non-PIN THE CANDY","COMPANY SARATOGA SPGS NY 68534154 *****9214 12/19 05:33",-163.22,,154137.24,
"20251222000000[-5:EST]*-15.60*13**POS Purchase Non-PIN USPS PO",12/22/2025,"POS Purchase Non-PIN USPS PO","3570930867 SARATOGA SPRI NY IN1070 *****9214 12/19 05:27",-15.60,,154300.46,
"20251222000000[-5:EST]*-290.56*13**POS Purchase Non-PIN NORTHSHIRE",12/22/2025,"POS Purchase Non-PIN NORTHSHIRE","BOOKS SARATO SARATOGA SPRI NY IN1090 *****9214 12/19 23:14",-290.56,,154316.06,
"20251222000000[-5:EST]*-13.87*13**POS Purchase Non-PIN NORTHSHIRE",12/22/2025,"POS Purchase Non-PIN NORTHSHIRE","BOOKS SARATO SARATOGA SPRI NY IN2000 *****9214 12/19 23:14",-13.87,,154606.62,
"20251219000000[-5:EST]*-3000.00*12**14 Bennington Loop mortgage TO:",12/19/2025,"14 Bennington Loop mortgage TO:","DDXXXX31 65",-3000.00,,154412.98,
"20251219000000[-5:EST]*-172.92*13**POS Purchase Non-PIN SQ *PDT",12/19/2025,"POS Purchase Non-PIN SQ *PDT","MAISON SARATOGA SPRI NY 77827301 *****9214 12/18 18:30",-172.92,,157412.98,
"20251218000000[-5:EST]*-466.00*10**NEW YORK CENTRAL/EFT DEBIT",12/18/2025,"NEW YORK CENTRAL/EFT DEBIT","JULIE M FRANCES",-466.00,,157585.90,
"20251218000000[-5:EST]*-334.38*10**EVOLVE IT, LLC/SALE JULIE M",12/18/2025,"EVOLVE IT, LLC/SALE JULIE M","FRANCES",-334.38,,158051.90,
"20251218000000[-5:EST]*-289.00*10**EVOLVE IT, LLC/SALE JULIE M.",12/18/2025,"EVOLVE IT, LLC/SALE JULIE M.","FRANCES",-289.00,,158386.28,
"20251218000000[-5:EST]*-150.34*1*3466*Check",12/18/2025,"Check","",-150.34,,158675.28,3466,
"20251218000000[-5:EST]*-26.75*10**EVOLVE IT, LLC/SALE JULIE M.",12/18/2025,"EVOLVE IT, LLC/SALE JULIE M.","FRANCES",-26.75,,158825.62,
"20251218000000[-5:EST]*-16.55*10**EVOLVE IT, LLC/SALE JULIE M.",12/18/2025,"EVOLVE IT, LLC/SALE JULIE M.","FRANCES",-16.55,,158852.37,
"20251218000000[-5:EST]*-822.62*12**boat loan TO: DDXXXX3165",12/18/2025,"boat loan TO: DDXXXX3165","",-822.62,,158868.92,
"20251218000000[-5:EST]*-262.40*13**POS Purchase With PIN USPS PO",12/18/2025,"POS Purchase With PIN USPS PO","3570930867 SARATOGA SPRI NY 93086797 *****9214 12/17 15:09",-262.40,,159691.54,
"20251217000000[-5:EST]*-3000.00*12**14 Bennington mortgage TO:",12/17/2025,"14 Bennington mortgage TO:","DDXXXX3165",-3000.00,,154953.94,
"20251217000000[-5:EST]*-97.40*13**POS Purchase Non-PIN OSAKA",12/17/2025,"POS Purchase Non-PIN OSAKA","SUSHI HOUSE SARATOGA SPRI NY 00010803 *****9214 12/16 23:30",-97.40,,157953.94,
"20251217000000[-5:EST]*-17.33*13**POS Purchase Non-PIN TARGET",12/17/2025,"POS Purchase Non-PIN TARGET","T-1271 Saratoga Spri NY 31271157 *****9214 12/16 18:01",-17.33,,158051.34,
"20251216000000[-5:EST]*-240.89*10**NYS DTF WT/TAX PAYMNT",12/16/2025,"NYS DTF WT/TAX PAYMNT","WPWF2512158557295",-240.89,,158068.67,
"20251216000000[-5:EST]*-63.28*1*3470*Check",12/16/2025,"Check","",-63.28,,158309.56,3470,
"20251216000000[-5:EST]*-229.23*13**POS Purchase Non-PIN FRANKLIN",12/16/2025,"POS Purchase Non-PIN FRANKLIN","SQUARE MARKET SARATOGA SPRI NY 69956741 *****9214 12/15 09:54",-229.23,,158372.84,
"20251216000000[-5:EST]*-86.27*13**POS Purchase Non-PIN SARATOGA",12/16/2025,"POS Purchase Non-PIN SARATOGA","QUALITY HARDWA 518-5849180 NY 77552435 *****9214 12/14 14:39",-86.27,,158602.07,
"20251215000000[-5:EST]*-906.07*10**IRS/USATAXPYMT LAW OFFICE OF",12/15/2025,"IRS/USATAXPYMT LAW OFFICE OF","JULIE M",-906.07,,158688.34,
"20251215000000[-5:EST]*-400.00*1*3468*Check",12/15/2025,"Check","",-400.00,,159594.41,3468,
"20251215000000[-5:EST]*-303.72*1*3471*Check",12/15/2025,"Check","",-303.72,,159994.41,3471,
"20251215000000[-5:EST]*-100.00*1*3465*Check",12/15/2025,"Check","",-100.00,,160298.13,3465,
"20251215000000[-5:EST]*-68.74*13**POS Purchase Non-PIN FRANKLIN",12/15/2025,"POS Purchase Non-PIN FRANKLIN","SQUARE MARKET SARATOGA SPRI NY 75543715 *****9214 12/14 09:39",-68.74,,160398.13,
"20251215000000[-5:EST]*-222.62*13**POS Purchase Non-PIN HENRY",12/15/2025,"POS Purchase Non-PIN HENRY","STREET TAPROOM SARATOGA SPGS NY IN8800 *****9214 12/13 21:35",-222.62,,160466.87,
"20251212000000[-5:EST]*-2000.00*10**AMEX EPAYMENT/ACH PMT JMF LAW",12/12/2025,"AMEX EPAYMENT/ACH PMT JMF LAW","PC Operating A",-2000.00,,144413.14,
"20251212000000[-5:EST]*-119.55*10**WBMASONCOMPANY/OFFICEPROD LAW",12/12/2025,"WBMASONCOMPANY/OFFICEPROD LAW","*OFFICEOFJULIEMFRA",-119.55,,146413.14,
"20251212000000[-5:EST]*-37.00*1*3469*Teller Check",12/12/2025,"Teller Check","",-37.00,,146532.69,3469,
"20251211000000[-5:EST]*-355.00*10**AMEX EPAYMENT/ACH PMT JMF LAW",12/11/2025,"AMEX EPAYMENT/ACH PMT JMF LAW","PC Operating A",-355.00,,146569.69,
"20251211000000[-5:EST]*-88.22*1*3467*Teller Check",12/11/2025,"Teller Check","",-88.22,,146924.69,3467,
"20251211000000[-5:EST]*-211.99*13**POS Purchase With PIN FRANKLIN",12/11/2025,"POS Purchase With PIN FRANKLIN","SQUARE 55 RAIL SARATOGA SPRI NY 99999999 *****9214 12/10 16:02",-211.99,,147012.91,
"20251210000000[-5:EST]*-220.21*1*3460*Check",12/10/2025,"Check","",-220.21,,147224.90,3460,
"20251210000000[-5:EST]*-50.00*1*3420*Check",12/10/2025,"Check","",-50.00,,147445.11,3420,
"20251210000000[-5:EST]*-39.59*1*3462*Check",12/10/2025,"Check","",-39.59,,147495.11,3462`;
// --- EMBEDDED DATA END ---

// State
let allData = [];
let headers = [];
let qbData = { expenses: [], deposits: [], vendors: [], customers: [] };

// DOM Elements
const connectBtn = document.getElementById('btn-connect');
const syncBtn = document.getElementById('btn-sync');
const statusSpan = document.getElementById('connection-status');
const customerSelect = document.getElementById('customer-select');

// CSV Parser
function parseCSV(text) {
    const lines = text.split('\n');
    const metadata = [];
    let headerLineIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Transaction Number')) {
            headerLineIndex = i;
            break;
        }
        if (lines[i].trim()) metadata.push(lines[i].trim());
    }
    if (headerLineIndex === -1) return { metadata, headers: [], data: [] };

    const splitCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else current += char;
        }
        result.push(current);
        return result.map(s => s.trim().replace(/^"|"$/g, ''));
    };

    let csvHeaders = splitCSVLine(lines[headerLineIndex]);

    // Check if 'QB Status' is already there, if not we add it in load logic or here if strict.
    // For raw parse, we return what's in the file.

    const data = [];
    for (let i = headerLineIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const row = splitCSVLine(line);
        // Normalize length to headers
        while (row.length < csvHeaders.length) row.push('');
        data.push(row);
    }
    return { metadata, headers: csvHeaders, data };
}

// Rendering
function renderTable(dataToRender) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    dataToRender.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach((cell, idx) => {
            const td = document.createElement('td');

            // Special rendering for Status
            if (headers[idx] === 'QB Status') {
                const span = document.createElement('span');
                let cls = 'status-pending';
                if (cell === 'Match Found') cls = 'status-match';
                if (cell === 'Potential Match') cls = 'status-potential';
                if (cell === 'No Match') cls = 'status-nomatch';

                span.className = `status-pill ${cls}`;
                span.textContent = cell;
                td.appendChild(span);
            } else {
                td.textContent = cell;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function renderHeaders(headersList) {
    const theadRow = document.getElementById('header-row');
    const filterRow = document.getElementById('filter-row');
    theadRow.innerHTML = '';
    filterRow.innerHTML = '';

    headersList.forEach((header) => {
        const th = document.createElement('th');
        th.textContent = header;
        theadRow.appendChild(th);

        const thFilter = document.createElement('th');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Filter...';
        input.className = 'filter-input';
        input.oninput = filterTable;
        thFilter.appendChild(input);
        filterRow.appendChild(thFilter);
    });
}

function filterTable() {
    const inputs = document.querySelectorAll('.filter-input');
    const filters = Array.from(inputs).map(input => input.value.toLowerCase());
    const filteredData = allData.filter(row => {
        return row.every((cell, index) => {
            const filterText = filters[index];
            if (!filterText) return true;
            return cell.toLowerCase().includes(filterText);
        });
    });
    renderTable(filteredData);
}

function displayMetadata(metadata) {
    document.getElementById('metadata-display').innerHTML = metadata.join(' &nbsp;|&nbsp; ');
}

// Logic
function loadData(csvText) {
    const result = parseCSV(csvText);
    const parsedHeaders = result.headers;
    const parsedData = result.data;
    const meta = result.metadata;

    // First load init: set global headers and data
    // Ensure we have the base headers plus ours
    // Check if 'QB Status' is already there
    if (!parsedHeaders.includes("QB Status")) {
        parsedHeaders.push("QB Status", "Vendor Category");
        parsedData.forEach(row => {
            while (row.length < parsedHeaders.length) row.push('');
            row[parsedHeaders.length - 2] = 'Pending';
        });
    }

    headers = parsedHeaders;
    allData = parsedData;

    displayMetadata(meta);
    renderHeaders(headers);
    renderTable(allData);
}

// File Upload Handler (Deduplication)
document.getElementById('file-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        mergeData(event.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
});

function mergeData(csvText) {
    const result = parseCSV(csvText);
    const newData = result.data;

    // Ensure new data aligns with current headers (columns 0 to 7 usually)
    // We assume same schema.

    // Create Set of existing keys
    const existingKeys = new Set(allData.map(row => generateKey(row)));
    let addedCount = 0;

    newData.forEach(row => {
        const key = generateKey(row);
        if (!existingKeys.has(key)) {
            // Add QB columns if missing (csvText likely lacks them)
            while (row.length < headers.length) row.push('');
            row[headers.length - 2] = 'Pending';

            allData.push(row);
            existingKeys.add(key);
            addedCount++;
        }
    });

    if (addedCount > 0) {
        alert(`Merged ${addedCount} new transactions. Ignored ${newData.length - addedCount} duplicates.`);
        renderTable(allData);
        // If we have QB data, re-run matching
        if (qbData.expenses.length > 0 || qbData.deposits.length > 0) {
            runReconciliation();
        }
    } else {
        alert('No new unique transactions found.');
    }
}

function generateKey(row) {
    // Key: Date(1) + Description(2) + AmountDebit(4) + AmountCredit(5) + CheckNum(7)
    // Returns string
    const val = (idx) => row[idx] ? row[idx].trim() : '';
    // Use column 1 (Date), 2 (Desc), 4 (Debit), 5 (Credit), 7 (CheckNum). 
    // Careful about indices.
    return `${val(1)}|${val(2)}|${val(4)}|${val(5)}|${val(7)}`;
}

// QB Connect
function connectQB() {
    window.location.href = '/auth/connect';
}

// Check Connection
fetch('/api/status').then(res => res.json()).then(data => {
    if (data.isConnected) {
        statusSpan.textContent = 'Connected to QuickBooks';
        statusSpan.style.color = 'var(--success-color)';
        connectBtn.style.display = 'none';
        syncBtn.disabled = false;

        // Unhide customer
        if (customerSelect) customerSelect.classList.remove('hidden');
    }
});

// Sync Logic
async function syncQB() {
    syncBtn.textContent = "Syncing...";
    syncBtn.disabled = true;

    try {
        const res = await fetch('/api/qb-data');
        if (!res.ok) throw new Error("Failed to fetch data");
        qbData = await res.json();

        console.log("QB Data Fetched:", qbData);
        populateCustomers();
        runReconciliation();

    } catch (e) {
        alert("Error syncing: " + e.message);
    } finally {
        syncBtn.textContent = "Sync & Match";
        syncBtn.disabled = false;
    }
}

function populateCustomers() {
    customerSelect.innerHTML = '<option value="">Select Customer...</option>';
    if (qbData.customers && qbData.customers.length > 0) {
        qbData.customers.forEach(c => {
            const option = document.createElement('option');
            option.value = c.Id;
            option.textContent = c.DisplayName;
            customerSelect.appendChild(option);
        });
        customerSelect.classList.remove('hidden');
    }
}

function runReconciliation() {
    // 1. Map Vendors for Lookup
    const vendorMap = new Map();
    qbData.vendors.forEach(v => vendorMap.set(v.DisplayName.toLowerCase(), v));

    // 2. Iterate Rows
    allData.forEach(row => {
        // row indices: 2=Description, 4=Debit, 5=Credit
        const desc = row[2].toLowerCase();
        const amountDebit = parseFloat(row[4]) || 0;
        const amountCredit = parseFloat(row[5]) || 0;
        const amount = amountDebit !== 0 ? amountDebit : amountCredit;

        // A. Match Status
        // Simple logic: Look for matching amount in recent expenses/deposits
        // In real app, date comparison is needed
        let match = 'No Match';

        // Check Expenses (for debits)
        if (amount < 0) {
            const foundExp = qbData.expenses.find(e => Math.abs(e.TotalAmt - Math.abs(amount)) < 0.01);
            if (foundExp) match = 'Match Found';
        }
        // Check Deposits (for credits)
        else if (amount > 0) {
            const foundDep = qbData.deposits.find(d => Math.abs(d.TotalAmt - amount) < 0.01);
            if (foundDep) match = 'Match Found';
        }

        // B. Vendor Category
        // Heuristic: Does description contain a vendor name?
        let vendorCat = '';
        for (const [name, vendor] of vendorMap) {
            if (desc.includes(name.toLowerCase())) {
                vendorCat = vendor.DisplayName; // Could serve as category
                if (match === 'No Match') match = 'Potential Match'; // If we know the vendor, it's promising
                break;
            }
        }

        // Update Row
        // Column indices based on added columns: len-2 = Status, len-1 = Vendor
        row[row.length - 2] = match;
        row[row.length - 1] = vendorCat;
    });

    renderTable(allData);
}

// Init
loadData(INITIAL_CSV_DATA);
