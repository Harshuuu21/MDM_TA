/**
 * Products Management Logic
 */

const productsManager = {
    allProducts: [],
    categories: new Set(),
    
    // Initialize products view
    async init() {
        await this.loadProducts();
        this.setupEventListeners();
    },

    // Load products from API
    async loadProducts() {
        try {
            // Show loading skeleton (optional, simplified here)
            const tableBody = document.getElementById('productsTableBody');
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center"><span class="spinner" style="border-top-color: var(--primary-color);"></span> Loading products...</td></tr>`;
            
            this.allProducts = await api.getProducts();
            
            // Extract categories dynamically
            this.allProducts.forEach(p => this.categories.add(p.category));
            this.populateCategoryFilter();
            
            this.renderProducts(this.allProducts);
            
            // Trigger dashboard updates
            if (window.dashboardManager) {
                window.dashboardManager.updateDashboard(this.allProducts);
            }
            
        } catch (error) {
            ui.showToast('Failed to load products', 'error');
            console.error(error);
        }
    },

    // Populate dynamic categories dropdown
    populateCategoryFilter() {
        const select = document.getElementById('categoryFilter');
        // Keep the 'All' option
        select.innerHTML = '<option value="All">All Categories</option>';
        
        [...this.categories].sort().forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
    },

    // Render table
    renderProducts(productsToRender) {
        const tableBody = document.getElementById('productsTableBody');
        const emptyState = document.getElementById('emptyStateContainer');
        const noResults = document.getElementById('noResultsContainer');
        const table = document.getElementById('productsTable');
        
        tableBody.innerHTML = '';
        
        if (this.allProducts.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'flex';
            noResults.style.display = 'none';
            return;
        }

        if (productsToRender.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'none';
            noResults.style.display = 'flex';
            return;
        }
        
        table.style.display = 'table';
        emptyState.style.display = 'none';
        noResults.style.display = 'none';

        productsToRender.forEach(product => {
            const status = ui.getStockStatus(product.quantity);
            const value = product.quantity * product.price;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="product-cell">
                        <div class="product-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                        </div>
                        <span class="product-name">${product.name}</span>
                    </div>
                </td>
                <td>${product.product_id}</td>
                <td>${product.category}</td>
                <td>${product.quantity}</td>
                <td>${ui.formatCurrency(product.price)}</td>
                <td>${ui.formatCurrency(value)}</td>
                <td><span class="badge-status ${status.class}">${status.text}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn btn-view" onclick="productsManager.viewProduct(${product.id})" title="View Details">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button class="action-btn btn-edit" onclick="productsManager.openEditModal(${product.id})" title="Edit Product">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="action-btn btn-delete" onclick="productsManager.openDeleteModal(${product.id})" title="Delete Product">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    },

    // Filtering & Searching
    applyFilters() {
        const searchTerm = document.getElementById('productSearchInput').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value;
        const stockStatus = document.getElementById('stockFilter').value;
        
        let filtered = this.allProducts.filter(p => {
            // Search Match
            const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                                  p.product_id.toLowerCase().includes(searchTerm) ||
                                  p.category.toLowerCase().includes(searchTerm);
            
            // Category Match
            const matchesCat = category === 'All' || p.category === category;
            
            // Stock Match
            let matchesStock = true;
            if (stockStatus !== 'All') {
                const s = ui.getStockStatus(p.quantity).text;
                matchesStock = s === stockStatus;
            }
            
            return matchesSearch && matchesCat && matchesStock;
        });
        
        this.renderProducts(filtered);
    },
    
    async performSearch(query) {
        if (!query) {
            this.applyFilters();
            return;
        }
        
        try {
            const results = await api.searchProducts(query);
            this.renderProducts(results);
        } catch(error) {
            console.error("Search failed:", error);
        }
    },

    // Setup events
    setupEventListeners() {
        // Search & Filters
        document.getElementById('productSearchInput').addEventListener('input', (e) => {
            // Use local filter for fast responsive search if we already have data
            this.applyFilters();
            // Alternatively, hit API: this.performSearch(e.target.value);
        });
        
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('stockFilter').addEventListener('change', () => this.applyFilters());
        
        // Add Product Form
        document.getElementById('openAddProductModalBtn').addEventListener('click', () => {
            this.openAddModal();
        });
        
        document.getElementById('navAddProductBtn').addEventListener('click', () => {
            this.openAddModal();
        });
        
        document.getElementById('closeProductModalBtn').addEventListener('click', () => {
            ui.closeModal('productModal');
        });
        
        document.getElementById('cancelProductBtn').addEventListener('click', (e) => {
            e.preventDefault();
            ui.closeModal('productModal');
        });
        
        document.getElementById('saveProductBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
        
        // Details Modal
        document.getElementById('closeDetailsModalBtn').addEventListener('click', () => ui.closeModal('detailsModal'));
        document.getElementById('closeDetailsBtn').addEventListener('click', () => ui.closeModal('detailsModal'));
        document.getElementById('editFromDetailsBtn').addEventListener('click', () => {
            const id = document.getElementById('editFromDetailsBtn').dataset.id;
            ui.closeModal('detailsModal');
            setTimeout(() => this.openEditModal(id), 300);
        });
        
        // Delete Modal
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => ui.closeModal('deleteModal'));
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.executeDelete());
    },

    // Modal Operations
    openAddModal() {
        validation.clearErrors();
        document.getElementById('productForm').reset();
        document.getElementById('formProductId').value = '';
        document.getElementById('productModalTitle').textContent = 'Add New Product';
        document.getElementById('productId').disabled = false; // allow editing
        ui.openModal('productModal');
    },
    
    openEditModal(id) {
        validation.clearErrors();
        const product = this.allProducts.find(p => p.id == id);
        if (!product) return;
        
        document.getElementById('formProductId').value = product.id;
        document.getElementById('productId').value = product.product_id;
        document.getElementById('productId').disabled = true; // prevent ID edit
        document.getElementById('productName').value = product.name;
        
        // Ensure category exists in dropdown, else add it
        const catSelect = document.getElementById('productCategory');
        if (!Array.from(catSelect.options).some(opt => opt.value === product.category)) {
            const opt = document.createElement('option');
            opt.value = product.category;
            opt.textContent = product.category;
            catSelect.appendChild(opt);
        }
        catSelect.value = product.category;
        
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productPrice').value = product.price;
        
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        ui.openModal('productModal');
    },
    
    async saveProduct() {
        if (!validation.validateProductForm()) return;
        
        const isEdit = document.getElementById('formProductId').value !== '';
        const id = document.getElementById('formProductId').value;
        
        const productData = {
            product_id: document.getElementById('productId').value.trim(),
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            quantity: parseInt(document.getElementById('productQuantity').value, 10),
            price: parseFloat(document.getElementById('productPrice').value)
        };
        
        ui.setButtonLoading('saveProductBtn', true);
        
        try {
            if (isEdit) {
                await api.updateProduct(id, productData);
                ui.showToast('Product updated successfully', 'success');
            } else {
                await api.addProduct(productData);
                ui.showToast('Product added successfully', 'success');
            }
            
            ui.closeModal('productModal');
            await this.loadProducts(); // Refresh list
        } catch (error) {
            ui.showToast(error.message || 'Operation failed', 'error');
        } finally {
            ui.setButtonLoading('saveProductBtn', false, isEdit ? 'Update Product' : 'Add Product');
        }
    },
    
    viewProduct(id) {
        const product = this.allProducts.find(p => p.id == id);
        if (!product) return;
        
        document.getElementById('detailName').textContent = product.name;
        document.getElementById('detailId').textContent = product.product_id;
        document.getElementById('detailCategory').textContent = product.category;
        document.getElementById('detailQuantity').textContent = product.quantity;
        document.getElementById('detailPrice').textContent = ui.formatCurrency(product.price);
        document.getElementById('detailTotalValue').textContent = ui.formatCurrency(product.quantity * product.price);
        document.getElementById('detailDate').textContent = ui.formatDate(product.created_at);
        
        const status = ui.getStockStatus(product.quantity);
        const statusBadge = document.getElementById('detailStatus');
        statusBadge.className = `badge badge-status ${status.class}`;
        statusBadge.textContent = status.text;
        
        // Set id for edit button
        document.getElementById('editFromDetailsBtn').dataset.id = product.id;
        
        ui.openModal('detailsModal');
    },
    
    openDeleteModal(id) {
        const product = this.allProducts.find(p => p.id == id);
        if (!product) return;
        
        document.getElementById('deleteProductName').textContent = product.name;
        document.getElementById('confirmDeleteBtn').dataset.id = product.id;
        ui.openModal('deleteModal');
    },
    
    async executeDelete() {
        const id = document.getElementById('confirmDeleteBtn').dataset.id;
        ui.setButtonLoading('confirmDeleteBtn', true);
        
        try {
            await api.deleteProduct(id);
            ui.showToast('Product deleted successfully', 'success');
            ui.closeModal('deleteModal');
            await this.loadProducts();
        } catch (error) {
            ui.showToast(error.message || 'Failed to delete product', 'error');
        } finally {
            ui.setButtonLoading('confirmDeleteBtn', false, 'Delete Product');
        }
    }
};
