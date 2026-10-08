/**
 * Dashboard & Analytics Logic
 */

const dashboardManager = {
    categoryChartInstance: null,
    stockChartInstance: null,

    updateDashboard(products) {
        // Calculate stats
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
        const lowStockProducts = products.filter(p => p.quantity <= 10);
        const lowStockCount = lowStockProducts.length;
        const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);

        // Update Stat Cards
        this.animateValue('statTotalProducts', totalProducts);
        this.animateValue('statTotalStock', totalStock);
        this.animateValue('statLowStock', lowStockCount);
        document.getElementById('statInventoryValue').textContent = ui.formatCurrency(totalValue);

        // Update Notification Badges
        const badge = document.getElementById('lowStockBadge');
        const dot = document.getElementById('navNotificationDot');
        
        if (lowStockCount > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = lowStockCount;
            dot.style.display = 'block';
        } else {
            badge.style.display = 'none';
            dot.style.display = 'none';
        }

        // Render Recent Products (Dashboard View)
        this.renderRecentProducts(products);
        
        // Render Low Stock View
        this.renderLowStockView(lowStockProducts);
        
        // Update Charts
        this.renderCharts(products);
    },
    
    renderRecentProducts(products) {
        const tbody = document.getElementById('recentProductsBody');
        tbody.innerHTML = '';
        
        // Get top 5 recent (assuming already sorted desc by date from API)
        const recent = products.slice(0, 5);
        
        if (recent.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No products available</td></tr>`;
            return;
        }

        recent.forEach(p => {
            const status = ui.getStockStatus(p.quantity);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="product-cell">
                        <span class="product-name">${p.name}</span>
                    </div>
                </td>
                <td>${p.product_id}</td>
                <td>${p.category}</td>
                <td>${p.quantity}</td>
                <td><span class="badge-status ${status.class}">${status.text}</span></td>
            `;
            tbody.appendChild(tr);
        });
    },
    
    renderLowStockView(lowStockProducts) {
        const tbody = document.getElementById('lowStockTableBody');
        const emptyState = document.getElementById('lowStockEmptyState');
        const bannerText = document.getElementById('lowStockCountText');
        
        tbody.innerHTML = '';
        bannerText.textContent = `${lowStockProducts.length} products are running low on stock`;
        
        if (lowStockProducts.length === 0) {
            document.querySelector('#lowStockView .table-container table').style.display = 'none';
            document.getElementById('lowStockBanner').style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }
        
        document.querySelector('#lowStockView .table-container table').style.display = 'table';
        document.getElementById('lowStockBanner').style.display = 'flex';
        emptyState.style.display = 'none';
        
        lowStockProducts.sort((a,b) => a.quantity - b.quantity).forEach(p => {
            const status = ui.getStockStatus(p.quantity);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="product-cell">
                        <span class="product-name">${p.name}</span>
                        <span class="text-muted" style="font-size:0.75rem;margin-left:8px">${p.product_id}</span>
                    </div>
                </td>
                <td>${p.category}</td>
                <td style="font-weight:600; color: ${p.quantity===0 ? 'var(--danger)' : 'var(--warning)'}">${p.quantity}</td>
                <td><span class="badge-status ${status.class}">${status.text}</span></td>
                <td class="text-right">
                    <button class="btn btn-outline btn-sm" onclick="productsManager.viewProduct(${p.id})">View Details</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },
    
    renderCharts(products) {
        if (typeof Chart === 'undefined') return;

        // Prepare Category Data
        const catMap = {};
        products.forEach(p => {
            catMap[p.category] = (catMap[p.category] || 0) + 1;
        });
        
        const catLabels = Object.keys(catMap);
        const catData = Object.values(catMap);
        
        // Prepare Stock Data
        let inStock = 0, lowStock = 0, outStock = 0;
        products.forEach(p => {
            if (p.quantity === 0) outStock++;
            else if (p.quantity <= 10) lowStock++;
            else inStock++;
        });

        // Common Chart options
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        };

        // Render Category Chart
        const catCtx = document.getElementById('categoryChart').getContext('2d');
        if (this.categoryChartInstance) this.categoryChartInstance.destroy();
        
        this.categoryChartInstance = new Chart(catCtx, {
            type: 'doughnut',
            data: {
                labels: catLabels,
                datasets: [{
                    data: catData,
                    backgroundColor: [
                        '#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', 
                        '#ec4899', '#06b6d4', '#f43f5e', '#64748b'
                    ],
                    borderWidth: 0
                }]
            },
            options: commonOptions
        });

        // Render Stock Chart
        const stockCtx = document.getElementById('stockChart').getContext('2d');
        if (this.stockChartInstance) this.stockChartInstance.destroy();
        
        this.stockChartInstance = new Chart(stockCtx, {
            type: 'pie',
            data: {
                labels: ['In Stock (>10)', 'Low Stock (1-10)', 'Out of Stock (0)'],
                datasets: [{
                    data: [inStock, lowStock, outStock],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: commonOptions
        });
    },
    
    animateValue(id, end, duration = 1000) {
        const obj = document.getElementById(id);
        if (!obj) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * end);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end;
            }
        };
        window.requestAnimationFrame(step);
    }
};
