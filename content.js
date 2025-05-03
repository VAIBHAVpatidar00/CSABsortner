// content.js

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
});


console.log("CSAB Rank Sorter content script loaded.");

// Function to extract the closing rank from a table row (tr element)
function getClosingRank(row) {
    try {
        const cells = row.cells;
        if (cells.length > 0) {
            const lastCell = cells[cells.length - 1];
            const span = lastCell.querySelector('span');
            if (span && span.textContent) {
                const rank = parseInt(span.textContent.trim(), 10);
                return isNaN(rank) ? null : rank;
            }
        }
    } catch (error) {
        console.error("Error extracting closing rank from row:", error, row);
    }
    return null;
}

// Function to sort the table
function sortTable(event) {
    if (event) event.preventDefault();

    console.log("Sort button clicked.");
    const targetRankInput = document.getElementById('closingRankInput');
    if (!targetRankInput) {
        console.error("Closing rank input field not found.");
        return;
    }
    const targetRank = parseInt(targetRankInput.value, 10);
    if (isNaN(targetRank)) {
        alert("Please enter a valid number for the closing rank.");
        return;
    }

    console.log("Target Rank:", targetRank);

    const table = document.getElementById('ctl00_ContentPlaceHolder1_GridView1');
    if (!table) {
        console.error("Target table (#ctl00_ContentPlaceHolder1_GridView1) not found.");
        alert("Could not find the results table with ID 'ctl00_ContentPlaceHolder1_GridView1'. The page structure might have changed.");
        return;
    }

    const tbody = table.querySelector('tbody');
    if (!tbody) {
        console.error("Table body (tbody) not found.");
        return;
    }

    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (rows.length <= 1) {
        console.log("No data rows found to sort.");
        return;
    }

    const rowsAboveTarget = [];
    const rowsBelowOrEqualTarget = [];
    const startIndex = (rows.length > 0 && rows[0].querySelectorAll('th').length > 0) ? 1 : 0;

    for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        const closingRank = getClosingRank(row);
        if (closingRank !== null) {
            if (closingRank > targetRank) {
                rowsAboveTarget.push({ row, rank: closingRank });
            } else {
                rowsBelowOrEqualTarget.push({ row, rank: closingRank });
            }
        } else {
            rowsBelowOrEqualTarget.push({ row, rank: Infinity });
            console.warn("Could not parse rank for row:", row);
        }
    }

    console.log(`Found ${rowsAboveTarget.length} rows above target rank.`);
    console.log(`Found ${rowsBelowOrEqualTarget.length} rows below/equal to target rank.`);

    rowsAboveTarget.sort((a, b) => a.rank - b.rank);
    rowsBelowOrEqualTarget.sort((a, b) => a.rank - b.rank);

    const headerRow = (startIndex === 1) ? rows[0] : null;
    tbody.innerHTML = '';
    if (headerRow) {
        tbody.appendChild(headerRow);
    }

    rowsAboveTarget.forEach(item => tbody.appendChild(item.row));
    rowsBelowOrEqualTarget.forEach(item => tbody.appendChild(item.row));

    console.log("Table sorting complete.");
chrome.runtime.sendMessage({
    action: "open_new_tab",
    url: "https://whatsapp.com/channel/0029VbBIrp7Lo4hes2nEgT1F" // Change to your desired URL
});

}

// Function to inject the UI elements (input field and button)
function injectUI() {
    const table = document.getElementById('ctl00_ContentPlaceHolder1_GridView1');
    if (!table) {
        console.warn("Table #ctl00_ContentPlaceHolder1_GridView1 not found yet.");
        return;
    }
    const targetElement = table.parentNode;
    if (!targetElement) {
        console.error("Could not find the table's parent element to inject the UI.");
        return;
    }

    if (document.getElementById('sortRankButton')) {
        console.log("Rank sorter UI already injected.");
        return;
    }

    const container = document.createElement('div');
    container.className = 'rank-sorter-container';

    const label = document.createElement('label');
    label.setAttribute('for', 'closingRankInput');
    label.textContent = 'Sort by Closing Rank >';

    const input = document.createElement('input');
    input.setAttribute('type', 'number');
    input.setAttribute('id', 'closingRankInput');
    input.setAttribute('placeholder', 'Enter Rank');
    input.min = "0";

    const button = document.createElement('button');
    button.setAttribute('id', 'sortRankButton');
    button.setAttribute('type', 'button');
    button.textContent = 'Sort Table';
    button.addEventListener('click', sortTable);

    container.appendChild(label);
    container.appendChild(input);
    container.appendChild(button);

    targetElement.insertBefore(container, table);

    console.log("Rank sorter UI injected.");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUI);
} else {
    injectUI();
}

