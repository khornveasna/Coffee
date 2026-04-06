// Orders: list, view, print, export

CoffeePOS.prototype.renderOrders = async function () {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;">កំពុងទាញយកទិន្ននយ...</td></tr>';

    // Load staff dropdown if not already loaded
    await this.loadStaffFilter();

    try {
        // Get date range from inputs
        const startDateInput = document.getElementById('orderStartDate').value;
        const endDateInput = document.getElementById('orderEndDate').value;
        const staffFilter = document.getElementById('orderStaffFilter').value;
        
        let url = '/api/orders?page=1&limit=1000&';
        
        if (startDateInput && endDateInput) {
            url += `startDate=${startDateInput}&endDate=${endDateInput}&`;
        } else if (startDateInput) {
            url += `startDate=${startDateInput}&endDate=${startDateInput}&`;
        }
        
        // Add staff filter if selected
        if (staffFilter && staffFilter !== 'all') {
            url += `userId=${staffFilter}&`;
        }
        
        if (this.currentUser.role === 'staff') url += `userId=${this.currentUser.id}&`;

        // Use apiRequest helper to include JWT token
        const result = await this.apiRequest(url);

        if (!result.success) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-light);">មិនអាចទាញយកទិន្ននយបានទេ!</td></tr>';
            this.showToast('មិនអាចទាញយកការលក់បានទេ!', 'error');
            return;
        }

        const orders = result.orders;
        this.data.orders = orders;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-light);">គ្មានការលក់</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map((order, index) => {
            const items     = parseOrderItems(order.items);
            const itemCount = items.reduce((s, i) => s + i.quantity, 0);
            const itemNames = items.map(i => i.name).join(', ');
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${order.receiptNumber}</td>
                    <td>${formatDate(order.date)}</td>
                    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${itemNames}</td>
                    <td>${itemCount}</td>
                    <td>${formatCurrency(order.total)}</td>
                    <td>${order.discountAmount > 0 ? formatCurrency(order.discountAmount) : '-'}</td>
                    <td>${order.userName}</td>
                    <td><button class="btn-view-order" onclick="pos.viewOrder('${order.id}')"><i class="fas fa-eye"></i></button></td>
                </tr>`;
        }).join('');
    } catch (error) {
        console.error('Render orders error:', error);
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-light);">កំហុសក្នុងការទាញយកទិន្ននយ!</td></tr>';
        this.showToast('កំហុស: ' + error.message, 'error');
    }
};

// Load staff members into the filter dropdown
CoffeePOS.prototype.loadStaffFilter = async function () {
    const staffSelect = document.getElementById('orderStaffFilter');
    
    // Only load once or if empty
    if (staffSelect.options.length > 1) return;
    
    try {
        const result = await this.apiRequest('/api/users?page=1&limit=100');
        
        if (result.success && result.users) {
            // Keep the "All" option
            staffSelect.innerHTML = '<option value="all">ទាំងអស់</option>';
            
            // Add each user as an option
            result.users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.fullname} (${user.role})`;
                staffSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Load staff filter error:', error);
    }
};

CoffeePOS.prototype.viewOrder = function (orderId) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return;

    const items = parseOrderItems(order.items);
    this.viewingOrder = { ...order, items };

    document.getElementById('orderViewContent').innerHTML = `
        <div class="order-view-header">
            <div class="order-info-item"><label>លេខវិក័យបត្រ</label><span>${order.receiptNumber}</span></div>
            <div class="order-info-item"><label>កាលបរិច្ឆេទ</label><span>${formatDate(order.date)}</span></div>
            <div class="order-info-item"><label>អ្នកបម្រើ</label><span>${order.userName}</span></div>
            <div class="order-info-item"><label>វិធីទូទាត់</label><span>${order.paymentMethod.toUpperCase()}</span></div>
        </div>
        <div class="order-view-items">
            ${items.map(item => `
                <div class="order-view-item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>${formatCurrency(item.price * item.quantity)}</span>
                </div>`).join('')}
        </div>
        <div class="order-view-totals">
            <div class="receipt-row"><span>ចំនួនទឹកប្រាក់:</span><span>${formatCurrency(order.subtotal)}</span></div>
            ${order.discountAmount > 0 ? `<div class="receipt-row discount"><span>បញ្ចុះ:</span><span>${formatCurrency(order.discountAmount)}</span></div>` : ''}
            <div class="receipt-row total"><span>សរុប:</span><span>${formatCurrency(order.total)}</span></div>
        </div>`;

    document.getElementById('orderViewModal').classList.add('active');
};

