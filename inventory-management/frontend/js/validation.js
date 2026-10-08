/**
 * Form Validation Utility
 */

const validation = {
    clearErrors() {
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
    },

    showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorDiv = document.getElementById(`${inputId}Error`);
        
        if (input) input.classList.add('error');
        if (errorDiv) errorDiv.textContent = message;
    },

    validateProductForm() {
        this.clearErrors();
        let isValid = true;

        const productId = document.getElementById('productId').value.trim();
        const productName = document.getElementById('productName').value.trim();
        const productCategory = document.getElementById('productCategory').value;
        const productQuantity = document.getElementById('productQuantity').value;
        const productPrice = document.getElementById('productPrice').value;

        if (!productId) {
            this.showError('productId', 'Product ID is required');
            isValid = false;
        }

        if (!productName || productName.length < 2) {
            this.showError('productName', 'Product name must be at least 2 characters');
            isValid = false;
        }

        if (!productCategory) {
            this.showError('productCategory', 'Please select a category');
            isValid = false;
        }

        if (productQuantity === '' || parseInt(productQuantity) < 0) {
            this.showError('productQuantity', 'Quantity must be 0 or greater');
            isValid = false;
        }

        if (productPrice === '' || parseFloat(productPrice) < 0) {
            this.showError('productPrice', 'Price must be 0 or greater');
            isValid = false;
        }

        return isValid;
    }
};
