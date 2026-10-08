/**
 * API Utility for connecting to Flask Backend
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const api = {
    /**
     * Generic fetch wrapper
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'API Request failed');
            }
            
            return data;
        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error);
            throw error;
        }
    },

    /**
     * Get all products
     */
    async getProducts() {
        return this.request('/products');
    },

    /**
     * Get single product by ID (DB internal ID)
     */
    async getProduct(id) {
        return this.request(`/products/${id}`);
    },

    /**
     * Search products
     */
    async searchProducts(query) {
        return this.request(`/products/search?q=${encodeURIComponent(query)}`);
    },

    /**
     * Add new product
     */
    async addProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },

    /**
     * Update product
     */
    async updateProduct(id, productData) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    },

    /**
     * Delete product
     */
    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }
};
