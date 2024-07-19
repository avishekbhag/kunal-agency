document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-item-form');
    const tableBody = document.querySelector('#inventory-table tbody');

    // Load inventory from localStorage
    loadInventory();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const itemName = document.getElementById('item-name').value;
        const itemBrand = document.getElementById('item-brand').value;
        const itemPrice = document.getElementById('item-price').value;
        const itemStock = document.getElementById('item-stock').value;
        const itemDate = document.getElementById('item-date').value;

        addItemToTable(itemName, itemBrand, itemPrice, itemStock, itemDate);
        saveInventory();
        form.reset();
    });

    document.getElementById('save-to-excel').addEventListener('click', () => {
        const { XLSX } = window;
        const table = document.getElementById('inventory-table');

        // Create a new table element to copy the original table's content, but without the action column
        const tableCopy = document.createElement('table');
        const tableCopyBody = document.createElement('tbody');

        // Copy the header row
        const headerRow = table.querySelector('thead').querySelector('tr');
        const headerRowCopy = headerRow.cloneNode(true);
        headerRowCopy.lastElementChild.remove(); // Remove last header cell (Action column)
        const thead = document.createElement('thead');
        thead.appendChild(headerRowCopy);
        tableCopy.appendChild(thead);

        // Copy data rows excluding the action column
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const rowCopy = row.cloneNode(true);
            rowCopy.lastElementChild.remove(); // Remove last cell (Action column)
            tableCopyBody.appendChild(rowCopy);
        });

        tableCopy.appendChild(tableCopyBody);

        // Convert to workbook and save to file
        const wb = XLSX.utils.table_to_book(tableCopy, { sheet: "Inventory" });
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `inventory_${date}.xlsx`);
    });

    function addItemToTable(name, brand, price, stock, date) {
        const row = document.createElement('tr');

        // Create and append cells
        const cells = [name, brand, price, stock, date];
        cells.forEach(cellData => {
            const cell = document.createElement('td');
            cell.textContent = cellData;
            row.appendChild(cell);
        });

        // Create and append remove button
        const actionCell = document.createElement('td');
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-btn';
        removeButton.addEventListener('click', () => {
            row.remove();
            saveInventory();
        });
        actionCell.appendChild(removeButton);
        row.appendChild(actionCell);

        // Append row to table
        tableBody.appendChild(row);
    }

    function saveInventory() {
        const rows = tableBody.querySelectorAll('tr');
        const inventory = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return Array.from(cells).slice(0, -1).map(cell => cell.textContent); // Exclude the last cell (Remove button)
        });
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }

    function loadInventory() {
        const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
        inventory.forEach(item => {
            addItemToTable(...item);
        });
    }
});

// scripts.js (Billing Page)
// scripts.js (Billing Page)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('billing-form');
    const itemsList = document.getElementById('items-list');

    document.getElementById('add-item').addEventListener('click', () => {
        const itemName = document.getElementById('item-name').value;
        const itemQuantity = document.getElementById('item-quantity').value;
        const itemPrice = document.getElementById('item-price').value;

        if (itemName && itemQuantity > 0 && itemPrice >= 0) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';

            itemDiv.innerHTML = `
                <span>${itemName} - Quantity: ${itemQuantity} - Price: ${itemPrice}</span>
                <button type="button" class="remove-item">Remove</button>
            `;

            itemsList.appendChild(itemDiv);

            // Clear input fields
            document.getElementById('item-name').value = '';
            document.getElementById('item-quantity').value = '';
            document.getElementById('item-price').value = '';
        } else {
            alert('Please fill out all item details correctly.');
        }
    });

    itemsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            e.target.parentElement.remove();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const customerName = document.getElementById('customer-name').value;
        const contactNumber = document.getElementById('contact-number').value;
        const gstNumber = document.getElementById('gst-number').value;

        // Generate a unique bill number
        const billNumber = Math.floor(Math.random() * 10000) + 1;
        const date = new Date().toLocaleDateString();

        const items = Array.from(itemsList.children).map(itemDiv => {
            const text = itemDiv.querySelector('span').textContent;
            const [name, quantity, price] = text.split(' - ').map(part => part.split(': ')[1]);
            return { name, quantity: parseInt(quantity), price: parseFloat(price) };
        });

        // Generate PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add Header
        doc.setFontSize(18);
        doc.text('Kunal Agency', 14, 22);
        doc.setFontSize(12);
        doc.text('Location: Siliguri, West Bengal', 14, 30);
        doc.text('Pin: 736182', 14, 37);
        doc.text('Date: ' + date, 14, 44);
        doc.text('Bill Number: ' + billNumber, 14, 51);

        // Add Customer Info
        doc.setFontSize(14);
        doc.text('Customer Information', 14, 65);
        doc.setFontSize(12);
        doc.text(`Name: ${customerName}`, 14, 75);
        doc.text(`Contact Number: ${contactNumber}`, 14, 82);
        doc.text(`GST Number: ${gstNumber}`, 14, 89);

        // Add Invoice Items
        doc.setFontSize(14);
        doc.text('Invoice Items:', 14, 105);
        let yOffset = 115;
        items.forEach(item => {
            doc.text(`${item.name} - Quantity: ${item.quantity} - Price: ${item.price.toFixed(2)}`, 14, yOffset);
            yOffset += 7;
        });

        // Add Total
        const total = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        doc.text(`Total: ${total.toFixed(2)}`, 14, yOffset + 10);

        // Save PDF
        doc.save('invoice.pdf');
    });
});