CoffeePOS.prototype.printOrder = function () {
    if (!this.viewingOrder) return;
    const order = this.viewingOrder;
    const win   = window.open('', '', 'width=400,height=600');
    win.document.write(`<!DOCTYPE html><html><head><title>Order Receipt</title><style>
        body{font-family:'Courier New',monospace;padding:20px;margin:0}
        .order-item,.total-row{display:flex;justify-content:space-between;margin-bottom:8px}
        .total-row.final{font-weight:bold;font-size:18px;border-top:2px solid #000;padding-top:10px}
    </style></head><body>
        <div style="text-align:center;margin-bottom:15px;"><h3>Coffee POS</h3><p>ប្រព័ន្ធគរប់គ្រងហាងកាហ្វេ</p></div>
        <div style="border-top:2px dashed #ddd;margin:15px 0;"></div>
        <p><strong>លេខវិក័យបត្រ:</strong> ${order.receiptNumber}</p>
        <p><strong>កាលបរិច្ឆេទ:</strong> ${formatDate(order.date)}</p>
        <p><strong>អ្នកបម្រើ:</strong> ${order.userName}</p>
        <div style="border-top:2px dashed #ddd;margin:15px 0;"></div>
        ${order.items.map(item => `<div class="order-item"><span>${item.name} x${item.quantity}</span><span>${formatCurrency(item.price * item.quantity)}</span></div>`).join('')}
        <div style="border-top:2px dashed #ddd;margin:15px 0;"></div>
        <div class="total-row"><span>ចំនួនទឹកប្រាក់:</span><span>${formatCurrency(order.subtotal)}</span></div>
        ${order.discountAmount > 0 ? `<div class="total-row" style="color:red;"><span>បញ្ចុះ:</span><span>${formatCurrency(order.discountAmount)}</span></div>` : ''}
        <div class="total-row final"><span>សរុប:</span><span>${formatCurrency(order.total)}</span></div>
    </body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 250);
};

CoffeePOS.prototype.exportOrders = function () {
    const orders = this.data.orders;
    
    if (orders.length === 0) {
        this.showToast('គ្មានទិន្ននយសម្រាប់ Export', 'warning');
        return;
    }

    // Show export options
    const choice = prompt(
        'ជ្រើសរើសទម្រង់ Export:\n\n' +
        '1 - Excel (CSV)\n' +
        '2 - Word (HTML)\n' +
        '3 - PDF (Print)\n\n' +
        'ចូរវាយលេខ 1, 2, ឬ 3:'
    );

    if (!choice) return;

    switch (choice.trim()) {
        case '1':
            this.exportToExcel(orders);
            break;
        case '2':
            this.exportToWord(orders);
            break;
        case '3':
            this.exportToPDF(orders);
            break;
        default:
            this.showToast('ការជ្រើសរើសមិនត្រឹមត្រូវ!', 'error');
    }
};

CoffeePOS.prototype.exportToExcel = function (orders) {
    // Create CSV content
    let csv = '\ufeffល.រ,លេខវិក័យបត្រ,កាលបរិច្ឆេទ,ភេសជ្ជៈ,ចំនួន,សរុប,បញ្ចុះ,វិធីទូទាត់,អ្នកបម្រើ\n';
    
    orders.forEach((order, index) => {
        const items = parseOrderItems(order.items);
        const itemCount = items.reduce((s, i) => s + i.quantity, 0);
        const itemNames = items.map(i => `${i.name} x${i.quantity}`).join('; ');
        csv += `${index + 1},${order.receiptNumber},${order.date},"${itemNames}",${itemCount},${order.total},${order.discountAmount || 0},${order.paymentMethod},${order.userName}\n`;
    });

    // Download CSV
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    this.showToast('បាន Export ជា Excel (CSV)!', 'success');
};

CoffeePOS.prototype.exportToWord = function (orders) {
    // Create HTML table for Word
    let html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head><meta charset='utf-8'><title>Order Report</title>
    <style>
        body { font-family: 'Khmer OS Battambang', Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th { background-color: #6F4E37; color: white; padding: 10px; border: 1px solid #ddd; }
        td { padding: 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        h1 { color: #6F4E37; text-align: center; }
        .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
    </style>
    </head><body>
    <h1>☕ Coffee POS - របាយការណ៍ការលក់</h1>
    <div class="summary">
        <p><strong>ចំនួនការលក់សរុប:</strong> ${orders.length}</p>
        <p><strong>ទឹកប្រាក់សរុប:</strong> ${formatCurrency(orders.reduce((sum, o) => sum + o.total, 0))}</p>
        <p><strong>កាលបរិច្ឆេទ Export:</strong> ${new Date().toLocaleDateString('km-KH')}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>ល.រ</th>
                <th>លេខវិក័យបត្រ</th>
                <th>កាលបរិច្ឆេទ</th>
                <th>ភេសជ្ជៈ</th>
                <th>ចំនួន</th>
                <th>សរុប</th>
                <th>បញ្ចុះ</th>
                <th>អ្នកបម្រើ</th>
            </tr>
        </thead>
        <tbody>`;

    orders.forEach((order, index) => {
        const items = parseOrderItems(order.items);
        const itemCount = items.reduce((s, i) => s + i.quantity, 0);
        const itemNames = items.map(i => `${i.name} x${i.quantity}`).join(', ');
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${order.receiptNumber}</td>
                <td>${formatDate(order.date)}</td>
                <td>${itemNames}</td>
                <td>${itemCount}</td>
                <td>${formatCurrency(order.total)}</td>
                <td>${order.discountAmount > 0 ? formatCurrency(order.discountAmount) : '-'}</td>
                <td>${order.userName}</td>
            </tr>`;
    });

    html += `</tbody></table></body></html>`;

    // Download as Word document
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.doc`;
    link.click();
    this.showToast('បាន Export ជា Word!', 'success');
};

CoffeePOS.prototype.exportToPDF = function (orders) {
    // Create printable HTML
    const printWindow = window.open('', '_blank');
    
    let html = `<!DOCTYPE html>
    <html>
    <head>
        <title>Order Report - Coffee POS</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #6F4E37; text-align: center; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; font-size: 12px; }
            th { background-color: #6F4E37; color: white; padding: 8px; border: 1px solid #ddd; }
            td { padding: 6px; border: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
            @media print {
                button { display: none; }
            }
        </style>
    </head>
    <body>
        <h1>☕ Coffee POS - របាយការណ៍ការលក់</h1>
        <div class="summary">
            <p><strong>ចំនួនការលក់សរុប:</strong> ${orders.length}</p>
            <p><strong>ទឹកប្រាក់សរុប:</strong> ${formatCurrency(orders.reduce((sum, o) => sum + o.total, 0))}</p>
            <p><strong>កាលបរិច្ឆេទ Export:</strong> ${new Date().toLocaleDateString('km-KH')}</p>
        </div>
        <button onclick="window.print()" style="padding: 10px 20px; background: #6F4E37; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 20px 0;">
            🖨️ Print / Save as PDF
        </button>
        <table>
            <thead>
                <tr>
                    <th>ល.រ</th>
                    <th>លេខវិក័យបត្រ</th>
                    <th>កាលបរិច្ឆេទ</th>
                    <th>ភេសជ្ជៈ</th>
                    <th>ចំនួន</th>
                    <th>សរុប</th>
                    <th>បញ្ចុះ</th>
                    <th>អ្នកបម្រើ</th>
                </tr>
            </thead>
            <tbody>`;

    orders.forEach((order, index) => {
        const items = parseOrderItems(order.items);
        const itemCount = items.reduce((s, i) => s + i.quantity, 0);
        const itemNames = items.map(i => `${i.name} x${i.quantity}`).join(', ');
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${order.receiptNumber}</td>
                <td>${formatDate(order.date)}</td>
                <td>${itemNames}</td>
                <td>${itemCount}</td>
                <td>${formatCurrency(order.total)}</td>
                <td>${order.discountAmount > 0 ? formatCurrency(order.discountAmount) : '-'}</td>
                <td>${order.userName}</td>
            </tr>`;
    });

    html += `</tbody></table></body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    this.showToast('បានបើក PDF - ចុច Print ដើម្បីរក្សាទុក!', 'success');
};
