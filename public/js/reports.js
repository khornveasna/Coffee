// Reports: generate report stats + top products chart

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
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr   = endDate.toISOString().split('T')[0];

    try {
        // Use apiRequest helper to include JWT token
        const [summaryRes, ordersRes] = await Promise.all([
            this.apiRequest(`/api/reports/summary?startDate=${startDateStr}&endDate=${endDateStr}`),
            this.apiRequest(`/api/orders?startDate=${startDateStr}&endDate=${endDateStr}&page=1&limit=1000`)
        ]);

        if (!summaryRes.success) {
            this.showToast('មិនអាចទាញយករបាយការណ៍បានទេ!', 'error');
            return;
        }

        const stats = summaryRes.stats;

        document.getElementById('reportPeriodTitle').innerHTML =
            `<i class="fas fa-calendar-alt"></i><span>រយៈពេល: ${periodLabel}</span>`;
        
        // Update top products title with date range
        document.getElementById('topProductsTitle').innerHTML = 
            `<i class="fas fa-trophy"></i> ភេសជ្ជៈលក់ដាច់ 5 មុខ (${periodLabel})`;
        
        document.getElementById('totalRevenue').textContent   = formatCurrency(stats.totalRevenue);
        document.getElementById('totalOrders').textContent    = stats.totalOrders;
        document.getElementById('topProduct').textContent     = stats.topProduct || '-';
        document.getElementById('avgOrderValue').textContent  = formatCurrency(stats.avgOrderValue);
        document.getElementById('reportTotalRevenue').textContent  = formatCurrency(stats.totalRevenue);
        document.getElementById('reportTotalDiscount').textContent = formatCurrency(stats.totalDiscount);
        document.getElementById('reportCustomers').textContent     = stats.totalOrders;

        let totalItemsSold = 0;
        if (ordersRes.success) {
            ordersRes.orders.forEach(order => {
                const items = parseOrderItems(order.items);
                if (Array.isArray(items)) {
                    totalItemsSold += items.reduce((sum, item) => sum + item.quantity, 0);
                }
            });
        }
        document.getElementById('reportItemsSold').textContent = totalItemsSold;

        await this.loadTopProducts(startDateStr, endDateStr);
    } catch (error) {
        console.error('Generate reports error:', error);
        this.showToast('កំហុសក្នុងការទាញយករបាយការណ៍: ' + error.message, 'error');
    }
};

CoffeePOS.prototype.loadTopProducts = async function (startDate, endDate) {
    try {
        // Use apiRequest helper to include JWT token
        const result = await this.apiRequest(`/api/orders?startDate=${startDate}&endDate=${endDate}&page=1&limit=1000`);
        if (!result.success) return;

        const productSales = {};
        result.orders.forEach(order => {
            const items = parseOrderItems(order.items);
            if (Array.isArray(items)) {
                items.forEach(item => {
                    productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
                });
            }
        });

        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const container = document.getElementById('topProductsList');
        if (topProducts.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:20px;">គ្មានទិន្ននយ</p>';
            return;
        }
        container.innerHTML = topProducts.map(([name, qty], index) => `
            <div class="top-product-item">
                <div class="top-product-rank">#${index + 1}</div>
                <div class="top-product-info">
                    <div class="top-product-name">${name}</div>
                    <div class="top-product-qty">លក់បាន ${qty} ចំនួន</div>
                </div>
            </div>`).join('');
    } catch (error) {
        console.error('Load top products error:', error);
    }
};
